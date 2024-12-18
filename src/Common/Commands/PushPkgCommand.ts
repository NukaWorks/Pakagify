import chalk from "chalk";
import { decodeToken, formatTime, processData } from "../Utils";
import ora from "ora";

export const pushPkgCmd = (repo, name, options, configProvider, DEBUG_MODE) => {
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
      const spinner = ora("Uploading package...").start();
      processData(decodeToken(configProvider.get("token"))).on(
        "uploadProgress",
        (progress, bitrate, time, fileName) => {
          spinner.text = `Uploading ${fileName}... ${chalk.grey(
            `${formatTime(time)} remaining, ${bitrate}`
          )} ${chalk.bold.white(progress, "%")}`;
        }
      );
      processData(decodeToken(configProvider.get("token")))
        .publishPackage(userAndName[0], userAndName[1], name)
        .then((r) => {
          spinner.succeed(`${chalk.bold.greenBright("Successfully")} package ${chalk.bold.white(name)} uploaded !`);
          DEBUG_MODE && console.debug(r);
        })
        .catch((err) => {
          spinner.fail(`Error while uploading the package: ${err.message}`);
          DEBUG_MODE && console.error(err);
          process.exit(1);
        });
    });
};
