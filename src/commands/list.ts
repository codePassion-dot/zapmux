import chalk from "chalk";
import db from "../utils/db";
import { listTmuxSessions } from "../utils/tmux";

export default async () => {
  const projectsNames = await db.readAll();
  const runningSessions = await listTmuxSessions();
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
