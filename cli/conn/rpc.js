export const rpc = (method, params = {}) => ({
  type: "req",
  id: crypto.randomUUID(),
  method,
  params,
});

export const bindRpc = (ws) => {
  const pending = new Map();
  let on_event;

  ws.on("message", (buf) => {
    const d = JSON.parse(buf);
    if (on_event?.(d)) {
      on_event = null;
    } else if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d);
      pending.delete(d.id);
    }
  });

  ws.once("close", () => {
    for (const r of pending.values()) r(null);
    pending.clear();
    if (on_event) {
      on_event = null;
    }
  });

  const send = (method, params) => {
      const req = rpc(method, params);
      return new Promise((r) => {
        pending.set(req.id, r);
        ws.send(JSON.stringify(req));
      });
    },
    waitEvent = (pred) =>
      new Promise((r) => {
        on_event = (d) => pred(d) && (r(d), true);
      });

  return [send, waitEvent];
};
