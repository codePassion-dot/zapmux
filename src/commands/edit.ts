import db from "../lib/db";
import { input, select } from "@inquirer/prompts";
import { listTmuxSessions } from "../utils/tmux";

const editProject = async (projectToEditName: string) => {
  const projectToEditContent = await db.read(projectToEditName);

  const newProjectName = await input({
    message: "What is the name of your project",
    default: projectToEditName,
  });

  const newProjectPath = await input({
    message: "Where is your project",
    default: projectToEditContent.projectPath,
  });

  const wantToEditExistingWindows = await input({
    message: "Do you want to edit existing windows? (y/n)",
    default: "n",
    validate: (input) => ["y", "n"].includes(input),
  });

  if (wantToEditExistingWindows === "y") {
    for (let i = 0; i < projectToEditContent.windows.length; i++) {
      projectToEditContent.windows[i].windowName = await input({
        message: `What is the name of window ${i + 1}`,
        default: projectToEditContent.windows[i].windowName,
      });
      projectToEditContent.windows[i].commandToRunOnStart = await input({
        message: `What command do you want to run on start for window ${i + 1}`,
        default: projectToEditContent.windows[i].commandToRunOnStart ?? "",
      });
    }
  }

  const additionalWindows = await input({
    message: "How many additional windows do you want to add",
    validate: (input) => typeof parseInt(input) === "number",
    default: "0",
  });

  for (let i = 0; i < parseInt(additionalWindows); i++) {
    const newWindowName = await input({
      message: "What is the name of the new window",
    });
    const newCommandToRunOnStart = await input({
      message: "What command do you want to run on start for the new window",
    });
    projectToEditContent.windows.push({
      windowName: newWindowName,
      commandToRunOnStart: newCommandToRunOnStart,
    });
  }
  await db.add(newProjectName, newProjectPath, projectToEditContent.windows);
};

export default async (projectToEdit: string | undefined) => {
  const runningSessions = await listTmuxSessions();
  if (!projectToEdit) {
    const projects = await db.readAll();
    const projectsThatAreNotRunning = projects.filter(
      (project) => !runningSessions.includes(project),
    );
    const projectToEditName = await select({
      message: "Choose a project to edit",
      choices: projectsThatAreNotRunning.map((project) => ({
        name: project,
        value: project,
      })),
    });
    await editProject(projectToEditName);
  } else if (runningSessions.includes(projectToEdit)) {
    console.log("Project is running, please stop it before editing");
    process.exit(0);
  } else {
    await editProject(projectToEdit);
  }
};
