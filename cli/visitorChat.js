import send from "./send.js";
import NAME from "./const/NAME.js";

export default (sendRpc, visitor_id) => {
  const session_key = `agent:main:${NAME}:${visitor_id}`,
    notify = (msg, id_key) => send(sendRpc, msg, session_key, id_key),
    abort = () => sendRpc("chat.abort", { sessionKey: session_key }),
    chat = (push_msg, idempotencyKey) =>
      sendRpc("chat.send", {
        sessionKey: session_key,
        message: `/${NAME.replaceAll(".", "_")} ${push_msg}`,
        idempotencyKey: String(idempotencyKey),
      });

  return [session_key, notify, chat, abort];
};
