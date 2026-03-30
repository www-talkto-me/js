import { existsSync } from "fs";
import yaml from "js-yaml";
import pkgVer from "./pkgVer.js";
import read from "@3-/read";
import write from "@3-/write";
import installCmd from "./installCmd.js";
import autoInstall from "./autoInstall.js";

const INTERVAL = 12 * 60 * 60 * 1000;

export default async (pkg, ver, config_path) => {
  const config = existsSync(config_path) ? yaml.load(await read(config_path)) || {} : {},
    now = Date.now(),
    { updater = {} } = config,
    { last_check = 0, disable } = updater;

  if (disable) return;

  if (now - last_check > INTERVAL) {
    config.updater = { ...updater, last_check: now };
    await write(config_path, yaml.dump(config));

    const [latest, registry] = await pkgVer(pkg);

    if (
      latest &&
      latest.localeCompare(ver, undefined, { numeric: true, sensitivity: "base" }) > 0
    ) {
      const cmd = installCmd(pkg, registry);
      if (cmd) {
        console.log(`${pkg} ${ver} → ${latest}`);
        return () => autoInstall(cmd);
      }
    }
  }
};
