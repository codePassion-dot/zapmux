import chalk from "chalk";
import db from "../lib/db";

export default async () => {
  const projectsNames = await db.readAll();
  console.log(
    projectsNames
      .map((projectName) => `${chalk.green("❯")} ${projectName}`)
      .join("\n"),
  );
};
