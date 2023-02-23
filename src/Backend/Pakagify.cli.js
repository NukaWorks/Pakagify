import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from './Common/ConfigProvider'
import { Pakagify } from './Pakagify'
import { RepoModel } from './Common/Models/RepoModel'

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

  // DEBUG_MODE = program.opts().debug
  //
  // console.log(program)

  // DEBUG_MODE && console.log('DEBUG MODE ENABLED !')

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
          console.log(`Successfully authenticated as ${user.login} !`)
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
          console.log(`You are currently authenticated as ${user.login} !`)
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

  program.command('create <type> <name> <dirs...>')
    .description('Create a repository, package ...')
    .requiredOption('-v, --version <version>', 'Version of the package')
    .requiredOption('-a, --arch <arch>', 'Architecture of the package')
    .requiredOption('-p, --platform <platform>', 'Platform of the package')
    .requiredOption('-i, --install-location <installLocation>', 'Install location of the package')
    .option('-R, --repository <repository>', 'Select the repository for the package')
    .option('-n', '--no-keep', 'Delete the generated package on the local directory')
    .option('-d, --description <description>', 'Description of the package')
    .option('-r, --restart-required', 'Restart required of the package')
    .option('-preinst, --preinst <preinst>', 'Preinstall Script')
    .option('-postinst, --postinst <postinst>', 'Postinstall Script')
    .action((type, name, dirs, options) => {
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
              .getGitRepositoryData(userAndName[0], userAndName[1])
              .then(repo => {
                const repoModel = RepoModel
                repoModel.name = repo.name
                repoModel.description = repo.description
                repoModel.author = repo.owner.login
                repoModel.url = repo.html_url
                repoModel.last_updated = repo.updated_at
                repoModel.created_at = repo.created_at
                repoModel.license = repo.license

                processData(decodeToken(configProvider.get('token')))
                  .createRelease(userAndName[0], userAndName[1], true)
                  .then(res => {
                    processData(decodeToken(configProvider.get('token')))
                      .pushRepoData(userAndName[0], userAndName[1], 'repo.json',
                        JSON.stringify(RepoModel)).then(push => {
                        console.log(`Successfully created repository ${name} on ${res.tag_name} !`)
                        DEBUG_MODE && console.debug(push)
                      })

                    DEBUG_MODE && console.debug(res)
                  })

                DEBUG_MODE && console.debug(repo)
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

            if (!options.repository) {
              console.error('You need to specify the repository.')
              process.exit(1)
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
                dirs)
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
                console.log(`Successfully deleted repository ${name} on ${latestReleaseTag} !`)
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

            if (!options.repository) {
              console.error('You need to specify the repository.')
              process.exit(1)
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
