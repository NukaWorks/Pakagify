import { Octokit } from 'octokit'
import { v4 as uuidv4 } from 'uuid'
import { PackageModel } from './DataModels/PackageModel'
import { calculateBitrate, listFilesRecursively } from './Utils'
import AdmZip from 'adm-zip'
import { RepoModel } from './DataModels/RepoModel'
import fs from 'fs'
import axios from 'axios'
import { EventEmitter } from 'events'
import * as path from 'path'

export class Pakagify extends EventEmitter {
  #ghToken = ''
  #user = null
  #reposData = new Map()
  #octokit = null

  constructor (token) {
    super()
    this.#ghToken = token
    this.#octokit = new Octokit({ auth: token })
  }

  async createRelease (user, repoName) {
    const uuid = uuidv4().split('-')[1] // Generate & Get the first part of the uuid
    return await this.#octokit.rest.repos.createRelease({ owner: user, repo: repoName, tag_name: uuid })
      .then(({ data }) => {
        return data
      })
  }

  async pushRepoData (user, repoName, fileName, fileData) {
    return this.#octokit.rest.repos.getLatestRelease({ owner: user, repo: repoName })
      .then(async ({ data }) => {
        const url = `https://uploads.github.com/repos/${user}/${repoName}/releases/${data.id}/assets?name=${fileName}`
        const fileStream = Buffer.from(fileData)
        const fileSize = Buffer.byteLength(fileStream)

        const axiosOpts = {
          headers: { Authorization: 'Bearer ' + this.#ghToken, 'Content-Type': 'application/octet-stream', 'Content-Length': fileSize },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            const bitrate = calculateBitrate(progressEvent.rate, progressEvent.estimated / 1000)
            this.emit('uploadProgress', percentCompleted, bitrate, progressEvent.estimated)
          },
          maxRedirects: 0 // avoid buffering the entire stream
        }

        return await axios.post(url, fileStream, axiosOpts)
          .then(response => {
            if (response.status !== 201) throw new Error(response.statusText)
            return response
          })
          .catch(error => {
            if (error.response.status === 422) throw new Error('Asset already exists')
            else throw new Error('Error uploading asset: ' + error)
          })
      }).catch(err => {
        throw new Error(err)
      })
  }

