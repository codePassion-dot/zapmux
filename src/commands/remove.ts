import chalk from "chalk";
import db from "../utils/db";
import checkbox from "@inquirer/checkbox";

const removeProject = async (projectName: string) => {
  const [status, response] = await db.remove(projectName);
  if (status === "success") {
    return `Project ${projectName} removed`;
  } else {
    return response;
  }
};

const removeProjects = async (projectsNames: string[]) => {
  const removeProjectsPromises = projectsNames.map((projectName) =>
    removeProject(projectName),
  );
  const removedProjects = await Promise.allSettled(removeProjectsPromises);

  removedProjects.forEach((removedProject) => {
    if (removedProject.status === "fulfilled") {
      console.log(chalk.green(removedProject.value));
    } else {
      console.log(chalk.red(removedProject.reason));
    }
  });
};

export default async (projectsNames: string[]) => {
  if (projectsNames.length === 0) {
    const existingProjects = await db.readAll();
    const projectsToRemove = await checkbox({
      message: "Choose projects to remove",
      choices: existingProjects.map((project) => ({
        name: project,
        value: project,
      })),
    });
    await removeProjects(projectsToRemove);
  } else {
    await removeProjects(projectsNames);
  }
};
