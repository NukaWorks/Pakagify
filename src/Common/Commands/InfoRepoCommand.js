import chalk from 'chalk'
import ora from 'ora'
import { decodeToken, processData } from '../Utils'

export const infoRepoCmd = (type, name, options, configProvider, DEBUG_MODE) => {
  let userAndName = name.split('/')

  if (!configProvider.has('token')) {
    console.error(`${chalk.bold.redBright('Error')} You need to authenticate first.`)
    process.exit(1)
  }

  if (type === 'repository') {
    const spinner = ora('Retrieving repository data...').start()
    processData(decodeToken(configProvider.get('token')))
      .getUser()
      .then((user) => {
        // Check if no org user specified
        if (userAndName.length <= 1) {
          userAndName[0] = user.login
          userAndName[1] = name
        }

        processData(decodeToken(configProvider.get('token')))
          .getPakRepositoryData(userAndName[0], userAndName[1])
          .then((res) => {
            spinner.succeed(`Repository ${chalk.bold.white(res.name)} found !`)
            console.log(res)
          })
          .catch((err) => {
            console.error(`${chalk.bold.redBright('Error')} while getting repository data: ${err.message}`)
            DEBUG_MODE && console.error(err)
            process.exit(1)
          })
      })
  } else {
    if (!options.repository) {
      console.error(`${chalk.bold.redBright('Error')} You need to specify the repository.`)
      process.exit(1)
    }

    const spinner = ora('Retrieving package data...').start()
    processData(configProvider.get('token'))
      .getUser()
      .then((user) => {
        userAndName = options.repository.split('/')

        // Check if no org user specified
        if (userAndName.length <= 1) {
          userAndName[0] = user.login
          userAndName[1] = options.repository
        }

        processData(decodeToken(configProvider.get('token')))
          .getPackageData(userAndName[0], userAndName[1], name)
          .then((res) => {
            spinner.succeed(`Package ${chalk.bold.white(res.name)} found !`)
            console.log(res)
          })
          .catch((err) => {
            console.error(`${chalk.bold.redBright('Error')} while getting package data: ${err.message}`)
            DEBUG_MODE && console.error(err)
            process.exit(1)
          })
      })
  }
}
