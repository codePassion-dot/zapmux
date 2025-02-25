import { select } from "@inquirer/prompts";
import db from "../utils/db";
import { attachToTmuxSession, listTmuxSessions } from "../utils/tmux";

export default async (project: string | undefined) => {
  const runningSessions = await listTmuxSessions();
  const projects = await db.readAllNames();
  if (!project) {
    const runningProjects = projects.filter((project) =>
      runningSessions.includes(project),
    );
    if (runningProjects.length === 0) {
      console.log("No projects running");
    } else {
      const projectToChoose = await select({
        message: "Choose a project",
        choices: runningProjects.map((project) => ({
          name: project,
          value: project,
        })),
      });
      attachToTmuxSession(projectToChoose);
    }
  } else if (!projects.includes(project)) {
    console.log("Project not found");
  } else if (!runningSessions.includes(project)) {
    console.log("Project not running");
  } else {
    attachToTmuxSession(project);
  }
};
