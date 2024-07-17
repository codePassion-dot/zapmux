import fs from "fs";
import path from "path";

import fsAsync from "fs/promises";
import os from "os";

type ProjectWindow = {
  windowName: string;
  commandToRunOnStart: string | undefined | null;
};

type Windows = Array<ProjectWindow>;

const isValidProjectName = (
  project: object | ProjectWindow,
): project is ProjectWindow => {
  return (
    typeof (project as ProjectWindow).windowName === "string" &&
    "commandToRunOnStart" in (project as ProjectWindow)
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
        path.join(os.homedir(), `${this.zapMuxDir}/${projectName}.json`),
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

      if (!isValidProjectName(parsedProject)) {
        throw new Error("Invalid project format");
      }
      return parsedProject;
    } catch (error) {
      console.error("Project not found");
      process.exit(1);
    }
  }
}

let db = Object.freeze(new Db());

export default db;
