import unframe from "./unframe.js";

export default async (url, opt = {}) => {
  const ctrl = new AbortController();
  opt.signal = ctrl.signal;
  const res = await fetch(url, opt),
    { status } = res;
  if (![200, 500].includes(status)) throw [url, opt, status, await res.text()];
  return [res.body.pipeThrough(unframe()).getReader(), ctrl];
};
