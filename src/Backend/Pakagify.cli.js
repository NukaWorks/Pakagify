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
    .name('pcli')
    .description('Pakagify CLI')
    .version(version)

  program.command('auth <token>').description('Authenticate with Github Token.')
    .action(token => {
      if (!token) {
        console.error('Token is required.')
        process.exit(1)
      }

      configProvider.set('token', Buffer.from(token).toString('base64'))

      processData(decodeToken(configProvider.get('token'))).getUser().then(user => {
        configProvider.save()
        console.log(`Successfully authenticated as ${user.login} !`)
      }).catch(err => {
        console.error(err)
        process.exit(1)
      })
    })

  program.command('create <type> <name>').description('Create a repository, package ...')
    .action((type, name) => {
      const userAndName = name.split('/')

      if (!configProvider.has('token')) {
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      if (type === 'repository') {
        // Check if no org user specified
        if (userAndName.length <= 1) {
          userAndName[0] = null
          userAndName[1] = name
        }

        processData(decodeToken(configProvider.get('token'))).createRelease(userAndName[0], userAndName[1], true).then(res => {
          processData(decodeToken(configProvider.get('token'))).pushRepoData(userAndName[0], userAndName[1], 'repo.json', JSON.stringify(RepoModel)).then(push => {
            console.log(`Successfully created repository ${name} on ${res.tag_name} !`)
            console.debug(push)
          })

          console.debug(res)
        }).catch(err => {
          console.error(err)
          process.exit(1)
        })
      } else if (type === 'package') {
        // TODO
      } else {
        console.error('Invalid type.')
        process.exit(1)
      }
    })

  program.command('delete <type> <name>').description('Delete a repository, package ...')
    .action((type, name) => {
      const userAndName = name.split('/')

      if (!configProvider.has('token')) {
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      if (type === 'repository') {
        // Check if no org user specified
        if (userAndName.length <= 1) {
          userAndName[0] = processData(decodeToken(configProvider.get('token'))).getUser().login
          userAndName[1] = name
        }

        let latestReleaseTag = processData(decodeToken(configProvider.get('token'))).getLatestRelease(userAndName[0], userAndName[1]).then(rel => {
          latestReleaseTag = rel.tag_name
        })

        processData(decodeToken(configProvider.get('token'))).deleteRelease(userAndName[0], userAndName[1], true).then(res => {
          console.log(`Successfully deleted repository ${name} on ${latestReleaseTag} !`)
          console.log(res)
        }).catch(err => {
          console.error(err)
          process.exit(1)
        })
      } else if (type === 'package') {
        // TODO
      } else {
        console.error('Invalid type.')
        process.exit(1)
      }
    })

  program.command('list [command]').description('List a repository, package ...') // TODO Not working yet
    .action(() => {
      program.addCommand(new program.Command('repository <name>').description('List a repository.'))
        .action(name => {
          // processData(decodeToken(configProvider.get('token'))).getUserRepos()
        })
    })

  program.parse(argv)
}

mainCommand(process.argv)
