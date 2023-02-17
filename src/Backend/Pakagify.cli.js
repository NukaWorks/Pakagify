import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from './Common/ConfigProvider'
import { Pakagify } from './Pakagify'

const configProvider = new ConfigProvider()

function processData (token) {
  if (!processData.instance) processData.instance = new Pakagify(token)
  return processData.instance
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
      if (!configProvider.has('token')) {
        console.error('You need to authenticate first.')
        process.exit(1)
      }

      if (type === 'repository') {
        processData(decodeToken(configProvider.get('token'))).createRepo('powerm1nt', 'Hello', true).then(res => {
          console.log(`Successfully created repository ${res.name} !`)
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
          processData(decodeToken(configProvider.get('token'))).getRepoData().forEach(repo => {
            if (repo.name === name) {
              console.log(repo)
            }
          })
        })
    })

  program.parse(argv)
}

function decodeToken (token) {
  return Buffer.from(token, 'base64').toString('utf8')
}

mainCommand(process.argv)
