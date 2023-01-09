
export class Pakagify {
  baseUrl = 'https://api.github.com'
  ghToken = ''
  fetchParams = {}
  user = {}
  constructor (token) {
    this.ghToken = token

    this.fetchParams = {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }

    this._getUser().then(res => {
      this.user = res
    })
  }

  async _getUser () {
    return (await fetch(`${this.baseUrl}/user`, this.fetchParams)).json()
  }

  async getRepos () {
    return (await fetch(`${this.baseUrl}/users/${this.user.login}`, this.fetchParams)).json()
  }
}
