import chalk from 'chalk'
import ora from 'ora'
import { decodeToken, processData } from '../Utils'

export const whoamiCmd = (configProvider, DEBUG_MODE) => {
  if (!configProvider.has('token')) {
    console.error(`${chalk.bold.redBright('Error')} You need to authenticate first.`)
    process.exit(1)
  }

  const spinner = ora('Retrieving user profile...').start()
  processData(decodeToken(configProvider.get('token')))
    .getUser()
    .then((user) => {
      spinner.succeed(`You are currently authenticated as ${chalk.bold.white(user.login)} !`)
    })
    .catch((err) => {
      spinner.fail(
        `${chalk.bold.redBright('Error')} Unable to verify authentication token. Please try to ${chalk.bold.white(
          'logout'
        )} and ${chalk.bold.white('login')} again.`
      )
      DEBUG_MODE && console.error(err)
      process.exit(1)
    })
}