  async deleteAsset (user, repoName, assetName) {
    return this.getLatestRelease(user, repoName)
      .then(async rel => {
        for (const asset of rel.assets) {
          if (asset.name === assetName) {
            await this.#octokit.rest.repos.deleteReleaseAsset({
              owner: user,
              repo: repoName,
              asset_id: asset.id
            }).then(async (res) => {
              return res
            }).catch(err => {
              console.error(err)
            })
          }
        }
      })
  }

  async getGitRepositoryData (user, repoName) {
    return this.#octokit.rest.repos.get({ owner: user, repo: repoName })
      .then(async ({ data }) => {
        if (data.status === 404) throw new Error(`Repository ${repoName} not found for user ${user}`)
        return data
      })
      .catch(err => {
        throw new Error(`Error fetching the repo data (${err.message}): ERR_CODE: ${err.status}`)
      })
  }

  async getPakRepositoryData (user, repoName) {
    const axiosOpts = {
      headers: { Authorization: 'Bearer ' + this.#ghToken, Accept: 'application/octet-stream' }
    }

    return this.getLatestRelease(user, repoName)
      .then(async rel => {
        for (const asset of rel.assets) {
          if (asset.name === 'repo.json') {
          // Get the asset data
            return await axios.get(`https://api.github.com/repos/${user}/${repoName}/releases/assets/${asset.id}`, axiosOpts)
              .then(res => {
                return res.data
              })
              .catch(err => {
                throw new Error(`Error fetching the repo.json file (${err.message}): ERR_CODE: ${err.status}`)
              })
          }
        }
      })
  }

  async getPackageData (user, repoName, packageName) {
    return this.getPakRepositoryData(user, repoName).then(repo => {
      repo.packages.forEach(pkg => {
        if (pkg.name === packageName) {
          return pkg
        } else throw new Error(`Package not found (${packageName})`)
      })
    })
  }

  async makeRepository (user, repoName, isDebug) {
    return this.getGitRepositoryData(user, repoName)
      .then(repo => {
        const repoModel = RepoModel
        repoModel.name = repo.name
        repoModel.description = repo.description
        repoModel.author = repo.owner.login
        repoModel.url = repo.html_url
        repoModel.last_updated = new Date().toISOString()
        repoModel.created_at = new Date().toISOString()
        repoModel.license = repo.license

        isDebug && console.debug(repo)

        return this.createRelease(user, repoName, true)
          .then(async rel => {
            isDebug && console.debug(rel)

            return await this.pushRepoData(user, repoName, 'repo.json',
              JSON.stringify(RepoModel)).then(push => {
              isDebug && console.debug(push)

              // Group the data
              push.asset = push.data
              delete push.data
              push.release = rel
              push.repo = repo

              return push
            })
          })
      }).catch(err => {
        console.error(err)
        process.exit(1)
      })
  }

  async makePackage (
    user,
    repoName,
    packageName,
    version,
    description,
    installLocation,
    arch,
    platform,
    files,
    preInst,
    postInst,
    restartRequired
  ) {
    const packageModel = PackageModel
    packageModel.name = packageName
    packageModel.version = version
    packageModel.arch = arch || process.arch
    packageModel.description = description || ''
    packageModel.install_location = installLocation
    packageModel.platform = platform || process.platform
    packageModel.author = user
    packageModel.restart_required = restartRequired || false
    packageModel.scripts.pre_inst = preInst || ''
    packageModel.scripts.post_inst = postInst || ''
    packageModel.last_updated = new Date().toISOString()
    packageModel.created_at = new Date().toISOString()

    return await this.getLatestRelease(user, repoName).then(async (release) => {
      const _pkName = `${packageName}-${platform}_${arch}.pkg.zip`
      for (const asset of release.assets) {
        if (asset.name === _pkName) throw new Error(`Package already exists (${packageName})`)
      }
      packageModel.release_url = release.html_url
      packageModel.download_url = `${release.html_url}/download/${_pkName}`

      // Make a zip file with adm-zip
      const zip = new AdmZip('', undefined)
      packageModel.files = listFilesRecursively(files)

      const prefix = '/Contents'

      files.forEach(dir => {
        if (fs.lstatSync(dir).isDirectory()) {
          zip.addLocalFolder(dir, path.join(prefix, dir))
        } else zip.addLocalFile(dir, prefix)
      })

      zip.addFile('pak.json', Buffer.from(JSON.stringify(packageModel), 'utf8'), '', null)

      return zip.writeZipPromise(`${packageName}-${platform}_${arch}.pkg.zip`, null).then(() => {
        // Fetch the repo data
        return this.getPakRepositoryData(user, repoName).then(async (repoData) => {
          // Checks if the package already exists on the repo, if so, delete it (in case of update)
          repoData.packages.forEach((value, index, array) => {
            if (
              value.name === packageModel.name &&
              value.platform === packageModel.platform &&
              value.arch === packageModel.arch
            ) array.splice(index, 1) // Remove the package from the array
          })

          // Make a copy and patch the repo data
          const repoDataPatch = repoData
          repoDataPatch.packages.push(packageModel)
          repoDataPatch.last_updated = new Date().toISOString()

          // Upload the asset
          return this.pushRepoData(user, repoName,
            `${packageName}-${platform}_${arch}.pkg.zip`, Buffer.from(fs.readFileSync(`${packageName}-${platform}_${arch}.pkg.zip`)))
            .then(() => {
              return this.deleteAsset(user, repoName, 'repo.json').then(async () => {
                return await this.pushRepoData(user, repoName, 'repo.json', JSON.stringify(repoDataPatch))
              })
            })
            .catch(err => {
              throw new Error(`Error uploading the package (${packageName}) - ${err.message}`)
            })
        })
      })
    })
  }

  async deletePackage (user, repoName, packageName, arch, platform) {
    return this.getPakRepositoryData(user, repoName).then(repoData => {
      if (repoData.packages.length === 0) throw new Error('No packages found')

      const _pkg = []
      repoData.packages.forEach((value, index, array) => {
        if (packageName === value.name || (packageName === value.name || arch === value.arch || platform === value.platform)) array.splice(index, 1) && _pkg.push(value)
      })

      if (_pkg.length > 1) throw new Error(`Multiple packages found (${packageName}) ${JSON.stringify(_pkg)}`)
      if (_pkg.length <= 0) throw new Error(`Package not found (${packageName})`)
      else {
        return this.deleteAsset(user, repoName, `${packageName}-${_pkg.platform}_${_pkg.arch}.pkg.zip`).then(async () => {
          return this.deleteAsset(user, repoName, 'repo.json').then(async () => {
            return await this.pushRepoData(user, repoName, 'repo.json', JSON.stringify(repoData))
          })
        })
      }
    })
  }

  async deleteRelease (user, repoName) {
    return this.#octokit.rest.repos.getLatestRelease({ owner: user, repo: repoName })
      .then(async rel => {
        if (rel.status !== 200) throw new Error('Unable to delete the repository')
        return await this.#octokit.rest.repos.deleteRelease({
          owner: user,
          repo: repoName,
          release_id: rel.data.id
        })
      })
      .catch(err => {
        throw new Error(`Unable to delete the repository, maybe it's not exist? (${err.message}): ERR_CODE: ${err.status}`)
      })
  }

  async getLatestRelease (user, repoName) {
    return await this.#octokit.rest.repos.getLatestRelease({ owner: user, repo: repoName })
      .then((rel) => {
        if (rel.status !== 200) throw new Error('Release not found')
        return rel.data
      })
      .catch(err => {
        throw new Error(`Unable to get the latest release, maybe it's not exist? (${err.message}): ERR_CODE: ${err.status}`)
      })
  }

  async getUser (refresh) {
    if (!this.#user || refresh) {
      await this.#octokit.rest.users.getAuthenticated()
        .then(({ data }) => {
          this.#user = data
        })
    }

    return this.#user
  }

  async getUserRepos () {
    return await this.#octokit.rest.repos.listForAuthenticatedUser()
  }

  async getOrgRepos (org) {
    return await this.#octokit.rest.repos.listForOrg({ org })
  }

  getRepoData () {
    return this.#reposData
  }

  async getOrgs () {
    return await this.#octokit.rest.orgs.listForAuthenticatedUser()
  }
}
