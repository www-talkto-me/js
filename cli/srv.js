#!/usr/bin/env node

import sleep from "@3-/sleep";
import run from "./run.js";
import updater from "@3-/updater/lib.js";
import PACKAGE from "./const/PACKAGE.js";
import NAME from "./const/NAME.js";
import CONF_DIR from "@talkto-me/conn/dir/CONF.js";
import { join } from "path";
import { spawn } from "child_process";

if (import.meta.main) {
  for (const i of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(i, process.exit);

  const { name: pkg, version: ver } = PACKAGE;
  const config_path = join(CONF_DIR, "updater.yml");
  updater(pkg, ver, config_path, () => {
    console.log(`[自动升级] 更新完成，正在自动重启...`);
    spawn(
      process.execPath,
      ["-e", `import("@3-/srv/tryRestart.js").then(m=>m.default("${NAME}"))`],
      {
        stdio: ["ignore", "ignore", "inherit"],
        detached: true,
      }
    ).unref();
    process.exit();
  });

  for (;;) {
    try {
      await run();
    } catch (e) {
      console.log(e);
      await sleep(1e3);
    }
  }
}
