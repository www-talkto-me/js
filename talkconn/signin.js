import { readUser, writeUser, writeConf } from "./conf.js";

export default async (token, api) => {
  const res = await fetch(`${api}token/uid`, { headers: { t: token } }),
    uid = await res.text(),
    user = readUser(uid) || {};
  writeUser(uid, { ...user, token, uid, api });
  writeConf({ user: uid });
  console.log("✅ talkto.me signed");
  return { token, uid };
};
