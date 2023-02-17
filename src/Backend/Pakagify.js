import { EventEmitter } from 'events'
import fetch from 'node-fetch'
import { Octokit } from 'octokit'

export class Pakagify extends EventEmitter {
  baseUrl = 'https://api.github.com'
  ghToken = ''
  fetchParams = {}
  user = {}
  #reposData = new Map()
  orgsData = new Map()
  isReady = false
  isRepoBuilt = false

  constructor (token) {
    super()
    this.ghToken = token

    this.fetchParams = {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }

    this.octokit = new Octokit({ auth: token })

    this.getUser().then(res => {
      this.user = res
      this.isReady = true
      this.buildRepoIndex().then(() => {
        this.isRepoBuilt = true
        this.emit('ready')
      })
    })
  }

  async createRepo (user, name, isPrivate) {
    return await this.octokit.rest.repos.createForAuthenticatedUser({ name, private: isPrivate })
  }

  async getUser () {
    return await this.octokit.rest.users.getAuthenticated()
  }

  async getUserRepos () {
    if (this.isReady) return (await fetch(`${this.baseUrl}/users/${this.user.login}/repos`, this.fetchParams)).json()
    else throw new Error('Pakagify not ready yet.')
  }

  async getOrgRepos (name) {
    if (this.isReady) return (await fetch(`${this.baseUrl}/orgs/${name}/repos`, this.fetchParams)).json()
    else throw new Error('Pakagify not ready yet.')
  }

  getRepoData () {
    return this.#reposData
  }

  async getOrgs () {
    if (this.isReady) {
      return await (await (fetch(`${this.baseUrl}/users/${this.user.login}/orgs`, this.fetchParams))).json().then(async orgs => {
        orgs.forEach(async org => {
          if (!this.orgsData.has(org.id)) this.orgsData.set(org.id, org)
        })
        return this.orgsData
      })
    } else throw new Error('Pakagify not ready yet.')
  }

  async buildRepoIndex () {
    if (!this.isReady) {
      throw new Error('Pakagify not ready yet.')
    } else {
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
}
