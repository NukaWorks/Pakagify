import { Octokit } from 'octokit'
import { v4 as uuidv4 } from 'uuid'

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
    return this.getUser().then(async res => {
      const uuid = uuidv4().split('-')[1] // Generate & Get the first part of the uuid
      return await this.#octokit.rest.repos.createRelease({ owner: user || res.login, repo: repoName, tag_name: uuid }).then(({ data }) => {
        return data
      })
    })
  }

  async pushRepoData (user, repoName, fileName, fileData) {
    return this.getUser().then(async res => {
      return this.#octokit.rest.repos.getLatestRelease({ owner: user || res.login, repo: repoName }).then(async ({ data }) => {
        return await this.#octokit.rest.repos.uploadReleaseAsset({
          owner: user || res.login,
          repo: repoName,
          release_id: data.id,
          name: fileName,
          data: fileData
        })
      })
    })
  }

  async getRepositoryData (user, repoName) {
    return this.getUser().then(async res => {
      return this.#octokit.rest.repos.get({ owner: user || res.login, repo: repoName }).then(async ({ data }) => {
        return data
      })
    })
  }

  async deleteRelease (user, repoName) {
    return this.getUser().then(async res => {
      return this.#octokit.rest.repos.getLatestRelease({ owner: user || res.login, repo: repoName }).then(async rel => {
        return await this.#octokit.rest.repos.deleteRelease({
          owner: user || res.login,
          repo: repoName,
          release_id: rel.data.id
        })
      })
    })
  }

  async getLatestRelease (user, repoName) {
    return this.getUser().then(async res => {
      return await this.#octokit.rest.repos.getLatestRelease({ owner: user || res.login, repo: repoName }).then(({ data }) => {
        return data
      })
    })
  }

  async getUser (refresh) {
    if (!this.#user || refresh) {
      await this.#octokit.rest.users.getAuthenticated().then(({ data }) => {
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
