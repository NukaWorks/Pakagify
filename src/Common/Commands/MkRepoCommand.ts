import chalk from "chalk";
import { decodeToken, processData } from "../Utils";
import ora from "ora";

export const mkRepoCmd = (name, configProvider, DEBUG_MODE) => {
  if (!name) {
    console.error(`${chalk.bold.redBright("Error")} You need to specify the repository.`);
    process.exit(1);
  }

  let userAndName = name.split("/");

  if (!configProvider.has("token")) {
    console.error(`${chalk.bold.redBright("Error")} You need to authenticate first.`);
    process.exit(1);
  }

  processData(decodeToken(configProvider.get("token")))
    .getUser()
    .then((user) => {
      // Check if no org user specified
      if (userAndName.length <= 1) {
        userAndName[0] = user.login;
        userAndName[1] = name;
      }

      const spinner = ora("Creating a new repository...").start();
      processData(decodeToken(configProvider.get("token")))
        .makeRepository(userAndName[0], userAndName[1], DEBUG_MODE, true)
        .then((res) => {
          spinner.succeed(
            `${chalk.bold.greenBright("Successfully")} created repository ${chalk.bold.white(res.repo.name)} !`
          );
          DEBUG_MODE && console.debug(res);
        })
        .catch((err) => {
          spinner.fail(`Error while creating repository: ${err.message}`);
          DEBUG_MODE && console.error(err);
          process.exit(1);
        });
    });
};
