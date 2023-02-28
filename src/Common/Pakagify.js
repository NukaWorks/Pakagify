import { Octokit } from 'octokit'
import { v4 as uuidv4 } from 'uuid'
import fetch from 'node-fetch'
import { PackageModel } from './DataModels/PackageModel'
import { listFilesRecursively } from './Utils'
import AdmZip from 'adm-zip'
import { RepoModel } from './DataModels/RepoModel'
import fs from 'fs'

export class Pakagify {
  #ghToken = ''
  #user = null
  #reposData = new Map()
  #octokit = null

  constructor (token) {
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
        return await this.#octokit.rest.repos.uploadReleaseAsset({
          owner: user,
          repo: repoName,
          release_id: data.id,
          name: fileName,
          data: fileData,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(percentCompleted)
          }
        })
      }).catch(err => {
        console.error(err)
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
        return data
      })
  }

  async getPakRepositoryData (user, repoName) {
    return this.getLatestRelease(user, repoName)
      .then(async rel => {
        for (const asset of rel.assets) {
          if (asset.name === 'repo.json') {
          // Get the asset data
            return await fetch(`https://api.github.com/repos/${user}/${repoName}/releases/assets/${asset.id}`, {
              headers: { Authorization: 'Bearer ' + this.#ghToken, Accept: 'application/octet-stream' }
            }).then(res => res.json())
          }
        }
      })
  }

  async getPackageData (user, repoName, packageName) {
    return this.getPakRepositoryData(user, repoName).then(repo => {
      repo.packages.forEach(pkg => {
        if (pkg.name === packageName) {
          return pkg
        } else throw new Error('Package not found')
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
      for (const asset in release.assets) {
        if (asset.name === packageName) throw new Error('Package already exists')
      }
      packageModel.release_url = release.html_url

      // Make a zip file with adm-zip
      const zip = new AdmZip('', undefined)
      packageModel.files = listFilesRecursively(files)

      const prefix = '/Contents'

      files.forEach(dir => {
        if (fs.lstatSync(dir).isDirectory()) {
          zip.addLocalFolder(dir, prefix)
        } else zip.addLocalFile(dir, prefix)
      })

      zip.addFile('pak.json', Buffer.from(JSON.stringify(packageModel), 'utf8'), '', null)

      return zip.writeZipPromise(`${packageName}-${platform}_${arch}.pkg.zip`, null).then(() => {
        // TODO Impl optimized code for large upload

        // Fetch the repo data
        return this.getPakRepositoryData(user, repoName).then(async (repoData) => {
          // Checks if the package already exists on the repo, if so, delete it (in case of update)
          repoData.packages.forEach((value, index, array) => {
            if (value.name === packageName) array.splice(index, 1)
          })

          // Make a copy and patch the repo data
          const repoDataPatch = repoData
          repoDataPatch.packages.push(packageModel)
          repoDataPatch.last_updated = new Date().toISOString()

          // Upload the asset

          return this.deleteAsset(user, repoName, 'repo.json').then(async () => {
            return this.pushRepoData(user, repoName, `${packageName}-${platform}_${arch}.pkg.zip`, Buffer.from(fs.readFileSync(`${packageName}-${platform}_${arch}.pkg.zip`)))
              .then(async (asset) => {
                return await this.pushRepoData(user, repoName, 'repo.json', JSON.stringify(repoDataPatch))
              })
          })
        })
      })
    })
  }

  async deletePackage (user, repoName, packageName) {
    return this.getPakRepositoryData(user, repoName).then(repoData => {
      if (repoData.packages.length === 0) throw new Error('No packages found')
      return repoData.packages.forEach((value, index, array) => {
        if (packageName !== value.name) {
          throw new Error('Package not found')
        } else {
          array.splice(index, 1)
          return this.deleteAsset(user, repoName, 'repo.json').then(() => {
            return this.deleteAsset(user, repoName, `${packageName}-${value.platform}_${value.arch}.pkg.zip`).then(async () => {
              return await this.pushRepoData(user, repoName, 'repo.json', JSON.stringify(repoData))
            })
          })
        }
      })
    })
  }

  async deleteRelease (user, repoName) {
    return this.#octokit.rest.repos.getLatestRelease({ owner: user, repo: repoName })
      .then(async rel => {
        return await this.#octokit.rest.repos.deleteRelease({
          owner: user,
          repo: repoName,
          release_id: rel.data.id
        })
      })
  }

  async getLatestRelease (user, repoName) {
    return await this.#octokit.rest.repos.getLatestRelease({ owner: user, repo: repoName })
      .then(({ data }) => {
        return data
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