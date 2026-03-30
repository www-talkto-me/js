import { spawn } from "child_process";

export default (cmd) => {
  const child = spawn(cmd, { stdio: ["ignore", "ignore", "inherit"], shell: true, detached: true });
  child.unref();
  return child;
};
