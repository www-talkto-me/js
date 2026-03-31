import { relative } from "node:path";
import { watch } from "chokidar";
import { walkRel } from "@3-/walk";
import build from "./build.js";

export default async (dir, web_dir, srvSave) => {
  const js_set = new Set(),
    runBuild = () => build([...js_set], dir, web_dir, srvSave),
    watcher = watch(dir, { ignoreInitial: true });

  for await (const fp of walkRel(dir, (fp) => "._".includes(fp[0]))) {
    if (fp.endsWith(".js")) {
      js_set.add(fp);
    }
  }

  watcher.on("all", (event, path) => {
    const fp = relative(dir, path),
      is_valid = fp.endsWith(".js") && !fp.split("/").some((p) => "._".includes(p[0]));

    if (!is_valid) return;

    if (["add", "change"].includes(event)) {
      js_set.add(fp);
      runBuild();
    } else if (event === "unlink") {
      js_set.delete(fp);
      runBuild();
    }
  });
};
