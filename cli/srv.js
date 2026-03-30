#!/usr/bin/env node

import sleep from "@3-/sleep";
import run from "./run.js";

if (import.meta.main) {
  for (const i of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(i, process.exit);
  for (;;) {
    try {
      await run();
    } catch (e) {
      console.log(e);
      await sleep(1e3);
    }
  }
}
