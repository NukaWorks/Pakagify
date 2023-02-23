import { Octokit } from 'octokit'
import { v4 as uuidv4 } from 'uuid'
import fetch from 'node-fetch'
import { PackageModel } from './Common/Models/PackageModel'
import { listFilesRecursively } from './Common/Utils'
import AdmZip from 'adm-zip'

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
          data: fileData
        })
      })
  }

  async deleteAsset (user, repoName, assetName) {
    return this.#octokit.rest.repos.get({ owner: user, repo: repoName })
      .then(async ({ data }) => {
        for (const asset of data.assets) {
          if (asset.name === assetName) {
            await this.#octokit.rest.repos.getReleaseAsset({
              owner: user,
              repo: repoName,
              asset_id: asset.id
            }).then(async (res) => {
              return res
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
    return this.#octokit.rest.repos.getLatestRelease({ owner: user, repo: repoName })
      .then(async ({ data }) => {
        for (const asset of data.assets) {
          if (asset.name === 'repo.json') {
          // Get the asset data
            return await fetch(`https://api.github.com/repos/${user}/${repoName}/releases/assets/${asset.id}`, {
              headers: { Authorization: 'Bearer ' + this.#ghToken, Accept: 'application/octet-stream' }
            }).then(res => res.json())
          }
        }
      })
  }

  async makePackage (user, repoName, packageName, version, description, installLocation, arch, platform, files, preInst, postInst, restartRequired) {
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
      console.debug(release)

      // Make a zip file with adm-zip
      const zip = new AdmZip('', undefined)
      const fileList = listFilesRecursively(files)
      packageModel.files = fileList

      fileList.forEach(file => {
        if (file.isDirectory()) zip.addLocalFolder(file, '/Contents')
        zip.addLocalFile(file, '/Contents')
      })

      zip.addFile('pak.json', Buffer.from(JSON.stringify(packageModel), 'utf8'), '', null)

      return zip.writeZipPromise(`${packageName}-${platform}_${arch}.zip`, null).then(() => {
        console.log(listFilesRecursively(files))
        return packageModel
      })

      // Fetch the repo data
      // return this.getPakRepositoryData(user, repoName).then(async (repoData) => {
      // })
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
