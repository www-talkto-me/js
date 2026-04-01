import read from "@3-/read";
import parse from "./parse.js";
import { join } from "node:path";
import web from "./web.js";
import srv from "./srv.js";

export default (dir, fp) => {
  const li = parse(read(join(dir, fp))),
    key = fp.slice(0, -3);
  return [web(key, li), srv(key, li)];
};
