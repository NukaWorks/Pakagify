import fetch from 'node-fetch'
import { Octokit } from 'octokit'

export class Pakagify {
  baseUrl = 'https://api.github.com'
  ghToken = ''
  fetchParams = {}
  user = null
  #reposData = new Map()
  #orgsData = new Map()
  isRepoBuilt = false

  constructor (token) {
    this.ghToken = token
    this.octokit = new Octokit({ auth: token })
  }

  async createRepo (user, name, isPrivate) {
    return this.getUser().then(async res => {
      if (user === res.login || user === null) {
        return await this.octokit.rest.repos.createForAuthenticatedUser({ name, private: isPrivate })
      } else {
        console.log(user, name, isPrivate)
        return await this.octokit.rest.repos.createInOrg({ org: user, name, private: isPrivate })
      }
    })
  }

  async getUser (refresh) {
    if (!this.user || refresh) {
      await this.octokit.rest.users.getAuthenticated().then(res => {
        this.user = res.data
      })
    }

    return this.user
  }

  async getUserRepos () {
    return (await fetch(`${this.baseUrl}/users/${this.user.login}/repos`, this.fetchParams)).json()
  }

  async getOrgRepos (name) {
    return (await fetch(`${this.baseUrl}/orgs/${name}/repos`, this.fetchParams)).json()
  }

  getRepoData () {
    return this.#reposData
  }

  async getOrgs () {
    return await (await (fetch(`${this.baseUrl}/users/${this.user.login}/orgs`, this.fetchParams))).json().then(async orgs => {
      orgs.forEach(async org => {
        if (!this.#orgsData.has(org.id)) this.#orgsData.set(org.id, org)
      })
      return this.#orgsData
    })
  }

  async buildRepoIndex () {
    this.getOrgs().then(orgs => {
      return orgs.forEach(async org => {
        await this.getOrgRepos(org.login).then(async res => {
          await res.forEach(repo => {
            if (!this.#reposData.has(repo.id)) this.#reposData.set(repo.id, repo)
          })
          // return this.#reposData
        })
      })
    })

    await this.getUserRepos().then(res => {
      res.forEach(repo => {
        if (!this.#reposData.has(repo.id)) this.#reposData.set(repo.id, repo)
      })
    })
  }
}
