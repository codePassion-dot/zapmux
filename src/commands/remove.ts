import chalk from "chalk";
import db from "../lib/db";
import checkbox from "@inquirer/checkbox";

const removeProjects = async (projectsNames: string[]) => {
  const removeProjectsPromises = projectsNames.map((projectName) =>
    db.remove(projectName),
  );
  const removedProjects = await Promise.allSettled(removeProjectsPromises);

  removedProjects.forEach((removedProject) => {
    if (removedProject.status === "fulfilled") {
      console.log(chalk.green(`Project ${removedProject.value} removed`));
    } else {
      console.log(chalk.red("Project not found"));
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
