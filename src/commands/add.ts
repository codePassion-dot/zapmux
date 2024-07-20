import { input } from "@inquirer/prompts";
import fs from "fs";
import os from "os";
import db from "../utils/db";
import process from "process";
import path from "path";

const validateInput = (input: string) => {
  if (!input) return "This field is required";

  if (input.startsWith("~")) {
    const expandedPath = input.replace("~", os.homedir());
    const resolvedPath = path.resolve(expandedPath);
    if (!fs.existsSync(resolvedPath)) {
      return "Path does not exist";
    }
    return true;
  }

  if (input.startsWith("..")) {
    const resolvedPath = path.resolve(input);
    if (!fs.existsSync(resolvedPath)) {
      return "Path does not exist";
    }
    return true;
  }

  if (input.startsWith(".")) {
    const expandedPath = input.replace(".", process.cwd());
    const resolvedPath = path.resolve(expandedPath);
    if (!fs.existsSync(resolvedPath)) {
      return "Path does not exist";
    }
    return true;
  }

  const resolvedPath = path.resolve(input);
  if (!fs.existsSync(resolvedPath)) {
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
