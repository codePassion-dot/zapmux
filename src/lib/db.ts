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
      console.error("Something went wrong saving the new project");
      process.exit(1);
    }
  }

  async read(projectName: string) {
    try {
      const project = await fsAsync.readFile(
        `${this.zapMuxDir}/${projectName}.json`,
        "utf-8",
      );

      const parsedProject = JSON.parse(project);

      if (!isValidProject(parsedProject)) {
        throw new Error("Invalid project format");
      }
      return parsedProject;
    } catch (error) {
      console.error("Project not found");
      process.exit(1);
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
}

let db = Object.freeze(new Db());

export default db;
