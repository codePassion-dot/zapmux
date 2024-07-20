import { input } from "@inquirer/prompts";
import db from "../utils/db";
import process from "process";
import { getResolvedPath } from "../utils/path";

export default async () => {
  let projectPath = await input({
    message: "Where is your project",
    required: true,
    validate: (input) => {
      const [status] = getResolvedPath(input);
      if (status === 400) {
        return "This field is required";
      }
      if (status === 404) {
        return "Path does not exist";
      }
      return true;
    },
  });

  if (projectPath === ".") {
    projectPath = process.cwd();
  }

  const lastPathSegment = projectPath.split("/").pop();

  const projectName = await input({
    message: "What is the name of your project",
    default: lastPathSegment,
  });

  const numberOfWindows = await input({
    message: "How many windows do you want to open",
    validate: (input) => typeof parseInt(input) === "number",
    default: "1",
  });

  const windows = [];

  for (let i = 0; i < parseInt(numberOfWindows); i++) {
    const windowName = await input({
      message: `What is the name of window ${i + 1}`,
      required: true,
    });
    const commandToRunOnStart = await input({
      message: `What command do you want to run on start for window ${i + 1}`,
    });
    windows.push({
      windowName,
      commandToRunOnStart,
    });
  }

  await db.add(projectName, projectPath, windows);
};
