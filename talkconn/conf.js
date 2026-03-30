import { join, dirname } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { load, dump } from "js-yaml";
import CONF_DIR from "./dir/CONF.js";
import userPath from "./dir/userPath.js";

const ensure = (dir) => mkdirSync(dir, { recursive: true }),
  readYml = (path) => (existsSync(path) ? load(readFileSync(path, "utf8")) : undefined),
  writeYml = (path, data) => {
    ensure(dirname(path));
    writeFileSync(path, dump(data));
  };

export const CONF_PATH = join(CONF_DIR, "conf.yml"),
  readConf = () => readYml(CONF_PATH),
  writeConf = (data) => writeYml(CONF_PATH, data),
  readUser = (id) => readYml(userPath(id)),
  writeUser = (id, data) => writeYml(userPath(id), data);
