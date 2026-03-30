import req from "@3-/stream/req.js";
import { readConf, readUser } from "./conf.js";
import { get as beginIdGet, set as beginIdSet } from "./begin_id.js";

export default (base) => {
  const { user: uid } = readConf() || {},
    { token } = (uid && readUser(uid)) || {};

  if (!uid || !token) {
    throw new Error("miss user / token");
  }

  return req(uid, `${base}claw/cli/${uid}`, { headers: { t: token } }, beginIdGet, beginIdSet);
};
