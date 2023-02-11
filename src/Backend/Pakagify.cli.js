import { program } from 'commander'
import { createRequire } from 'node:module'

// Import the package.json file to get the version number by using the createRequire function
const require = createRequire(import.meta.url)
const { version } = require('../../package.json')

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
