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

const CONFIG = path.join(os.homedir(), "/.tmux.conf");

const startProject = async (projectName: string) => {
  const projectContent = await db.read(projectName);
  const windows = projectContent.windows;
  await createTmuxSession({
    config: CONFIG,
    path: projectContent.projectPath,
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
      path: projectContent.projectPath,
      windowName: windows[i].windowName,
    });
    await sendKeysToWindow({
      sessionName: projectName,
      windowName: windows[i].windowName,
      command: windows[i].commandToRunOnStart,
    });
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
  const runningSessions = await listTmuxSessions();
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
