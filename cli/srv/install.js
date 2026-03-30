import { join } from "path";
import { existsSync } from "fs";
import { CONF_PATH } from "@talkto-me/conn/conf.js";
import init from "../init.js";
import NAME from "../const/NAME.js";
import ROOT from "../const/ROOT.js";
import PACKAGE from "../const/PACKAGE.js";
import install from "@3-/srv/install.js";

export default async () => {
  if (process.env.TALKTO_ME_TOKEN) {
    await init();
  } else if (!existsSync(CONF_PATH)) {
    return console.warn("未初始化，缺失", CONF_PATH);
  }

  await install(NAME, join(ROOT, "srv.js"));
  console.log(NAME, "v" + PACKAGE.version);
};
