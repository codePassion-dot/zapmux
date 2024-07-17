import path from "path";
import db from "../lib/db";
import child_process from "child_process";
import os from "os";

const execAsync = (command: string) =>
  new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });

const CONFIG = path.join(os.homedir(), "/.tmux.conf");

export default async (projects: string[]) => {
  for (const projectName of projects) {
    const projectContent = await db.read(projectName);
    await execAsync(
      `tmux -u -f ${CONFIG} new-session -d -s ${projectName} -n ${projectContent.windows[0].windowName} ${projectContent.windows[0].commandToRunOnStart}`,
    );

    const windows = projectContent.windows;

    for (let i = 1; i < windows.length; i++) {
      await execAsync(
        `tmux -u -f ${CONFIG} new-window -t ${projectName}:${i} -n ${windows[i].windowName} ${windows[i].commandToRunOnStart}`,
      );
    }
  }
};
