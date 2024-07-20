import fs from "fs";
import path from "path";
import os from "os";

export const getResolvedPath = (input: string) => {
  if (!input) return [400, "input can not be falsy"];

  if (input.startsWith("~")) {
    const expandedPath = input.replace("~", os.homedir());
    const resolvedPath = path.resolve(expandedPath);
    if (!fs.existsSync(resolvedPath)) {
      return [404, "Path does not exist"];
    }
    return [200, resolvedPath];
  }

  if (input.startsWith("..")) {
    const resolvedPath = path.resolve(input);
    if (!fs.existsSync(resolvedPath)) {
      return [404, "Path does not exist"];
    }
    return [200, resolvedPath];
  }

  if (input.startsWith(".")) {
    const expandedPath = input.replace(".", process.cwd());
    const resolvedPath = path.resolve(expandedPath);
    if (!fs.existsSync(resolvedPath)) {
      return [404, "Path does not exist"];
    }
    return [200, resolvedPath];
  }

  const resolvedPath = path.resolve(input);
  if (!fs.existsSync(resolvedPath)) {
    return [404, "Path does not exist"];
  }
  return [200, resolvedPath];
};
