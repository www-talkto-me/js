#!/usr/bin/env bun

import { walkRel } from "@3-/walk";
import build from "./build.js";

export default async (dir, web_dir, srvSave) => {
  const fp_li = [];
  for await (const fp of walkRel(dir, (fp) => "._".includes(fp[0]))) {
    if (fp.endsWith(".js")) fp_li.push(fp);
  }
  build(fp_li, dir, web_dir, srvSave);
};
