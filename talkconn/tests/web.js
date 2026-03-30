import _conn from "@3-/stream/conn.js";
import recv from "@3-/stream/recv.js";

const ORIGIN = "http://test.example.com",
  req = (base, id, opt) => fetch(`${base}/claw/web/${id}`, opt);

const conn = (base, bid_cookie, from_uid_b64, to_uid_b64, begin_id) => {
    const headers = { origin: ORIGIN, cookie: `b=${bid_cookie}; u=${from_uid_b64}` };
    if (begin_id != null) headers.begin_id = String(begin_id);
    return _conn(`${base}/claw/web/${to_uid_b64}`, { headers });
  },
  send = (base, bid_cookie, from_uid_b64, to_uid_b64, msg) =>
    req(base, to_uid_b64, {
      method: "POST",
      headers: { origin: ORIGIN, cookie: `b=${bid_cookie}; u=${from_uid_b64}` },
      body: msg,
    });

export default { conn, send, recv };
