import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from '../Common/ConfigProvider'
import { Pakagify } from '../Common/Pakagify'
import chalk from 'chalk'

const configProvider = new ConfigProvider()
let DEBUG_MODE = false
function processData (token) {
  if (!processData.instance) processData.instance = new Pakagify(token)
  return processData.instance
}

function decodeToken (token) {
  return Buffer.from(token, 'base64').toString('utf8')
}

function mainCommand (argv) {
  // argv.forEach(arg => {
  //   if (arg.length <= 0 || (arg.match('-h') || arg.match('help'))) {
  //     console.log('// TODO ASCII pkcli logo')
  //   }
  // })

  argv.forEach(arg => {
    if ((arg.match('-D'))) DEBUG_MODE = true
  })

  program
    .name('pkcli')
    .description('Pakagify CLI')
    .version(version)
    .option('-D, --debug', 'Debug mode')

  program.command('auth <token>')
    .description('Authenticate with Github Token.')
    .action(token => {
      if (!token) {
        console.error('Token is required.')
        process.exit(1)
      }

      configProvider.set('token', Buffer.from(token).toString('base64'))

      processData(decodeToken(configProvider.get('token')))
        .getUser()
        .then(user => {
          configProvider.save()
          console.log(`${chalk.bold.greenBright('Successfully')} authenticated as ${chalk.bold.white(user.login)} !`)
        }).catch(err => {
          console.error(err)
          process.exit(1)
        })
    })

  program.command('logout')
    .description('Logout from Pakagify CLI.')
    .action(() => {
      configProvider.remove('token')
      configProvider.save()
      console.log('Successfully logged out.')
    })

  program.command('whoami')
    .description('Get the current authenticated user.')
    .action(() => {
      if (!configProvider.has('token')) {
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      processData(decodeToken(configProvider.get('token')))
        .getUser()
        .then(user => {
          console.log(`You are currently authenticated as ${chalk.bold.white(user.login)} !`)
        }).catch(err => {
          console.error(err)
          process.exit(1)
        })
    })

  program.command('info <type> <name>')
    .description('Get info about a repository, package...')
    .option('-R, --repository <repository>', 'Select the repository for the package')
    .action((type, name, options) => {
      let userAndName = name.split('/')

      if (!configProvider.has('token')) {
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      if (type === 'repository') {
        processData(decodeToken(configProvider.get('token')))
          .getUser()
          .then(user => {
            // Check if no org user specified
            if (userAndName.length <= 1) {
              userAndName[0] = user.login
              userAndName[1] = name
            }

            processData(decodeToken(configProvider.get('token')))
              .getPakRepositoryData(userAndName[0], userAndName[1])
              .then(res => {
                DEBUG_MODE && console.debug(res)
              }).catch(err => {
                console.error(err)
                process.exit(1)
              })
          })
      } else {
        if (!options.repository) {
          console.error('You need to specify the repository.')
          process.exit(1)
        }

        processData(configProvider.get('token'))
          .getUser()
          .then(user => {
            userAndName = options.repository.split('/')

            // Check if no org user specified
            if (userAndName.length <= 1) {
              userAndName[0] = user.login
              userAndName[1] = options.repository
            }

            processData(decodeToken(configProvider.get('token')))
              .getPackageData(userAndName[0], userAndName[1], name)
              .then(res => {
                DEBUG_MODE && console.debug(res)
              }).catch(err => {
                console.error(err)
                process.exit(1)
              })
          })
      }
    })

  program.command('create <type> <name>')
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
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      processData(decodeToken(configProvider.get('token')))
        .getUser()
        .then(user => {
          if (type === 'repository') {
            // Check if no org user specified
            if (userAndName.length <= 1) {
              userAndName[0] = user.login
              userAndName[1] = name
            }

            processData(decodeToken(configProvider.get('token')))
              .makeRepository(userAndName[0], userAndName[1])
              .then(res => {
                console.log(`${chalk.bold.greenBright('Successfully')} created repository ${chalk.bold.white(res.repo.name)} !`)
                DEBUG_MODE && console.debug(res)
              }).catch(err => {
                console.error(err)
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
                console.error('You need to specify the repository.')
                return process.exit(1)
              }

              case options.version: {
                console.error('You need to specify the version.')
                return process.exit(1)
              }

              case options.arch: {
                console.error('You need to specify the architecture.')
                return process.exit(1)
              }

              case options.platform: {
                console.error('You need to specify the platform.')
                return process.exit(1)
              }

              case options.installLocation: {
                console.error('You need to specify the install location.')
                return process.exit(1)
              }
            }

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
                options.dirs)
              .then(r => {
                DEBUG_MODE && console.debug(r)
              })
          } else {
            console.error('Invalid type.')
            process.exit(1)
          }
        })
    })

  program.command('delete <type> <name>')
    .description('Delete a repository, package ...')
    .option('-R, --repository', 'Select the repository for the package to delete')
    .action((type, name) => {
      const userAndName = name.split('/')
      const options = program.opts()

      if (!configProvider.has('token')) {
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      processData(decodeToken(configProvider.get('token')))
        .getUser()
        .then(user => {
          if (type === 'repository') {
            // Check if no org user specified
            if (userAndName.length <= 1) {
              userAndName[0] = user.login
              userAndName[1] = name
            }

            let latestReleaseTag = processData(decodeToken(configProvider.get('token')))
              .getLatestRelease(userAndName[0], userAndName[1])
              .then(rel => {
                latestReleaseTag = rel.tag_name
              })

            processData(decodeToken(configProvider.get('token')))
              .deleteRelease(userAndName[0], userAndName[1], true)
              .then(res => {
                console.log(`${chalk.bold.greenBright('Successfully')} deleted repository ${chalk.bold.white(name)} ${chalk.grey(`(${latestReleaseTag})`)} !`)
                DEBUG_MODE && console.debug(res)
              }).catch(err => {
                console.error(err)
                process.exit(1)
              })
          } else if (type === 'package') {
            if (!configProvider.has('token')) {
              console.error('You need to authenticate first.')
              process.exit(1)
            }

            switch (!options) {
              case options.repository: {
                console.error('You need to specify the repository.')
                return process.exit(1)
              }
            }

            processData(decodeToken(configProvider.get('token')))
              .deleteRelease(userAndName[0], userAndName[1], true)
              .then(res => {
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
