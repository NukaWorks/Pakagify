import chalk from "chalk";
import { decodeToken, processData, validateArch, validatePlatform } from "../Utils";
import ora from "ora";

export const mkPkgCmd = (name, options, configProvider, DEBUG_MODE) => {
  console.log(options.platform, options.arch);

  if (!configProvider.has("token")) {
    console.error(`${chalk.bold.redBright("Error")} You need to authenticate first.`);
    process.exit(1);
  }

  processData(decodeToken(configProvider.get("token")))
    .getUser()
    .then(() => {
      switch (!options) {
        case options.arch: {
          console.error(`${chalk.bold.redBright("Error")} You need to specify the architecture.`);
          return process.exit(1);
        }

        case options.platform: {
          console.error(`${chalk.bold.redBright("Error")} You need to specify the platform.`);
          return process.exit(1);
        }
      }

      // Check if platform is valid
      validatePlatform(options.platform);

      // Check if arch is valid
      validateArch(options.arch);

      const spinner = ora("Creating empty package...").start();
      processData(decodeToken(configProvider.get("token")))
        .makeEmptyPackage(name, options.arch, options.platform)
        .then((r) => {
          spinner.succeed(`${chalk.bold.greenBright("Successfully")} created package ${chalk.bold.white(name)} !`);
          DEBUG_MODE && console.debug(r);
        })
        .catch((err) => {
          spinner.fail(`Error while creating package: ${err.message}`);
          DEBUG_MODE && console.error(err);
          process.exit(1);
        });
    });
};
