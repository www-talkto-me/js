import WebSocket from "ws";
import loadConf from "../conf.js";
import buildDeviceBlock from "../sign.js";
import { bindRpc } from "./rpc.js";
import reconnect from "./reconnect.js";
import pkg from "../const/PACKAGE.js";

const { version } = pkg,
  SCOPES = ["operator.read", "operator.write", "operator.admin"],
  dial = async () => {
    const { token, ws_url, device } = loadConf(),
      ws = new WebSocket(ws_url),
      [send_rpc, waitEvent] = bindRpc(ws),
      challenge_p = waitEvent((d) => d.type === "event" && d.event === "connect.challenge"),
      opened = await new Promise((resolve) => {
        ws.once("open", () => resolve(true));
        ws.once("error", () => resolve(false));
      });

    if (!opened) {
      console.log("openclaw websocket 连接失败，尝试重连...");
      return null;
    }

    const {
        payload: { nonce },
      } = await challenge_p,
      auth_payload = token ? { auth: { token } } : {},
      device_block = device ? buildDeviceBlock(device, { scopes: SCOPES, token, nonce }) : {},
      connect_res = await send_rpc("connect", {
        role: "operator",
        scopes: SCOPES,
        minProtocol: 3,
        maxProtocol: 3,
        client: { id: "cli", version, platform: process.platform, mode: "cli" },
        ...auth_payload,
        ...(device ? { device: device_block } : {}),
      });

    if (!connect_res.ok) {
      console.log("握手失败:", connect_res.error?.message);
      ws.close();
      return null;
    }

    console.log("握手成功");
    return [ws, send_rpc];
  };

export default () => reconnect(dial);
