import vbD from "./vbD.js";

const ERR_FRAME = new Error("invalid frame"),
  E0 = new Uint8Array(0);

export default () => {
  let buf = E0;

  return new TransformStream({
    transform(chunk, ctrl) {
      const bl = buf.length,
        cl = chunk.length;
      if (bl) {
        const t = new Uint8Array(bl + cl);
        t.set(buf);
        t.set(chunk, bl);
        buf = t;
      } else buf = chunk;

      let off = 0,
        len = buf.length;
      while (off < len) {
        const lr = vbD(buf, off, len);
        if (!lr) break;
        const [l, to] = lr;

        if (to + l > len) break;

        const tr = vbD(buf, to, to + l);
        if (!tr) return ctrl.error(ERR_FRAME);

        const [type, doff] = tr;
        ctrl.enqueue({ type, data: buf.slice(doff, to + l) });
        off = to + l;
      }

      buf = off === len ? E0 : buf.slice(off);
    },
    flush(ctrl) {
      if (buf.length) ctrl.error(ERR_FRAME);
    },
  });
};
