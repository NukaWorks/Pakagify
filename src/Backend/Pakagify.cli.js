import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from './Common/ConfigProvider'
import { Pakagify } from './Pakagify'

const configProvider = new ConfigProvider()

let pkInstance = null

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
      pkInstance = new Pakagify(Buffer.from(token).toString('utf8'))
      pkInstance.getUser().then(user => {
        configProvider.save()
        console.log(`Successfully authenticated as ${user.login} !`)
      }).catch(err => {
        console.error(err)
        process.exit(1)
      })
    })

  program.command('add [command]').description('Add a new repository, package ...')
    .addCommand(new program.Command('repository <name>').description('Add a new repository.'))
    .addCommand(new program.Command('package <name>').description('Add a new package.'))

  program.command('delete [command]').description('Delete a repository, package ...')
    .addCommand(new program.Command('repository <name>').description('Delete a repository.'))
    .addCommand(new program.Command('package <name>').description('Delete a package.'))

  program.command('list [command]').description('List a repository, package ...')
    .addCommand(new program.Command('repository <name>').description('List a repository.'))
    .addCommand(new program.Command('package <name>').description('List a package.'))

  program.parse(argv)
}

mainCommand(process.argv)
