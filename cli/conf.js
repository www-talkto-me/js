import { existsSync, readFileSync } from "fs";
import OPENCLAW from "./const/OPENCLAW.js";

const { env } = process;

export default () => {
  const { OPENCLAW_GATEWAY_TOKEN: env_token, OPENCLAW_GATEWAY_URL: env_url } = env,
    [, config_path, identity_path] = OPENCLAW;

  let token = env_token || null,
    port = 18789;

  if (existsSync(config_path)) {
    const { gateway: { auth: { token: t } = {}, port: p = 18789 } = {} } = JSON.parse(
      readFileSync(config_path, "utf-8"),
    );
    if (!env_token && t) token = t;
    port = p;
  }

  const device = existsSync(identity_path)
    ? JSON.parse(readFileSync(identity_path, "utf-8"))
    : null;

  return { token, ws_url: env_url || `ws://127.0.0.1:${port}`, device };
};
