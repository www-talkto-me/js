#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { $ } from "@3-/zx";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import write from "@3-/write";
import read from "@3-/read";

process.chdir(import.meta.dirname);

const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 <NAME> [description]")
    .demandCommand(1, 1, "Error: You must specify the NAME of the new workspace package.")
    .help("h")
    .alias("h", "help")
    .parseSync(),
  name = String(argv._[0]);

if (fs.existsSync(name)) {
  console.error(`Directory ${name} already exists.`);
  process.exit(1);
}

const child_pkg = {
  name: `@3-/${name}`,
  version: "0.1.0",
  description: "",
  keywords: [],
  license: "MIT",
  repository: {
    type: "git",
    url: "git+https://github.com/www-talkto-me/js.git",
    directory: name,
  },
  type: "module",
  exports: {
    ".": "./lib.js",
    "./*": "./*",
  },
  dependencies: {},
};

await write(path.join(name, "package.json"), JSON.stringify(child_pkg, null, 2) + "\n");
await write(path.join(name, "lib.js"), "export default () => {};\n");

const pkg_path = "package.json",
  root_pkg = JSON.parse(read(pkg_path));

if (!root_pkg.workspaces) {
  root_pkg.workspaces = [];
}

if (!root_pkg.workspaces.includes(name)) {
  root_pkg.workspaces.push(name);
  root_pkg.workspaces.sort();
  await write(pkg_path, JSON.stringify(root_pkg, null, 2) + "\n");
}

console.log(`Created workspace '@3-/${name}' at directory '${name}'
Running bun i...`);

await $`bun i`;
