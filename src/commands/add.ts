import { input } from "@inquirer/prompts";
import fs from "fs";
import os from "os";
import db from "../lib/db";
import process from "process";

const validateInput = (input: string) => {
  switch (input[0]) {
    case "":
      return "This field is required";
    case "~":
      if (!fs.existsSync(input.replace("~", os.homedir()))) {
        return "Path does not exist";
      }

    case ".":
      if (!fs.existsSync(input.replace(".", process.cwd()))) {
        return "Path does not exist";
      }
  }

  if (!fs.existsSync(input)) {
    return "Path does not exist";
  }

  return true;
};

export default async () => {
  let projectPath = await input({
    message: "Where is your project",
    required: true,
    validate: validateInput,
  });

  if (projectPath === ".") {
    projectPath = process.cwd();
  }

  const lastPathSegment = projectPath.split("/").pop();

  const projectName = await input({
    message: `What is the name of your project ${lastPathSegment}`,
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
