import db from "../utils/db";
import { checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import { killTmuxSession, listTmuxSessions } from "../utils/tmux";

export default async (projectName: string | undefined) => {
  const runningSessions = await listTmuxSessions();
  if (!projectName) {
    const projects = await db.readAll();
    const runningProjects = projects.filter((project) =>
      runningSessions.includes(project),
    );
    const projectsToStop = await checkbox({
      message: "Select projects to stop",
      choices: runningProjects.map((runningProject) => ({
        name: runningProject,
        value: runningProject,
      })),
    });
    for (const project of projectsToStop) {
      await killTmuxSession(project);
    }
  } else {
    const projectExists = await db.exists(projectName);
    if (!projectExists) {
      console.log(chalk.red("Project not found"));
      process.exit(0);
    }
    const projectIsRunning = runningSessions.includes(projectName);
    if (!projectIsRunning) {
      console.log(chalk.red("Project is not running"));
      process.exit(0);
    }
    await killTmuxSession(projectName);
  }
};
