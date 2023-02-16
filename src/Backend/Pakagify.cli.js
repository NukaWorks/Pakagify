import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from './Common/ConfigProvider'

const configProvider = new ConfigProvider()

function mainCommand (argv) {
  program
    .name('pcli')
    .description('Pakagify CLI')
    .version(version)

  program.command('auth <token>').description('Make a new component with story.')
    .action(token => {
      if (!token) {
        console.error('Token is required.')
        process.exit(1)
      }

      configProvider.set('token', Buffer.from(token).toString('base64'))
      configProvider.save()
    })

  program.command('add').description('Add a new repository, package ...')
    .addCommand(new program.Command('repository <name>').description('Add a new repository.'))
    .addCommand(new program.Command('package <name>').description('Add a new package.'))

  program.command('delete').description('Delete a repository, package ...')
    .addCommand(new program.Command('repository <name>').description('Delete a repository.'))
    .addCommand(new program.Command('package <name>').description('Delete a package.'))

  program.parse(argv)
}

mainCommand(process.argv)
