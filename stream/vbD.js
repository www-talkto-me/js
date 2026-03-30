export default (b, i, max) => {
  let v = 0,
    s = 0;
  for (; i < max; i++) {
    const x = b[i];
    v |= (x & 0x7f) << s;
    s += 7;
    if (x < 128) return [v >>> 0, i + 1];
    if (s >= 35) throw new Error("invalid vbyte");
  }
  return;
};
