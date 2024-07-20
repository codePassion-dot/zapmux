import fs from "fs";
import path from "path";

import fsAsync from "fs/promises";
import os from "os";
import chalk from "chalk";

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

  async read(
    projectName: string,
  ): Promise<["error", string] | ["success", Project]> {
    try {
      const project = await fsAsync.readFile(
        `${this.zapMuxDir}/${projectName}.json`,
        "utf-8",
      );

      const parsedProject = JSON.parse(project);

      if (!isValidProject(parsedProject)) {
        return ["error", "Invalid project format"];
      }
      return ["success", parsedProject];
    } catch (error) {
      return ["error", chalk.red("Project not found")];
    }
  }

  async readAll() {
    try {
      await this.ensureDbDirExists();
      const projects = await fsAsync.readdir(this.zapMuxDir);
      if (!projects.length) {
        console.log(chalk.red("No projects found"));
        process.exit(0);
      }
      return projects.map((project) => project.replace(".json", ""));
    } catch (error) {
      console.log("Something went wrong reading the projects");
      process.exit(1);
    }
  }

  async remove(
    projectName: string,
  ): Promise<["success", undefined] | ["error", string]> {
    try {
      await fsAsync.unlink(`${this.zapMuxDir}/${projectName}.json`);
      return ["success", undefined];
    } catch (error) {
      return ["error", chalk.red("Project not found")];
    }
  }
}

let db = Object.freeze(new Db());

export default db;
