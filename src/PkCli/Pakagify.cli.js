import { program } from 'commander'
import { version } from '../../package.json'
import { ConfigProvider } from '../Common/ConfigProvider'
import { authCmd } from '../Common/Commands/AuthCommand'
import { logoutCmd } from '../Common/Commands/LogoutCommand'
import { whoamiCmd } from '../Common/Commands/WhoamiCommand'
import { infoRepoCmd } from '../Common/Commands/InfoRepoCommand'
import { createCmd } from '../Common/Commands/CreateCommand'
import { deleteCmd } from '../Common/Commands/DeleteCommand'
import { initCmd } from '../Common/Commands/InitCommand'
import { retrieveCmd } from '../Common/Commands/RetrieveCommand'

const configProvider = new ConfigProvider()
let DEBUG_MODE = false

function mainCommand (argv) {
  // Debug mode
  argv.forEach((arg) => {
    if (arg.match('-D')) DEBUG_MODE = true
  })

  program
    .name('pkcli')
    .description(`Pakagify CLI v${version}`)
    .version(version)
    .option('-D, --debug', 'Debug mode')

  program
    .command('auth <token>')
    .description('Authenticate with Github Token.')
    .action((token) => authCmd(token, configProvider, DEBUG_MODE))

  program
    .command('logout')
    .description('Logout from Pakagify CLI.')
    .action(() => logoutCmd(configProvider))

  program
    .command('whoami')
    .description('Get the current authenticated user.')
    .action(() => whoamiCmd(configProvider, DEBUG_MODE))

  program
    .command('info <type> <name>')
    .description('Get info about a repository, package...')
    .option('-R, --repository <repository>', 'Select the repository for the package')
    .action((type, name, options) => infoRepoCmd(type, name, options, configProvider, DEBUG_MODE))

  program
    .command('init <type> <name>')
    .description('Init a new repository or package...')
    .action((type, name, options) => initCmd(type, name, options, configProvider, DEBUG_MODE))

  program
    .command('retrieve <type> <name>')
    .description('Download existing repository or package...')
    .action((type, name) => retrieveCmd(type, name, configProvider, DEBUG_MODE))

  program
    .command('create <type> <name>')
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
    .action((type, name, options) => createCmd(type, name, options, configProvider, DEBUG_MODE))

  program
    .command('delete <type> <name>')
    .description('Delete a repository, package ...')
    .option('-R, --repository <repository>', 'Select the repository for the package to delete')
    .option('-a, --arch <arch>', 'Architecture of the package')
    .option('-p, --platform <platform>', 'Platform of the package')
    .action((type, name, options) => deleteCmd(type, name, options, configProvider, DEBUG_MODE))

  program.parse(argv)
}

mainCommand(process.argv)
