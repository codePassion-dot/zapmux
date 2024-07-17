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
    const windows = projectContent.windows;
    await execAsync(
      `tmux -u -f ${CONFIG} new-session -s ${projectName} -n ${windows[0].windowName} -d`,
    );
    await execAsync(
      `tmux send-keys -t ${projectName}:${windows[0].windowName} '${windows[0].commandToRunOnStart}' Enter`,
    );

    for (let i = 1; i < windows.length; i++) {
      await execAsync(
        `tmux new-window -t ${projectName} -d -n ${windows[i].windowName}`,
      );
      await execAsync(
        `tmux send-keys -t ${projectName}:${windows[i].windowName} '${windows[i].commandToRunOnStart}' Enter`,
      );
    }
  }
};
