import chalk from 'chalk'
import { decodeToken, formatTime, processData } from '../Utils'
import ora from 'ora'

export const retrieveCmd = (type, name, configProvider, DEBUG_MODE) => {
  if (!name) {
    console.error(`${chalk.bold.redBright('Error')} You need to specify the repository.`)
    process.exit(1)
  }

  const userAndName = name.split('/')

  if (!configProvider.has('token')) {
    console.error(`${chalk.bold.redBright('Error')} You need to authenticate first.`)
    process.exit(1)
  }

  processData(decodeToken(configProvider.get('token')))
    .getUser()
    .then((user) => {
      if (type === 'repository') {
        // Check if no org user specified
        if (userAndName.length <= 1) {
          userAndName[0] = user.login
          userAndName[1] = name
        }

        const spinner = ora('Downloading repository...').start()
        processData(decodeToken(configProvider.get('token')))
          .on('downloadProgress', (progress, bitrate, time, fileName) => {
            spinner.text = `Downloading ${fileName}... ${chalk.grey(
              `${formatTime(time)} remaining, ${bitrate}`
            )} ${chalk.bold.white(`${progress} %`)}`
          })

        processData(decodeToken(configProvider.get('token')))
          .downloadRepoData(userAndName[0], userAndName[1], DEBUG_MODE)
          .then((res) => {
            spinner.succeed(
              `${chalk.bold.greenBright('Successfully')} downloaded ${chalk.bold.white(userAndName[1])} !`
            )
            DEBUG_MODE && console.debug(res)
          })
          .catch((err) => {
            spinner.fail(`Error while downloading repository: ${err.message}`)
            DEBUG_MODE && console.error(err)
            process.exit(1)
          })
      } else {
        console.error('Invalid type.')
        process.exit(1)
      }
    })
}
