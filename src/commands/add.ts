import { input } from "@inquirer/prompts";
import db from "../utils/db";
import { getResolvedPath } from "../utils/path";

export default async () => {
  const projectPath = await input({
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
    transformer: (input, { isFinal }) => {
      if (isFinal) {
        const [_, resolvedPath] = getResolvedPath(input);
        return resolvedPath;
      }
      return input;
    },
  });

  const [_, expandedPath] = getResolvedPath(projectPath);

  const lastPathSegment = expandedPath.split("/").pop();

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

  await db.add(projectName, expandedPath, windows);
};
