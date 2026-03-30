#!/usr/bin/env bun
import initWs from "../conn/ws.js";

const test = async () => {
  // 设置远程的 IP 和端口（已通过 SSH 隧道映射到本地即可直接测试）
  process.env.OPENCLAW_GATEWAY_URL = 'ws://127.0.0.1:18889';
  process.env.OPENCLAW_GATEWAY_TOKEN = '02239aaa83eafdd9f81cf28ca612040082ebadbb63151f18';

  console.log(`尝试连接: ${process.env.OPENCLAW_GATEWAY_URL}`);

  const [rpc, onReady, wsFn] = initWs();

  console.log("等待连接就绪...");
  await onReady();
  console.log("连接已就绪！");

  console.log("获取会话列表...");
  const res = await rpc("sessions.list");
  console.log("会话列表响应:", JSON.stringify(res, null, 2));

  if (res.payload?.sessions) {
    const brokenSession = res.payload.sessions.find(s => s.key === "agent:main:talkto.me:0");
    if (brokenSession) {
      console.log(`尝试获取可能损坏的 session 详情: ${brokenSession.key}`);
      const getRes = await rpc("sessions.get", { key: brokenSession.key });
      console.log("获取结果:", JSON.stringify(getRes, null, 2));
    }
  }

  process.exit(0);
  const ws = wsFn();
  ws.on('message', (msg) => {
    console.log("收到 OpenClaw 消息:", msg.toString());
  });

  setTimeout(() => {
    console.log("测试结束");
    process.exit(0);
  }, 5000);
};

test().catch(err => {
  console.error("测试发生错误:", err);
  process.exit(1);
});
