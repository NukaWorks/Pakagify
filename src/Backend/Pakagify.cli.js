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

  program.command('package <name> <category>').description('Make a new story.')
    .action((name, category) => {
      // makeStory(name, category)
    })

  program.parse(argv)
}

mainCommand(process.argv)
