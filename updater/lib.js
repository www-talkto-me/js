import update from "./update.js";

const INTERVAL = 12 * 60 * 60 * 1000;

export default (pkg, ver, config_path, onUpdate) => {
  let timer = 1,
    resolve;

  const loop = async () => {
    while (timer) {
      try {
        const install = await update(pkg, ver, config_path);
        if (timer && install) {
          install();
          onUpdate?.();
        }
      } finally {
        if (timer) {
          await new Promise((r) => {
            resolve = r;
            timer = setTimeout(r, INTERVAL);
          });
        }
      }
    }
  };

  loop();

  // 取消
  return () => {
    clearTimeout(timer);
    timer = undefined;
    resolve?.();
  };
};
