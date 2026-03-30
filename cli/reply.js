
import sendMsg from "@talkto-me/conn/send.js";
import { set as beginIdSet } from "@talkto-me/conn/begin_id.js";

const parseResponse = (text) => {
  const li = (text + "\n").split("\nNO_REPLY\n");
  while (li.length) {
    const t = li.pop().trim();
    if (t) {
      return t;
    }
  }
  return "";
};

export default (session_prefix, my_uid, token, visitors, pending_id, API, rpc) => async (data) => {
  const { payload } = JSON.parse(data),
    { state, sessionKey } = payload ?? {};

  if (!sessionKey?.startsWith(session_prefix)) return;
  if (state !== "final") return;

  const visitor_id = sessionKey.slice(session_prefix.length),
    entry = visitors.get(visitor_id);

  if (!entry) return;

  // OpenClaw 新版网关的 WS 推送精简了结束事件的 payload，不再携带完整的 message。
  // 因此必须在收到 final 信号后，主动通过 RPC 拉取最后一条完整的助理消息。
  const get_res = await rpc("sessions.get", { key: sessionKey }),
    msgs = get_res.payload?.messages ?? [],
    message = msgs[msgs.length - 1];

  if (message?.role !== "assistant") return;

  const commit_id = pending_id.get(visitor_id);

  let i = 0;
  for (const { type: t, text } of message.content ?? []) {
    if (t !== "text") continue;
    const parsed_text = parseResponse(text);
    console.log(parsed_text);
    await entry.notify(`智能回复: ${parsed_text}`, `o${commit_id}-${++i}`);
    await sendMsg(my_uid, token, entry.uid_b64, parsed_text, API);
  }

  if (commit_id) {
    beginIdSet(my_uid, commit_id);
  }
  pending_id.delete(visitor_id);
};
