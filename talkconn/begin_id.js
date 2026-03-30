import { join, dirname } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import b64U64 from "@3-/intbin/b64U64.js";
import USER from "./dir/USER.js";

const MAP = new Map(),
  p = (uid) => join(USER, `${uid}/begin_id`),
  read = (uid) => {
    const f = p(uid);
    return existsSync(f) ? +readFileSync(f, "utf8") : 0;
  };

export const set = (uid, begin_id) => {
    const k = b64U64(uid);
    if ((MAP.get(k) || 0) >= begin_id) return;
    MAP.set(k, begin_id);
    const f = p(uid);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, String(begin_id));
  },
  get = (uid) => {
    const k = b64U64(uid);
    let r = MAP.get(k);
    if (r !== undefined) return r;
    r = read(uid);
    MAP.set(k, r);
    return r;
  };
