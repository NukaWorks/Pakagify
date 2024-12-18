import chalk from "chalk";
import { decodeToken, processData } from "../Utils";
import ora from "ora";

export const deleteCmd = (type, repo, name, options, configProvider, DEBUG_MODE) => {
  const userAndName = repo.split("/");

  if (!configProvider.has("token")) {
    console.error(`${chalk.bold.redBright("Error")} You need to authenticate first.`);
    process.exit(1);
  }

  processData(decodeToken(configProvider.get("token")))
    .getUser()
    .then(() => {
      if (type === "repository") {
        let latestReleaseTag = processData(decodeToken(configProvider.get("token")))
          .getLatestRelease(userAndName[0], userAndName[1])
          .then((rel) => {
            latestReleaseTag = rel.tag_name;
          })
          .catch((err) => {
            spinner.fail(
              `${chalk.bold.redBright("Error")} while deleting the repository ${name} ${
                err.message && `(${err.message})`
              }`
            );
            DEBUG_MODE && console.error(err);
            process.exit(1);
          });

        const spinner = ora("Deleting repository...").start();
        processData(decodeToken(configProvider.get("token")))
          .deleteRelease(userAndName[0], userAndName[1], true)
          .then((res) => {
            spinner.succeed(
              `${chalk.bold.greenBright("Successfully")} deleted repository ${chalk.bold.white(name)} ${chalk.grey(
                `(${latestReleaseTag})`
              )} !`
            );
            DEBUG_MODE && console.debug(res);
          })
          .catch((err) => {
            spinner.fail(
              `${chalk.bold.redBright("Error")} while deleting repository ${chalk.bold.white(name)} - ${chalk.grey(
                `(${err.status})`
              )} !`
            );
            DEBUG_MODE && console.debug(err);
            process.exit(1);
          });
      } else if (type === "package") {
        if (!configProvider.has("token")) {
          console.error(`${chalk.bold.redBright("Error")} You need to authenticate first.`);
          process.exit(1);
        }

        const spinner = ora("Deleting package...").start();
        processData(decodeToken(configProvider.get("token")))
          .deletePackage(userAndName[0], userAndName[1], name)
          .then((res) => {
            spinner.succeed(`${chalk.bold.greenBright("Successfully")} deleted package ${chalk.bold.white(name)} !`);
            DEBUG_MODE && console.debug(res);
          })
          .catch((err) => {
            spinner.fail(`${chalk.bold.redBright("Error")} while deleting package ${chalk.bold.white(name)}: ${err}`);
            DEBUG_MODE && console.debug(err);
          });
      } else {
        console.error("Invalid type.");
        process.exit(1);
      }
    });
};
