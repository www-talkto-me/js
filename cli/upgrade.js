import pkgVer from "@3-/updater/pkgVer.js";
import installCmd from "@3-/updater/installCmd.js";
import autoInstall from "@3-/updater/autoInstall.js";
import tryRestart from "@3-/srv/tryRestart.js";
import NAME from "./const/NAME.js";
import PACKAGE from "./const/PACKAGE.js";

export default async () => {
  const { name: pkg, version: ver } = PACKAGE;

  console.log(`正在检查 ${pkg} 的新版本...`);

  const [latest, registry] = await pkgVer(pkg),
    is_new =
      latest &&
      latest.localeCompare(ver, undefined, { numeric: true, sensitivity: "base" }) > 0,
    cmd = is_new ? installCmd(pkg, registry) : undefined;

  if (cmd) {
    console.log(`发现新版本! ${ver} → ${latest}\n开始执行升级: ${cmd}`);
    const process = autoInstall(cmd);
    await new Promise((resolve) => process.on("exit", resolve));
    if (await tryRestart(NAME)) {
      console.log(`后台服务已自动重启`);
    }
  } else if (is_new) {
    console.log(`无法自动识别安装环境，请手动升级。例如：npm i -g ${pkg}`);
  } else {
    console.log(`当前已是最新版本 (${ver})`);
  }
};
