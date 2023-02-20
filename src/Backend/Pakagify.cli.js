import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from './Common/ConfigProvider'
import { Pakagify } from './Pakagify'
import { RepoModel } from './Common/Models/RepoModel'

const configProvider = new ConfigProvider()

function processData (token) {
  if (!processData.instance) processData.instance = new Pakagify(token)
  return processData.instance
}

function decodeToken (token) {
  return Buffer.from(token, 'base64').toString('utf8')
}

function mainCommand (argv) {
  program
    .name('pkcli')
    .description('Pakagify CLI')
    .version(version)

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
    .description('Test Pakagify Data')
    .action((type, name) => {
      const userAndName = name.split('/')

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
                console.log(res)
              }).catch(err => {
                console.error(err)
                process.exit(1)
              })
          })
      }
    })

  program.command('create <type> <name>')
    .description('Create a repository, package ...')
    .option('-repo, --repository', 'Select the repository for the package')
    .option('-d, --description <description>', 'Description of the package')
    .option('-v, --version <version>', 'Version of the package')
    .option('-a, --arch <arch>', 'Architecture of the package')
    .option('-p, --platform <platform>', 'Platform of the package')
    .option('-r, --restart-required <restartRequired>', 'Restart required of the package')
    .option('-i, --install-location <installLocation>', 'Install location of the package')
    .option('-preinst, --preinst <preinst>', 'Preinstall Script')
    .option('-postinst, --postinst <postinst>', 'Postinstall Script')

    .action((type, name) => {
      const userAndName = name.split('/')

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
                        console.debug(push)
                      })

                    console.debug(res)
                  })

                console.debug(repo)
              }).catch(err => {
                console.error(err)
                process.exit(1)
              })
          } else if (type === 'package') {
            // Check if no org user specified
            if (userAndName.length <= 1) {
              userAndName[0] = user.login
              userAndName[1] = name
            }

            processData(decodeToken(configProvider.get('token'))).makePackage(userAndName[0], userAndName[1], 'test', '1.0.0', 'test de package', '/', 'x86_64', 'darwin', 'config').then(r => {
              console.debug(r)
            })
          } else {
            console.error('Invalid type.')
            process.exit(1)
          }
        })
    })

  program.command('delete <type> <name>')
    .description('Delete a repository, package ...')
    .option('-repo, --repository', 'Select the repository for the package')
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
                console.debug(res)
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
              .then(res => {})
          } else {
            console.error('Invalid type.')
            process.exit(1)
          }
        })
    })

  program.parse(argv)
}

mainCommand(process.argv)
