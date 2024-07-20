import path from "path";
import db from "../lib/db";
import child_process, { execSync } from "child_process";
import os from "os";
import { checkbox } from "@inquirer/prompts";

const execAsync = (command: string) =>
  new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });

const CONFIG = path.join(os.homedir(), "/.tmux.conf");

const startProject = async (projectName: string) => {
  const projectContent = await db.read(projectName);
  const windows = projectContent.windows;
  await execAsync(
    `tmux -u -f ${CONFIG} new-session -c ${projectContent.projectPath} -s ${projectName} -n ${windows[0].windowName} -d`,
  );
  await execAsync(
    `tmux send-keys -t ${projectName}:${windows[0].windowName} '${windows[0].commandToRunOnStart}' Enter`,
  );

  for (let i = 1; i < windows.length; i++) {
    await execAsync(
      `tmux new-window -t ${projectName} -c ${projectContent.projectPath} -d -n ${windows[i].windowName}`,
    );
    await execAsync(
      `tmux send-keys -t ${projectName}:${windows[i].windowName} '${windows[i].commandToRunOnStart}' Enter`,
    );
  }
  return projectName;
};

const startProjects = async (projects: string[]) => {
  const startProjectsPromises = projects.map((projectName) =>
    startProject(projectName),
  );

  const startedProjects = await Promise.allSettled(startProjectsPromises);

  startedProjects.forEach((startedProject) => {
    if (startedProject.status === "fulfilled") {
      console.log(`Project ${startedProject.value} started`);
    } else {
      console.log(`Project ${startedProject.reason} not found`);
    }
  });
};

export default async (projects: string[]) => {
  const runningSessions = execSync('tmux list-sessions -F "#S"');
  if (projects.length === 0) {
    const existingProjects = await db.readAll();
    const projecstThatAreNotRunning = existingProjects.filter(
      (project) => !runningSessions.includes(project),
    );
    const projectsToStart = await checkbox({
      message: "Choose projects to start",
      choices: projecstThatAreNotRunning.map((project) => ({
        name: project,
        value: project,
      })),
    });
    await startProjects(projectsToStart);
  } else {
    const projectsThatAreNotRunning = projects.filter(
      (project) => !runningSessions.includes(project),
    );
    await startProjects(projectsThatAreNotRunning);
    if (projectsThatAreNotRunning.length !== projects.length) {
      const projectsThatAreRunning = projects.filter((project) =>
        runningSessions.includes(project),
      );
      console.log(
        projectsThatAreRunning
          .map((project) => `${project} is already running`)
          .join("\n"),
      );
    }
  }
};
