import path from "path";
import db from "../utils/db";
import os from "os";
import { checkbox } from "@inquirer/prompts";
import {
  createTmuxSession,
  createWindowForTmuxSession,
  listTmuxSessions,
  sendKeysToWindow,
} from "../utils/tmux";
import chalk from "chalk";
import { getResolvedPath } from "../utils/path";

const CONFIG = path.join(os.homedir(), "/.tmux.conf");

const startProject = async (projectNameOrPath: string) => {
  let project,
    projectName = projectNameOrPath;
  const [resolvedPathStatus] = getResolvedPath(projectNameOrPath);
  if (resolvedPathStatus === 200) {
    const [status, response] = await db.readByPath(projectNameOrPath);
    if (status === "error") {
      return Promise.reject(response);
    }
    projectName = response.name;
    project = response;
  } else {
    const [status, response] = await db.read(projectNameOrPath);
    if (status === "error") {
      return Promise.reject(response);
    }
    if ((await listTmuxSessions()).includes(projectNameOrPath)) {
      return Promise.reject(`${projectNameOrPath} already running`);
    }
    project = response;
  }
  const windows = project.windows;
  await createTmuxSession({
    config: CONFIG,
    path: project.projectPath,
    sessionName: projectName,
    initialWindowName: windows[0].windowName,
  });

  await sendKeysToWindow({
    sessionName: projectName,
    windowName: windows[0].windowName,
    command: windows[0].commandToRunOnStart,
  });

  for (let i = 1; i < windows.length; i++) {
    await createWindowForTmuxSession({
      sessionName: projectName,
      path: project.projectPath,
      windowName: windows[i].windowName,
    });
    await sendKeysToWindow({
      sessionName: projectName,
      windowName: windows[i].windowName,
      command: windows[i].commandToRunOnStart,
    });
  }
  return `Project ${projectName} started`;
};

const startProjects = async (projects: string[]) => {
  const startProjectsPromises = projects.map((projectName) =>
    startProject(projectName),
  );

  const startedProjects = await Promise.allSettled(startProjectsPromises);

  startedProjects.forEach((startedProject) => {
    if (startedProject.status === "fulfilled") {
      console.log(chalk.green(startedProject.value));
    } else {
      console.log(chalk.red(startedProject.reason));
    }
  });
};

export default async (projects: string[]) => {
  if (projects.length === 0) {
    const runningSessions = await listTmuxSessions();
    const existingProjects = await db.readAllNames();
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
    await startProjects(projects);
  }
};
