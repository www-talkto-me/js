import visitorChat from "./visitorChat.js";
import u64B64 from "@3-/intbin/u64B64.js";
import NAME from "./const/NAME.js";

export default (visitors, pending_id, rpc, onReady) => {
  const ensure = async (from_id) => {
    const visitor_id = String(from_id);
    if (visitors.has(visitor_id)) return visitors.get(visitor_id);

    await onReady();

    const [, notify, chat, abort] = visitorChat(rpc, visitor_id),
      uid_b64 = u64B64(from_id);
    visitors.set(visitor_id, { notify, chat, abort, uid_b64 });
    return visitors.get(visitor_id);
  };

  return async ([msg_id, from_id, , text]) => {
    const msg = `${NAME} 访客 ${from_id}: ${text}`;
    console.log("→", msg);
    const visitor_id = String(from_id),
      entry = await ensure(from_id);

    if (!entry) return;

    await entry.notify(msg, "notify-in-" + msg_id);

    if (pending_id.has(visitor_id)) {
      await entry.abort();
    }

    pending_id.set(visitor_id, msg_id);
    await entry.chat(text, msg_id);
  };
};
