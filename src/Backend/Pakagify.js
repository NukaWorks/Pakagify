import { EventEmitter } from 'events'

export class Pakagify extends EventEmitter {
  baseUrl = 'https://api.github.com'
  ghToken = ''
  fetchParams = {}
  user = {}
  isReady = false
  constructor (token) {
    super()
    this.ghToken = token

    this.fetchParams = {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }

    this._getUser().then(res => {
      this.user = res
      this.isReady = true
      this.emit('ready', this)
    })
  }

  async _getUser () {
    return (await fetch(`${this.baseUrl}/user`, this.fetchParams)).json()
  }

  async getRepos () {
    if (this.isReady) return (await fetch(`${this.baseUrl}/users/${this.user.login}/repos`, this.fetchParams)).json()
    else throw new Error('Pakagify not ready yet.')
  }
}
