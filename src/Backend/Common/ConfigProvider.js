import fs from 'fs'
import * as path from 'path'

const CONFIG_DIR = path.join(process.env.HOME, '.config/pakagify/')

class ConfigProvider {
  constructor () {
    this._config = {}
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
    const configFile = path.join(CONFIG_DIR, 'pcli.json')
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true })
    fs.writeFileSync(configFile, JSON.stringify(this._config, null, 2)) // TODO Impl locks
  }
}
export { ConfigProvider }
