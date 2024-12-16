import { program } from "commander";
import { version } from "../../package.json";
import { ConfigProvider } from "../Common/ConfigProvider";
import { authCmd } from "../Common/Commands/AuthCommand";
import { logoutCmd } from "../Common/Commands/LogoutCommand";
import { whoamiCmd } from "../Common/Commands/WhoamiCommand";
import { pkgInfoCmd } from "../Common/Commands/InfoCommand";
import { buildPkgCmd } from "../Common/Commands/BuildMkCommand";
import { deleteCmd } from "../Common/Commands/DeleteCommand";
import { mkRepoCmd } from "../Common/Commands/MkRepoCommand";
import { retrieveCmd } from "../Common/Commands/RetrieveRepoCommand";
import { mkPkgCmd } from "../Common/Commands/MkEmptyPkgCommand";
import { pushPkgCmd } from "../Common/Commands/PushPkgCommand";

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
    .action((name, options) => pkgInfoCmd(name, options, configProvider, DEBUG_MODE));

  program
    .command("mkrepo <name>")
    .description("Make a new repository ...")
    .action((name) => mkRepoCmd(name, configProvider, DEBUG_MODE));

  program
    .command("retrieve <name>")
    .description("Download a whole repository of packages...")
    .option("-k, --keep", "Keep compressed package files after download")
    .action((name, options) => retrieveCmd(name, options, configProvider, DEBUG_MODE));

  program
    .command("mkpkg <name>")
    .description("Make a new empty package ...")
    .option("-a, --arch <arch>", "Architecture of the pkg (x64, i386, arm64, noarch)")
    .option("-p, --platform <platform>", "Platform of the pkg (win32, darwin, linux, any)")
    .action((name, options) => mkPkgCmd(name, options, configProvider, DEBUG_MODE));

  program
    .command("buildpkg <repo> <name>")
    .description("Build a package ...")
    .action((repo, name, options) => buildPkgCmd(repo, name, options, configProvider, DEBUG_MODE));

  program
    .command("pushpkg <repo> <name>")
    .description("Upload a package ...")
    .action((repo, name, options) => pushPkgCmd(repo, name, options, configProvider, DEBUG_MODE));

  program
    .command("rmpkg <repo> <name>")
    .description("Delete a package ...")
    .action((repo, name, options) => deleteCmd("package", repo, name, options, configProvider, DEBUG_MODE));

  program
    .command("rmrepo <name>")
    .description("Delete a repository ...")
    .action((name, options) => deleteCmd("repository", name, options, configProvider, DEBUG_MODE));

  program.parse(argv);
}

mainCommand(process.argv);
