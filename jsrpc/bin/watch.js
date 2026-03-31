#!/usr/bin/env bun

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { join, isAbsolute } from "node:path";
import watch from "../watch.js";

const { dir, web_dir, srv_save } = yargs(hideBin(process.argv))
    .option("dir", { type: "string", demandOption: true })
    .option("web_dir", { type: "string", demandOption: true })
    .option("srv_save", { type: "string", demandOption: true })
    .parseSync(),
  save_path = isAbsolute(srv_save) ? srv_save : join(process.cwd(), srv_save),
  { default: srvSave } = await import(save_path);

await watch(dir, web_dir, srvSave);
