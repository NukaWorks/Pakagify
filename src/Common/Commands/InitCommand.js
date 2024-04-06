import chalk from 'chalk'
import { decodeToken, formatTime, processData, validateArch, validatePlatform } from '../Utils'
import ora from 'ora'

export const initCmd = (type, name, options, configProvider, DEBUG_MODE) => {
  if (!name) {
    console.error(`${chalk.bold.redBright('Error')} You need to specify the repository.`)
    process.exit(1)
  }

  let userAndName = name.split('/')

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
          .makeRepository(userAndName[0], userAndName[1], DEBUG_MODE, true)
          .then((res) => {
            spinner.succeed(
              `${chalk.bold.greenBright('Successfully')} created repository ${chalk.bold.white(res.repo.name)} !`
            )
            DEBUG_MODE && console.debug(res)
          })
          .catch((err) => {
            spinner.fail(`Error while creating repository: ${err.message}`)
            DEBUG_MODE && console.error(err)
            process.exit(1)
          })
      } else if (type === 'package') {
        userAndName = options.repository.split('/')

        // Check if no org user specified
        if (userAndName.length <= 1) {
          userAndName[0] = user.login
          userAndName[1] = options.repository
        }

        switch (!options) {
          case options.repository: {
            console.error(`${chalk.bold.redBright('Error')} You need to specify the repository.`)
            return process.exit(1)
          }

          case options.version: {
            console.error(`${chalk.bold.redBright('Error')} You need to specify the version.`)
            return process.exit(1)
          }

          case options.arch: {
            console.error(`${chalk.bold.redBright('Error')} You need to specify the architecture.`)
            return process.exit(1)
          }

          case options.platform: {
            console.error(`${chalk.bold.redBright('Error')} You need to specify the platform.`)
            return process.exit(1)
          }

          case options.installLocation: {
            console.error(`${chalk.bold.redBright('Error')} You need to specify the install location.`)
            return process.exit(1)
          }
        }

        // Check if platform is valid
        validatePlatform(options.platform)

        // Check if arch is valid
        validateArch(options.arch)

        const spinner = ora('Creating package...').start()

        processData(decodeToken(configProvider.get('token')))
          .on('uploadProgress', (progress, bitrate, time) => {
            spinner.text = `Uploading package... ${chalk.grey(
              `${formatTime(time)} remaining, ${bitrate}`
            )} ${chalk.bold.white(`${progress} %`)}`
          })

        processData(decodeToken(configProvider.get('token')))
          .makePackage(
            userAndName[0],
            userAndName[1],
            name,
            options.version,
            options.description,
            options.installLocation,
            options.arch,
            options.platform,
            options.dirs,
            options.preinst,
            options.postinst,
            options.restartRequired
          )
          .then((r) => {
            spinner.succeed(
              `${chalk.bold.greenBright('Successfully')} created package ${chalk.bold.white(name)} ${chalk.grey(
                `(${options.version}, ${options.arch}, ${options.platform})`
              )} !`
            )
            DEBUG_MODE && console.debug(r)
          })
          .catch((err) => {
            spinner.fail(`Error while creating package: ${err.message}`)
            DEBUG_MODE && console.error(err)
            process.exit(1)
          })
      } else {
        console.error('Invalid type.')
        process.exit(1)
      }
    })
}
