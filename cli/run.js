#!/usr/bin/env node

import initWs from "./conn/ws.js";
import req from "@3-/stream/req.js";
import reply from "./reply.js";
import msgIn from "./msgIn.js";
import NAME from "./const/NAME.js";
import { readConf, readUser } from "@talkto-me/conn/conf.js";
import { get as beginIdGet } from "@talkto-me/conn/begin_id.js";
import { KIND_MSG, KIND_MSG_LI } from "@3-/stream/KIND.js";

export default async () => {
  const SESSION_PREFIX = `agent:main:${NAME}:`,
    { user: MY_UID } = readConf() || {},
    { token: TOKEN, api: API } = (MY_UID && readUser(MY_UID)) || {};

  if (!MY_UID || !TOKEN || !API) {
    throw new Error("未登录或配置不完整，请先运行 talkto.me signin");
  }

  const VISITORS = new Map(),
    PENDING_ID = new Map(),
    [rpc, onReady, ws] = initWs(),
    onMsg = reply(SESSION_PREFIX, MY_UID, TOKEN, VISITORS, PENDING_ID, API, rpc),
    handleRow = msgIn(VISITORS, PENDING_ID, rpc, onReady),
    listenWs = async () => {
      for (;;) {
        await onReady();
        const cur = ws();
        cur.on("message", onMsg);
        console.log("OpenClaw 就绪");
        await new Promise((r) => cur.on("close", r));
      }
    };

  listenWs();

  try {
    for await (const [kind, data] of req(
      MY_UID,
      `${API}claw/cli/${MY_UID}`,
      { headers: { t: TOKEN } },
      beginIdGet,
      () => {},
    )) {
      console.log("网页长连接 →", kind, data);
      if (kind === KIND_MSG_LI) {
        for (const row of data) await handleRow(row);
      } else if (kind === KIND_MSG) {
        await handleRow(data);
      }
    }
  } catch (e) {
    console.error(e);
  }
};
