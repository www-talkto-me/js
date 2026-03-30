import initWs from "../conn/ws.js";

export default async () => {
  console.log("准备连接 OpenClaw 网关清理关联会话...");
  const [rpc, onReady] = initWs();

  await onReady();
  console.log("已连接到 OpenClaw 网关，正在检索会话列表...");

  const res = await rpc("sessions.list");

  if (!res.ok) {
    console.error("无法获取会话列表:", res);
    process.exit(1);
  }

  const sessions = res.payload?.sessions || [],
    targets = sessions.filter((s) => s.key.startsWith("agent:main:talkto.me:"));

  if (targets.length === 0) {
    console.log("没有任何 talkto.me 关联的历史会话需要清理。");
    process.exit(0);
  }

  console.log(`找到 ${targets.length} 个历史会话，正在清理...`);

  let count = 0;
  for (const session of targets) {
    const del_res = await rpc("sessions.delete", { key: session.key });
    if (del_res.ok) {
      console.log(`- 已清理会话: ${session.key}`);
      count++;
    } else {
      console.error(`- 清理会话失败: ${session.key}`, del_res.error);
    }
  }

  console.log(`清理完成！共生效 ${count}/${targets.length} 个会话。`);
  process.exit(0);
};
