import { program } from 'commander'
import { version } from '../../package.json'

function mainCommand (argv) {
  program
    .name('pcli')
    .description('Pakagify CLI')
    .version(version)

  program.command('repository <name> <category>').description('Make a new component with story.')
    .action((name, category) => {
      // makeComponent(name, category)
    })

  program.command('package <name> <category>').description('Make a new story.')
    .action((name, category) => {
      // makeStory(name, category)
    })

  program.parse(argv)
}

mainCommand(process.argv)
