import fs from 'fs'
import * as path from 'path'

const CONFIG_DIR = process.platform === 'windows'
  ? path.join(process.env.APPDATA, 'pakagify/')
  : path.join(process.env.HOME, '.config/pakagify/')
const CONFIG_FILE = path.join(CONFIG_DIR, 'pkcli.json')

class ConfigProvider {
  constructor () {
    this._config = {}
    this.retrieve()
  }

  set (key, value) {
    this._config[key] = value
  }

  get (key) {
    return this._config[key]
  }

  has (key) {
    // eslint-disable-next-line no-prototype-builtins
    return this._config.hasOwnProperty(key)
  }

  remove (key) {
    delete this._config[key]
  }

  clear () {
    this._config = {}
  }

  save () {
    // Save the json config
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true })
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this._config, null, 2)) // TODO Impl locks
  }

  retrieve () {
    // Retrieve the json config
    if (!fs.existsSync(CONFIG_FILE)) this.save()
    this._config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
  }
}
export { ConfigProvider }
