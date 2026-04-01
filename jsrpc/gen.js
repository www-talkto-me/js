#!/usr/bin/env bun

import { rm } from "node:fs/promises";
import { join } from "node:path";
import write from "@3-/write";
import { walkRel } from "@3-/walk";
import build from "./build.js";

export default async (dir, web_dir, srvSave) => {
  await rm(web_dir, { recursive: true, force: true });

  const fp_li = [];

  for await (const fp of walkRel(dir, (fp) => "._".includes(fp[0]))) {
    if (fp.endsWith(".js")) fp_li.push(fp);
  }

  srvSave(
    fp_li
      .sort()
      .map((fp) => {
        const [web_str, srv_str] = build(dir, fp);
        write(join(web_dir, fp), web_str);
        return srv_str;
      })
      .join("\n"),
  );
};
