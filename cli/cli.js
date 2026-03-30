#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import NAME from "./const/NAME.js";

yargs(hideBin(process.argv))
  .command(
    "run",
    "运行服务",
    () => {},
    async () => (await import("./run.js")).default(),
  )
  .command(
    "init",
    "初始化",
    () => {},
    async () => (await import("./init.js")).default(),
  )
  .command("srv", "系统服务", (y) =>
    y
      .command(
        "install",
        "安装系统服务",
        () => {},
        async () => (await import("./srv/install.js")).default(),
      )
      .command(
        "uninstall",
        "卸载系统服务",
        () => {},
        async () => (await import("@3-/srv/uninstall.js")).default(NAME, () => {}),
      )
      .demandCommand(1, ""),
  )
  .demandCommand(1, "")
  .help()
  .parse();
