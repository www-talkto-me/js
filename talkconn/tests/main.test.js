#!/usr/bin/env bun test
import { expect, test, beforeAll, afterAll } from "vitest";
import { start } from "~/main.js";
import { KIND_MSG, KIND_MSG_LI, KIND_ONLINE, KIND_OFFLINE } from "@3-/stream/KIND.js";
import req from "@3-/stream/req.js";
import { get as beginIdGet, set as beginIdSet } from "../begin_id.js";
import send from "../send.js";
import webConn from "./web.js";
import { create as createToken, rmById } from "~/db/token/token.js";
import db from "@/TIDB.js";
import R from "@/R.js";
import { R_BID_UID } from "~/const/R.js";
import uuid from "@/uuid.js";
import bufB64 from "@3-/base64url/bufB64.js";
import { now } from "~/util/time.js";
import { upsert as upsertHost, rmByUid as rmHostByUid } from "~/db/host/uHost.js";
import u64Bin from "@3-/intbin/u64Bin.js";
import u64B64 from "@3-/intbin/u64B64.js";
import makeCookie from "~/util/cookie/gen.js";

const PORT = 3335,
  BASE = `http://127.0.0.1:${PORT}/`,
  server = start(PORT);

const CLI_UID = 1,
  WEB_UID = 2,
  TEST_BID = 99999,
  TEST_HOST_PREFIX = "test";

let token_str = "",
  token_id = 0;

beforeAll(async () => {
  const bin = uuid();
  token_str = bufB64(bin);
  const r = await createToken(CLI_UID, "talkconn-test", bin, now());
  token_id = r.lastInsertRowid;

  await R.zadd(R_BID_UID(TEST_BID), now(), u64Bin(WEB_UID));

  await db`DELETE FROM uHost WHERE host = ${TEST_HOST_PREFIX}`;
  await upsertHost(CLI_UID, TEST_HOST_PREFIX, now());

  await db`DELETE FROM chatThread WHERE a IN (${CLI_UID}, ${WEB_UID}) OR b IN (${CLI_UID}, ${WEB_UID})`;
  await db`DELETE FROM chat WHERE to_id IN (${CLI_UID}, ${WEB_UID})`;
});

afterAll(async () => {
  server.stop();
  if (token_id) await rmById(token_id);
  await R.del(R_BID_UID(TEST_BID));
  await rmHostByUid(CLI_UID);
  await db.close();
});

test("talkconn: 发送并进行普通接收验证", async () => {
  const uid_b64 = u64B64(CLI_UID),
    web_uid_b64 = u64B64(WEB_UID),
    bid_cookie = makeCookie(TEST_BID);

  const cliGen = req(
    uid_b64,
    `${BASE}claw/cli/${uid_b64}`,
    { headers: { t: token_str } },
    beginIdGet,
    beginIdSet,
  );
  const cliNext = async () => (await cliGen.next()).value;

  const cli_history = await cliNext();
  expect(cli_history[0]).toBe(KIND_MSG_LI);
  expect(cli_history[1].length).toBe(0);

  const [webReader, webCtrl] = await webConn.conn(BASE, bid_cookie, web_uid_b64, uid_b64);
  const webNext = () => webConn.recv(webReader);

  const web_online = await webNext();
  expect(web_online[0]).toBe(KIND_ONLINE);

  const web_history = await webNext();
  expect(web_history[0]).toBe(KIND_MSG_LI);
  expect(JSON.parse(web_history[1]).length).toBe(0);

  const r1 = await webConn.send(BASE, bid_cookie, web_uid_b64, uid_b64, "hello from web");
  expect(r1.status).toBe(200);

  const cli_got1 = await cliNext();
  expect(cli_got1[0]).toBe(KIND_MSG);
  expect(cli_got1[1][3]).toBe("hello from web");

  const r2 = await send(uid_b64, token_str, web_uid_b64, "hi from cli", BASE);
  expect(r2.status).toBe(200);

  const web_got1 = await webNext();
  expect(web_got1[0]).toBe(KIND_MSG);
  expect(JSON.parse(web_got1[1])[3]).toBe("hi from cli");

  await cliGen.return();
  const web_offline = await webNext();
  expect(web_offline[0]).toBe(KIND_OFFLINE);

  webCtrl.abort();
});

test("talkconn: 断网后历史离线消息获取验证", async () => {
  await new Promise((r) => setTimeout(r, 100)); // 等待上一个测试断线的异步通知完全送达服务端

  const uid_b64 = u64B64(CLI_UID),
    web_uid_b64 = u64B64(WEB_UID),
    bid_cookie = makeCookie(TEST_BID);

  // 1. 发送离线消息给 CLI
  const r1 = await webConn.send(BASE, bid_cookie, web_uid_b64, uid_b64, "offline msg 1");
  expect(r1.status).toBe(200);

  // 2. CLI 恢复连接
  const cliGen = req(
    uid_b64,
    `${BASE}claw/cli/${uid_b64}`,
    { headers: { t: token_str } },
    beginIdGet,
    beginIdSet,
  );
  const cliNext = async () => (await cliGen.next()).value;

  // 3. 拦截历史帧
  const cli_history = await cliNext();
  expect(cli_history[0]).toBe(KIND_MSG_LI);

  const rows = cli_history[1];
  expect(rows.length).toBe(1);
  expect(rows[0][3]).toBe("offline msg 1");

  await cliGen.return();
});
