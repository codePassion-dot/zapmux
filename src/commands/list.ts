import chalk from "chalk";
import db from "../lib/db";
import { execSync } from "child_process";

export default async () => {
  const projectsNames = await db.readAll();
  const runningSessions = execSync('tmux list-sessions -F "#S"')
    .toString()
    .split("\n");
  console.log(
    projectsNames
      .map((projectName) =>
        runningSessions.includes(projectName)
          ? `${chalk.green("❯")} ${projectName} ${chalk.green("(running)")}`
          : `${chalk.green("❯")} ${projectName}`,
      )
      .join("\n"),
  );
};
