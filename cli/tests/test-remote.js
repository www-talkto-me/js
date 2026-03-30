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
  console.log("尝试给这个 session 发起全面消息流订阅...");
  try {
    const subRes = await rpc("sessions.messages.subscribe", { key: "agent:main:talkto.me:0" });
    console.log("详细消息流订阅结果:", subRes);
  } catch (err) {
    console.warn("sessions.messages.subscribe 不存在:", err);
  }

  const ws = wsFn();
  ws.on('message', async (msg) => {
    const raw = msg.toString();
    console.log("WS事件:", raw);
    try {
      const data = JSON.parse(raw);
      if (data.type === "event" && data.event === "chat" && data.payload?.state === "final") {
        console.log("检测到 final，正在拉取最新消息...");
        const getRes = await rpc("sessions.get", { key: data.payload.sessionKey });
        if (getRes.ok) {
          const msgs = getRes.payload?.messages ?? [];
          const lastMsg = msgs[msgs.length - 1];
          console.log("最后一条消息是:", JSON.stringify(lastMsg, null, 2));
          process.exit(0);
        }
      }
    } catch {}
  });

  console.log("发出 chat.send 然后等待...");
  const sendRes = await rpc("chat.send", {
    sessionKey: "agent:main:talkto.me:0",
    message: "/talkto_me 第二次测试",
    idempotencyKey: Date.now().toString()
  });
  console.log("发送结果:", sendRes);

  await new Promise(r => setTimeout(r, 10000));
  process.exit(0);
  setTimeout(() => {
    console.log("测试结束");
    process.exit(0);
  }, 5000);
};

test().catch(err => {
  console.error("测试发生错误:", err);
  process.exit(1);
});
