import { execAsync } from "./child-process";

export const listTmuxSessions = async () => {
  try {
    const runningSessions = (await execAsync('tmux list-sessions -F "#S"'))
      .toString()
      .split("\n");
    return runningSessions;
  } catch (error) {
    return [];
  }
};

export const createTmuxSession = async ({
  sessionName,
  path,
  initialWindowName,
}: {
  sessionName: string;
  path: string;
  config: string;
  initialWindowName: string;
}) => {
  await execAsync(
    `tmux new-session -d -s ${sessionName} -c ${path} -n ${initialWindowName}`,
  );
};

export const createWindowForTmuxSession = async ({
  sessionName,
  path,
  windowName,
}: {
  sessionName: string;
  path: string;
  windowName: string;
}) => {
  await execAsync(
    `tmux new-window -t ${sessionName} -c ${path} -d -n ${windowName}`,
  );
};

export const sendKeysToWindow = async ({
  sessionName,
  windowName,
  command,
}: {
  sessionName: string;
  windowName: string;
  command: string | null | undefined;
}) => {
  await execAsync(
    `tmux send-keys -t ${sessionName}:${windowName} '${command}' Enter`,
  );
};

export const killTmuxSession = async (sessionName: string) => {
  await execAsync(`tmux kill-session -t ${sessionName}`);
};
