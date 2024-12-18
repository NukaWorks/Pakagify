import chalk from "chalk";
import { decodeToken, processData } from "../Utils";
import ora from "ora";

export const buildPkgCmd = (repo, name, options, configProvider, DEBUG_MODE) => {
  let userAndName = repo.split("/");

  if (!configProvider.has("token")) {
    console.error(`${chalk.bold.redBright("Error")} You need to authenticate first.`);
    process.exit(1);
  }

  // Check if no org user specified
  if (userAndName.length <= 1) {
    userAndName[0] = user.login;
    userAndName[1] = name;
  }

  processData(decodeToken(configProvider.get("token")))
    .getUser()
    .then(() => {
      const spinner = ora("Building package...").start();

      processData(decodeToken(configProvider.get("token")))
        .buildPackage(userAndName[0], userAndName[1], name)
        .then((r) => {
          spinner.succeed(`${chalk.bold.greenBright("Successfully")} built package ${chalk.bold.white(name)} !`);
          DEBUG_MODE && console.debug(r);
        })
        .catch((err) => {
          spinner.fail(`Error while building package: ${err.message}`);
          DEBUG_MODE && console.error(err);
          process.exit(1);
        });
    });
};
