import conn from "./conn.js";
import recv from "./recv.js";
import sleep from "@3-/sleep";

const SEC_1 = 1e3;

export default async function* (uid, url, opt, beginIdGet, beginIdSet) {
  let pre = 0,
    err;
  for (;;) {
    const now = Date.now();
    if (now - pre < SEC_1) {
      if (err) {
        console.error(err);
        err = undefined;
      }
      await sleep(SEC_1);
    }
    pre = Date.now();

    let _ctrl;
    try {
      const [reader, ctrl] = await conn(url, {
        ...opt,
        headers: { ...opt?.headers, begin_id: String(beginIdGet(uid) || 0) },
      });
      _ctrl = ctrl;

      for (;;) {
        const frame = await recv(uid, reader, beginIdSet);
        if (!frame) break;
        yield frame;
      }
    } catch (e) {
      if (Array.isArray(e)) throw e;
      err = e;
    } finally {
      if (_ctrl) _ctrl.abort();
    }
  }
}
