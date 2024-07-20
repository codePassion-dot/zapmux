import fs from "fs";
import path from "path";

import fsAsync from "fs/promises";
import os from "os";
import chalk from "chalk";
import { listTmuxSessions } from "./tmux";
import { getResolvedPath } from "./path";

type ProjectWindow = {
  windowName: string;
  commandToRunOnStart: string | undefined | null;
};

type Windows = Array<ProjectWindow>;

type Project = {
  projectPath: string;
  windows: Windows;
};

const isValidWindows = (windows: Windows | unknown): windows is Windows => {
  return (
    Array.isArray(windows) &&
    windows.every((window) => {
      return (
        typeof window?.windowName === "string" &&
        "commandToRunOnStart" in window
      );
    })
  );
};

const isValidProject = (project: object | Project): project is Project => {
  return (
    typeof (project as Project).projectPath === "string" &&
    isValidWindows((project as Project).windows)
  );
};

class Db {
  private zapMuxDir: string = path.join(os.homedir(), "/.zapmux");
  async ensureDbDirExists() {
    if (!fs.existsSync(this.zapMuxDir)) {
      await fsAsync.mkdir(this.zapMuxDir, { recursive: true });
    }
  }
  async add(projectName: string, projectPath: string, windows: Windows) {
    await this.ensureDbDirExists();
    try {
      await fsAsync.writeFile(
        `${this.zapMuxDir}/${projectName}.json`,
        JSON.stringify(
          {
            projectPath,
            windows,
          },
          null,
          4,
        ),
        { flag: "w+" },
      );
    } catch (error) {
      console.error(chalk.red("Something went wrong saving the new project"));
      process.exit(1);
    }
  }

  async exists(projectName: string) {
    try {
      await fsAsync.access(`${this.zapMuxDir}/${projectName}.json`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async readByPath(
    projectPath: string,
  ): Promise<["error", string] | ["success", Project & { name: string }]> {
    try {
      const [resolvedPathStatus] = getResolvedPath(projectPath);
      if (resolvedPathStatus !== 200) {
        return ["error", `Invalid path ${projectPath}`];
      }
      const projects = await this.readAll();
      const project = projects.find((project) => {
        const [_existingProjectPathStatus, existingProjectPath] =
          getResolvedPath(project.projectPath);
        const [_requestedProjectPathStatus, requestedProjectPath] =
          getResolvedPath(projectPath);
        return existingProjectPath === requestedProjectPath;
      });
      if (!project) {
        return ["error", `Project with path ${projectPath} not found`];
      }
      return ["success", project];
    } catch (error) {
      return [
        "error",
        `Something went wrong reading the project with path ${projectPath}`,
      ];
    }
  }

  async readAll() {
    const projectsNames = await this.readAllNames();
    const projects = [];
    for (const projectName of projectsNames) {
      const [status, project] = await this.read(projectName);
      if (status === "success") {
        projects.push({ name: projectName, ...project });
      }
    }
    return projects;
  }

  async read(
    projectName: string,
  ): Promise<["error", string] | ["success", Project]> {
    try {
      if (!(await this.exists(projectName))) {
        return ["error", `Project ${projectName} not found`];
      }

      const project = await fsAsync.readFile(
        `${this.zapMuxDir}/${projectName}.json`,
        "utf-8",
      );

      const parsedProject = JSON.parse(project);

      if (!isValidProject(parsedProject)) {
        return ["error", `Invalid project format for ${projectName}`];
      }
      return ["success", parsedProject];
    } catch (error) {
      return [
        "error",
        `Something went wrong reading the project ${projectName}`,
      ];
    }
  }

  async readAllNames() {
    try {
      await this.ensureDbDirExists();
      const projects = await fsAsync.readdir(this.zapMuxDir);
      if (!projects.length) {
        console.log(chalk.red("No projects found"));
        process.exit(0);
      }
      return projects.map((project) => project.replace(".json", ""));
    } catch (error) {
      console.log(chalk.red("Something went wrong reading the projects"));
      process.exit(1);
    }
  }

  async remove(
    projectName: string,
  ): Promise<["success", undefined] | ["error", string]> {
    try {
      if (!(await this.exists(projectName))) {
        return ["error", `Project ${projectName} not found`];
      }

      if ((await listTmuxSessions()).includes(projectName)) {
        return ["error", `Project ${projectName} is running`];
      }
      await fsAsync.unlink(`${this.zapMuxDir}/${projectName}.json`);
      return ["success", undefined];
    } catch (error) {
      return [
        "error",
        `Something went wrong removing the project ${projectName}`,
      ];
    }
  }
}

let db = Object.freeze(new Db());

export default db;
