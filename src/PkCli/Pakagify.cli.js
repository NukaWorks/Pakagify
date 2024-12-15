import { program } from "commander";
import { version } from "../../package.json";
import { ConfigProvider } from "../Common/ConfigProvider";
import { authCmd } from "../Common/Commands/AuthCommand";
import { logoutCmd } from "../Common/Commands/LogoutCommand";
import { whoamiCmd } from "../Common/Commands/WhoamiCommand";
import { infoRepoCmd } from "../Common/Commands/InfoRepoCommand";
import { createCmd as mkPkgCmd } from "../Common/Commands/CreateCommand";
import { deleteCmd } from "../Common/Commands/DeleteCommand";
import { initCmd as mkRepoCmd } from "../Common/Commands/InitCommand";
import { retrieveCmd } from "../Common/Commands/RetrieveCommand";

const configProvider = new ConfigProvider();
let DEBUG_MODE = false;

function mainCommand(argv) {
  // Debug mode
  argv.forEach((arg) => {
    if (arg.match("-D")) DEBUG_MODE = true;
  });

  program.name("pkcli").description(`Pakagify CLI v${version}`).version(version).option("-D, --debug", "Debug mode");

  program
    .command("auth <token>")
    .description("Authenticate with Github Token.")
    .action((token) => authCmd(token, configProvider, DEBUG_MODE));

  program
    .command("logout")
    .description("Logout from Pakagify CLI.")
    .action(() => logoutCmd(configProvider));

  program
    .command("whoami")
    .description("Get the current authenticated user.")
    .action(() => whoamiCmd(configProvider, DEBUG_MODE));

  program
    .command("pkginfo <name>")
    .description("Get info about a package...")
    .option("-r, --repository <repository>", "Select the repository for the package")
    .action((type, name, options) => infoRepoCmd(type, name, options, configProvider, DEBUG_MODE));

  program
    .command("mkrepo <name>")
    .description("Make a new repository ...")
    .action((type, name, options) => mkRepoCmd(type, name, options, configProvider, DEBUG_MODE));

  program
    .command("retrieve <name>")
    .description("Download a whole repository of packages...")
    .option("-k, --keep", "Keep compressed package files after download")
    .action((name, options) => retrieveCmd(name, options, configProvider, DEBUG_MODE));

  program
    .command("mkpkg <name>")
    .description("Make a new empty package ...")
    .option("-p, --publish <platform>", "Plublish after build")
    .action((type, name, options) => mkPkgCmd(type, name, options, configProvider, DEBUG_MODE));

  program
    .command("delete <type> <name>")
    .description("Delete a repository, package ...")
    .option("-r, --repository <repository>", "Select the repository for the package to delete")
    .option("-a, --arch <arch>", "Architecture of the package")
    .option("-p, --platform <platform>", "Platform of the package")
    .action((type, name, options) => deleteCmd(type, name, options, configProvider, DEBUG_MODE));

  program.parse(argv);
}

mainCommand(process.argv);
