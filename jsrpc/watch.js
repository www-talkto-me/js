import { rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { watch } from "chokidar";
import { walkRel } from "@3-/walk";
import write from "@3-/write";
import build from "./build.js";

export default async (dir, web_dir, srvSave) => {
  const srv_cache = new Map(),
    saveSrv = () =>
      srvSave(
        [...srv_cache.keys()]
          .sort()
          .map((k) => srv_cache.get(k))
          .join("\n")
      ),
    watcher = watch(dir, { ignoreInitial: true });

  for await (const fp of walkRel(dir, (fp) => "._".includes(fp[0]))) {
    if (fp.endsWith(".js")) {
      srv_cache.set(fp, build(dir, fp)[1]);
    }
  }

  watcher.on("all", async (event, path) => {
    const fp = relative(dir, path);
    if (!fp.endsWith(".js") || fp.split("/").some((p) => "._".includes(p[0]))) return;

    if (event === "add" || event === "change") {
      const [web_str, srv_str] = build(dir, fp);
      write(join(web_dir, fp), web_str);
      srv_cache.set(fp, srv_str);
      saveSrv();
    } else if (event === "unlink") {
      srv_cache.delete(fp);
      await rm(join(web_dir, fp), { force: true });
      saveSrv();
    }
  });
};
