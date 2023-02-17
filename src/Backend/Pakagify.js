import { Octokit } from 'octokit'

export class Pakagify {
  #ghToken = ''
  #user = null
  #reposData = new Map()
  // #orgsData = new Map()
  // isRepoBuilt = false
  #octokit = null

  constructor (token) {
    this.#ghToken = token
    this.#octokit = new Octokit({ auth: token })
  }

  async createRepo (user, repoName, isPrivate) {
    return this.getUser().then(async res => {
      if (user === res.login || user === null) {
        return await this.#octokit.rest.repos.createForAuthenticatedUser({ name: repoName, private: isPrivate })
      } else {
        console.log(user, repoName, isPrivate)
        return await this.#octokit.rest.repos.createInOrg({ org: user, name: repoName, private: isPrivate })
      }
    })
  }

  async deleteRepo (user, repoName, isPrivate) {
    return this.getUser().then(async res => {
      if (user === res.login || user === null) {
        return await this.#octokit.rest.repos.delete({ owner: res.login, repo: repoName })
      } else {
        console.log(user, repoName, isPrivate)
        return await this.#octokit.rest.repos.createInOrg({ org: user, name: repoName, private: isPrivate })
      }
    })
  }

  async getUser (refresh) {
    if (!this.#user || refresh) {
      await this.#octokit.rest.users.getAuthenticated().then(res => {
        this.#user = res.data
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
    // return await (await (fetch(`${this.baseUrl}/users/${this.user.login}/orgs`, this.fetchParams))).json().then(async orgs => {
    //   orgs.forEach(async org => {
    //     if (!this.#orgsData.has(org.id)) this.#orgsData.set(org.id, org)
    //   })
    //   return this.#orgsData
    // })

    return await this.#octokit.rest.orgs.listForAuthenticatedUser()
  }
}
//   async buildRepoIndex () {
//     this.getOrgs().then(orgs => {
//       return orgs.forEach(async org => {
//         await this.getOrgRepos(org.login).then(async res => {
//           await res.forEach(repo => {
//             if (!this.#reposData.has(repo.id)) this.#reposData.set(repo.id, repo)
//           })
//           // return this.#reposData
//         })
//       })
//     })
//
//     await this.getUserRepos().then(res => {
//       res.forEach(repo => {
//         if (!this.#reposData.has(repo.id)) this.#reposData.set(repo.id, repo)
//       })
//     })
//   }
// }
