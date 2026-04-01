#!/usr/bin/env bun

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { join, isAbsolute } from "node:path";
import gen from "../gen.js";
import watch from "../watch.js";

const {
    dir,
    web_dir,
    srv_save,
    watch: isWatch
  } = yargs(hideBin(process.argv))
    .option("dir", { type: "string", demandOption: true })
    .option("web_dir", { type: "string", demandOption: true })
    .option("srv_save", { type: "string", demandOption: true })
    .option("watch", { type: "boolean", default: false })
    .parseSync(),
  save_path = isAbsolute(srv_save) ? srv_save : join(process.cwd(), srv_save),
  { default: srvSave } = await import(save_path);

await gen(dir, web_dir, srvSave);

if (isWatch) {
  await watch(dir, web_dir, srvSave);
}
