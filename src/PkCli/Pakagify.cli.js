import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from '../Common/ConfigProvider'
import { Pakagify } from '../Common/Pakagify'
import chalk from 'chalk'
import ora from 'ora'
import { formatTime } from '../Common/Utils'

const configProvider = new ConfigProvider()
let DEBUG_MODE = false

function processData (token) {
  if (!processData.instance) processData.instance = new Pakagify(token)
  return processData.instance
}

function validateArch (arch) {
  // Check if arch is valid
  if (
    arch !== 'x86' &&
    arch !== 'x64' &&
    arch !== 'armv7' &&
    arch !== 'arm64' &&
    arch !== 'noarch'
  ) {
    console.error(`${chalk.bold.redBright('Error')} Invalid architecture.`)
    return false
  }
}

function validatePlatform (platform) {
  // Check if platform is valid
  if (
    platform !== 'linux' &&
    platform !== 'windows' &&
    platform !== 'darwin' &&
    platform !== 'any'
  ) {
    console.error(`${chalk.bold.redBright('Error')} Invalid platform.`)
    return false
  }
}

function decodeToken (token) {
  return Buffer.from(token, 'base64').toString('utf8')
}

function mainCommand (argv) {
  // Debug mode
  argv.forEach((arg) => {
    if (arg.match('-D')) DEBUG_MODE = true
  })

  program
    .name('pkcli')
    .description(
      'Pakagify CLI\n             ///////////////////////////////////            \n' +
      '      /////////////////////////////////////////////////     \n' +
      '   //////////////////////////////////////////////////////*  \n' +
      '  ///////////////////////////////////////////////////////// \n' +
      ' ///////////////////////////////////////////////////////////\n' +
      '////////////////////////////////////////////////////////////\n' +
      '////////////////////////////////////////////////////////////\n' +
      '//////////////////////////////////@@@@@/////////////////////\n' +
      '////////////@@@@@@@@@@@@@@@@//////@@@@@/////////////////////\n' +
      '////////////@@@@@//////*@@@@@@////@@@@@/////////////////////\n' +
      '////////////@@@@@////////*@@@@@///@@@@@/////////////////////\n' +
      '////////////@@@@@////////@@@@@@///@@@@@/////%@@@@@//////////\n' +
      '////////////@@@@@@@@@@@@@@@@@@////@@@@@///%@@@@@////////////\n' +
      '////////////@@@@@@@@@@@@@@@*//////@@@@@/#@@@@@//////////////\n' +
      '////////////@@@@@/////////////////@@@@@@@@@@@///////////////\n' +
      '////////////@@@@@/////////////////@@@@@//@@@@@@/////////////\n' +
      '////////////@@@@@/////////////////@@@@@////@@@@@@///////////\n' +
      '////////////@@@@@/////////////////@@@@@//////@@@@@@/////////\n' +
      '////////////////////////////////////////////////////////////\n' +
      '////////////////////////////////////////////////////////////\n' +
      ' ///////////////////////////////////////////////////////////\n' +
      '  ///////////////////////////////////////////////////////// \n' +
      '   //////////////////////////////////////////////////////.  \n' +
      '      /////////////////////////////////////////////////     \n' +
      '             ///////////////////////////////////            \n'
    )
    .version(version)
    .option('-D, --debug', 'Debug mode')

  program
    .command('auth <token>')
    .description('Authenticate with Github Token.')
    .action((token) => {
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
    })

  program
    .command('logout')
    .description('Logout from Pakagify CLI.')
    .action(() => {
      configProvider.remove('token')
      configProvider.save()
      console.log('Successfully logged out.')
    })

  program
    .command('whoami')
    .description('Get the current authenticated user.')
    .action(() => {
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
    })

  program
    .command('info <type> <name>')
    .description('Get info about a repository, package...')
    .option('-R, --repository <repository>', 'Select the repository for the package')
    .action((type, name, options) => {
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
    })

  program
    .command('create <type> <name>')
    .description('Create a repository, package ...')
    .option('-v, --version <version>', 'Version of the package')
    .option('-a, --arch <arch>', 'Architecture of the package')
    .option('-p, --platform <platform>', 'Platform of the package')
    .option('-i, --install-location <installLocation>', 'Install location of the package')
    .option('-R, --repository <repository>', 'Select the repository for the package')
    .option('-e, --dirs <dirs...>', 'Directories to include in the package')
    .option('-n', '--no-keep', 'Delete the generated package on the local directory')
    .option('-d, --description <description>', 'Description of the package')
    .option('-r, --restart-required', 'Restart required of the package')
    .option('-preinst, --preinst <preinst>', 'Preinstall Script')
    .option('-postinst, --postinst <postinst>', 'Postinstall Script')
    .action((type, name, options) => {
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

            const spinner = ora('Creating repository...').start()
            processData(decodeToken(configProvider.get('token')))
              .makeRepository(userAndName[0], userAndName[1])
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
                options.dirs
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
    })

  program
    .command('delete <type> <name>')
    .description('Delete a repository, package ...')
    .option('-R, --repository <repository>', 'Select the repository for the package to delete')
    .option('-a, --arch <arch>', 'Architecture of the package')
    .option('-p, --platform <platform>', 'Platform of the package')
    .action((type, name, options) => {
      let userAndName = name.split('/')

      if (!configProvider.has('token')) {
        console.error(`${chalk.bold.redBright('Error')} You need to authenticate first.`)
        process.exit(1)
      }

      processData(decodeToken(configProvider.get('token')))
        .getUser()
        .then((user) => {
          // Check if no org user specified
          if (userAndName.length <= 1) {
            userAndName[0] = user.login
            userAndName[1] = name
          }

          if (type === 'repository') {
            let latestReleaseTag = processData(decodeToken(configProvider.get('token')))
              .getLatestRelease(userAndName[0], userAndName[1])
              .then((rel) => {
                latestReleaseTag = rel.tag_name
              })
              .catch((err) => {
                spinner.fail(
                  `${chalk.bold.redBright('Error')} while deleting the repository ${name} ${
                    err.message && `(${err.message})`
                  }`
                )
                DEBUG_MODE && console.error(err)
                process.exit(1)
              })

            const spinner = ora('Deleting repository...').start()
            processData(decodeToken(configProvider.get('token')))
              .deleteRelease(userAndName[0], userAndName[1], true)
              .then((res) => {
                spinner.succeed(
                  `${chalk.bold.greenBright('Successfully')} deleted repository ${chalk.bold.white(name)} ${chalk.grey(
                    `(${latestReleaseTag})`
                  )} !`
                )
                DEBUG_MODE && console.debug(res)
              })
              .catch((err) => {
                spinner.fail(
                  `${chalk.bold.redBright('Error')} while deleting repository ${chalk.bold.white(name)} - ${chalk.grey(
                    `(${err.status})`
                  )} !`
                )
                DEBUG_MODE && console.debug(err)
                process.exit(1)
              })
          } else if (type === 'package') {
            switch (!options) {
              case options.arch: {
                console.error(`${chalk.bold.redBright('Error')} You need to specify the architecture.`)
                return process.exit(1)
              }

              case options.platform: {
                console.error(`${chalk.bold.redBright('Error')} You need to specify the platform.`)
                return process.exit(1)
              }
            }

            userAndName = options.repository.split('/')

            // Check if no org user specified
            if (userAndName.length <= 1) {
              userAndName[0] = user.login
              userAndName[1] = options.repository
            }

            if (!configProvider.has('token')) {
              console.error(`${chalk.bold.redBright('Error')} You need to authenticate first.`)
              process.exit(1)
            }

            switch (!options) {
              case options.repository: {
                console.error(`${chalk.bold.redBright('Error')} You need to specify the repository.`)
                return process.exit(1)
              }
            }

            const spinner = ora('Deleting package...').start()
            processData(decodeToken(configProvider.get('token')))
              .deletePackage(userAndName[0], userAndName[1], name, options.arch, options.platform)
              .then((res) => {
                spinner.succeed(
                  `${chalk.bold.greenBright('Successfully')} deleted package ${chalk.bold.white(userAndName[1])} !`
                )
                DEBUG_MODE && console.debug(res)
              })
              .catch((err) => {
                spinner.fail(
                  `${chalk.bold.redBright('Error')} while deleting package ${chalk.bold.white(userAndName[1])} !`
                )
                DEBUG_MODE && console.debug(err)
              })
          } else {
            console.error('Invalid type.')
            process.exit(1)
          }
        })
    })

  program.parse(argv)
}

mainCommand(process.argv)
