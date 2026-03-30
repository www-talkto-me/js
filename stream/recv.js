import utf8d from "@3-/utf8/utf8d.js";
import { KIND_MSG, KIND_MSG_LI } from "./KIND.js";

const frame = async (reader) => {
  const { value, done } = await reader.read();
  return done ? null : [value.type, utf8d(value.data)];
};

export default async (uid, reader, set) => {
  if (!reader) return frame(uid);
  const r = await frame(reader);
  if (!r) return;

  let [type, msg] = r;
  if ([KIND_MSG_LI, KIND_MSG].includes(type)) {
    msg = JSON.parse(msg);
    if (type === KIND_MSG_LI) {
      if (msg?.length) set(uid, msg.at(-1)[0]);
    } else {
      set(uid, msg[0]);
    }
  }

  return [type, msg];
};
