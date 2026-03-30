import sleep from "@3-/sleep";

const RECONNECT_MS = 1000;

export default (dial) => {
  let rpc,
    { promise: ready, resolve: ready_r } = Promise.withResolvers(),
    is_ready = false,
    cur_ws;

  const pending_q = [],
    process_pending = async (method, params, resolve) => {
      resolve(await rpc(method, params));
    },
    flush = () => {
      while (pending_q.length && is_ready) {
        process_pending(...pending_q.shift());
      }
    },
    loop = async () => {
      for (;;) {
        is_ready = false;
        const r = await dial();

        if (!r) {
          await sleep(RECONNECT_MS);
          continue;
        }

        const [ws, send_rpc] = r;
        cur_ws = ws;
        rpc = send_rpc;
        is_ready = true;
        ready_r();
        flush();

        await new Promise((resolve) => {
          ws.once("close", () => {
            is_ready = false;
            ({ promise: ready, resolve: ready_r } = Promise.withResolvers());
            resolve();
          });
        });

        await sleep(RECONNECT_MS);
      }
    },
    sendRpc = async (method, params) => {
      if (is_ready) return rpc(method, params);
      return new Promise((r) => {
        pending_q.push([method, params, r]);
      });
    };

  loop();

  return [sendRpc, () => ready, () => cur_ws];
};
