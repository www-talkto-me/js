import visitorChat from "./visitorChat.js";
import u64B64 from "@3-/intbin/u64B64.js";
import NAME from "./const/NAME.js";
import { existsSync } from "fs";
import { join } from "path";
import OPENCLAW from "./const/OPENCLAW.js";

const [STATE_DIR] = OPENCLAW;

export default (visitors, pending_id, rpc, onReady) => {
  const ensure = async (from_id) => {
    const visitor_id = String(from_id);
    await onReady();

    const [session_key, notify, chat, abort, reset] = visitorChat(rpc, visitor_id),
      res = await rpc("sessions.list"),
      sessions = res.ok && res.payload?.sessions;

    if (sessions) {
      const target_session = sessions.find((s) => s.key === session_key),
        session_id = target_session?.sessionId;

      if (session_id) {
        // 防止由于手动 rm 删除日志导致的底层 ENOENT 异常卡死 Agent 流，这里强制做基于存在性的确定性同步拦截
        const session_file = join(STATE_DIR, "agents", "main", "sessions", `${session_id}.jsonl`);
        if (!existsSync(session_file)) {
          console.warn(`[确定性拦截] 底层 ${session_file} 丢失，清理幽灵会话...`);
          await reset();
          visitors.delete(visitor_id);
        }
      }
    }

    if (visitors.has(visitor_id)) {
      return visitors.get(visitor_id);
    }

    const uid_b64 = u64B64(from_id);
    visitors.set(visitor_id, { notify, chat, abort, reset, uid_b64 });
    return visitors.get(visitor_id);
  };

  return async ([msg_id, from_id, , text]) => {
    const msg = `${NAME} 访客 ${from_id}: ${text}`,
      visitor_id = String(from_id),
      entry = await ensure(from_id);

    console.log("→", msg);

    if (!entry) return;

    await entry.notify(msg, "notify-in-" + msg_id);

    if (pending_id.has(visitor_id)) {
      await entry.abort();
    }

    pending_id.set(visitor_id, msg_id);
    await entry.chat(text, msg_id);
  };
};
