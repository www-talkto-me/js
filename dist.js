#!/usr/bin/env bun

import { $, cd } from "zx";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import yaml from "js-yaml";
import packlist from "npm-packlist";
import Arborist from "@npmcli/arborist";
import u8merge from "@3-/u8/u8merge.js";
import utf8e from "@3-/utf8/utf8e.js";
import md5B64 from "@3-/base64url/md5B64.js";

$.verbose = 1;

const ROOT = import.meta.dirname,
  PUBLISH_YML = join(ROOT, ".publish.yml"),
  jsonByPath = (path) => JSON.parse(readFileSync(path, "utf8")),
  writeStr = (path, content) => writeFileSync(path, content, "utf8"),
  PACKAGES = jsonByPath(join(ROOT, "package.json")).workspaces || [],
  HASHES = existsSync(PUBLISH_YML) ? yaml.load(readFileSync(PUBLISH_YML, "utf8")) || {} : {},
  CHANGED = [],
  CURRENT = {},
  hashPkg = async (pkg) => {
    const pkg_dir = join(ROOT, pkg),
      arborist = new Arborist({ path: pkg_dir });

    cd(pkg_dir);

    const tree = await arborist.loadActual(),
      files = await packlist(tree),
      buffers = files.sort().flatMap((file) => {
        const file_path = join(pkg_dir, file);
        if (file === "package.json") {
          const pkg_json = jsonByPath(file_path);
          delete pkg_json.version;
          return [utf8e(file), utf8e(JSON.stringify(pkg_json))];
        }
        return [utf8e(file), new Uint8Array(readFileSync(file_path))];
      }),
      hash = md5B64(u8merge(buffers)),
      pkg_json = jsonByPath(join(pkg_dir, "package.json"));

    CURRENT[pkg] = { hash, name: pkg_json.name, deps: Object.keys(pkg_json.dependencies || {}) };

    if (HASHES[pkg] !== hash) {
      CHANGED.push({ dir: pkg, name: CURRENT[pkg].name, hash });
    }
  },
  updateChanged = () => {
    for (let len = 0; len !== CHANGED.length; ) {
      len = CHANGED.length;
      for (const pkg of PACKAGES) {
        if (
          !CHANGED.some((c) => c.dir === pkg) &&
          CURRENT[pkg].deps.some((d) => CHANGED.some((c) => c.name === d))
        ) {
          CHANGED.push({ dir: pkg, name: CURRENT[pkg].name, hash: CURRENT[pkg].hash });
        }
      }
    }
  },
  publishChanged = async () => {
    CHANGED.sort((a, b) =>
      CURRENT[a.dir].deps.includes(b.name) ? 1 : CURRENT[b.dir].deps.includes(a.name) ? -1 : 0,
    );
    cd(ROOT);

    for (const { dir: pkg_dir } of CHANGED) {
      const p = join(ROOT, pkg_dir, "package.json"),
        j = jsonByPath(p),
        v = j.version.split(".");

      v[2] = parseInt(v[2] || 0) + 1;
      j.version = v.join(".");
      writeStr(p, JSON.stringify(j, null, 2) + "\n");
    }

    await $`bun install`;

    const git_remote_url = (await $`git remote get-url origin`).stdout.trim(),
      git_base = git_remote_url.replace(/\.git$/, ""),
      git_org = git_base.split("/").slice(-2).join("/");

    for (const { dir: pkg_dir } of CHANGED) {
      cd(join(ROOT, pkg_dir));

      try {
        await $`bun x mdt .`;
      } catch {}

      const to_dir = `/tmp/${git_org}/${pkg_dir}`;
      await $`rm -rf ${to_dir}`;
      await $`mkdir -p ${to_dir}`;

      await $`rsync -avz --filter=':- .gitignore' --exclude='tests' --exclude='.*' --exclude='*.mdt' --exclude='node_modules' --exclude='readme' --exclude='AGENTS.md' . ${to_dir}`;

      const hook_rsync = join(ROOT, pkg_dir, "hook/dist/rsync/");
      if (existsSync(hook_rsync)) {
        await $`rsync -av ${hook_rsync}/ ${to_dir}/`;
      }

      cd(to_dir);
      const pkg_json_path = join(to_dir, "package.json"),
        origin_pkg_json = readFileSync(pkg_json_path, "utf8"),
        has_workspace = origin_pkg_json.includes('"workspace:*"');

      if (has_workspace) {
        const replaced_pkg = origin_pkg_json.replace(
          new RegExp(
            `"(${PACKAGES.map((p) => CURRENT[p].name).join("|")})":\\s*"workspace:\\*"`,
            "g",
          ),
          (_, dep) => {
            const p = PACKAGES.find((p) => CURRENT[p].name === dep),
              dep_ver = jsonByPath(join(ROOT, p, "package.json")).version;

            return `"${dep}": "${dep_ver}"`;
          },
        );
        writeStr(pkg_json_path, replaced_pkg);
      }

      await $`bun publish --access=public --registry=https://registry.npmjs.org/`;

      const new_ver = jsonByPath(pkg_json_path).version;
      cd(ROOT);
      try {
        await $`bun ${join(ROOT, "sh/sync.js")} --project ${pkg_dir} --version ${new_ver}`;
      } catch {}
    }

    cd(ROOT);

    for (const { dir: pkg_dir, hash } of CHANGED) {
      HASHES[pkg_dir] = hash;
    }
    writeStr(PUBLISH_YML, yaml.dump(HASHES));

    const msg = CHANGED.map(
      (c) => `${c.name} v${jsonByPath(join(ROOT, c.dir, "package.json")).version}`,
    ).join(", ");
    await $`git add .`;
    try {
      await $`git commit -m ${`chore: release ${msg}`}`;
      await $`git push`;
    } catch {}
  };

for (const pkg of PACKAGES) await hashPkg(pkg);
updateChanged();
if (CHANGED.length > 0) {
  await publishChanged();
} else {
  console.log("No package changes detected.");
}
