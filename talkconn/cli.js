#!/usr/bin/env bun
import run from "./index.js";
import signin from "./signin.js";

const t = process.argv[2];

if (t) await signin(t);

for await (const msg of run()) console.log(msg);
