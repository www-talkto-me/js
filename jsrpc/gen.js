#!/usr/bin/env bun

import { walkRel } from "@3-/walk";
import read from "@3-/read";
import write from "@3-/write";
import parse from "./parse.js";
import { join } from "node:path";
import web from "./web.js";
import srv from "./srv.js";

export default async (dir, web_dir, srvSave) => {
  const srv_js = [];
  for await (const fp of walkRel(dir, (fp) => {
    return "._".includes(fp[0]);
  })) {
    const li = parse(read(join(dir, fp))),
      key = fp.slice(0, -3);
    write(join(web_dir, fp), web(key, li));
    srv_js.push(srv(key, li));
  }
  srvSave(srv_js.join("\n"));
};
