import chalk from 'chalk'
import ora from 'ora'
import { decodeToken, processData } from '../Utils'

export const authCmd = (token, configProvider, DEBUG_MODE) => {
  if (!token) {
    console.error(`${chalk.bold.redBright('Error')} Token is required.`)
    process.exit(1)
  }

  const spinner = ora('Authenticating ...').start()
  configProvider.set('token', Buffer.from(token).toString('base64'))
  processData(decodeToken(configProvider.get('token')))
    .getUser()
    .then((user) => {
      configProvider.save()
      spinner.succeed(
        `${chalk.bold.greenBright('Successfully')} authenticated as ${chalk.bold.white(user.login)} !`
      )
    })
    .catch((err) => {
      spinner.fail(
        `Unable to verify authentication token. Please try to ${chalk.bold.white('logout')} and ${chalk.bold.white(
          'login'
        )} again.`
      )
      DEBUG_MODE && console.error(err)
      process.exit(1)
    })
}
