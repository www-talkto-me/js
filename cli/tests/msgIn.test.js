#!/usr/bin/env bun test
import { test, expect, describe } from "vitest";

const makeFakeEntry = () => {
  const log = [];
  return {
    log,
    uid_b64: "fakeB64",
    notify: async (msg, id_key) => {
      log.push({ type: "notify", msg, id_key });
    },
    chat: async (msg, key) => {
      log.push({ type: "chat", msg, key });
    },
    abort: async () => {
      log.push({ type: "abort" });
    },
  };
};

describe("msgIn: 打断逻辑", () => {
  test("单消息正常发送", async () => {
    const visitors = new Map(),
      pending_id = new Map(),
      entry = makeFakeEntry();
    visitors.set("100", entry);

    const { default: msgIn } = await import("../msgIn.js");
    const handle = msgIn(visitors, pending_id, null, async () => {});

    await handle([1001, 100, null, "你好"]);

    expect(pending_id.get("100")).toBe(1001);
    expect(entry.log.some((e) => e.type === "chat" && e.msg === "你好")).toBe(true);
    expect(entry.log.some((e) => e.type === "abort")).toBe(false);
  });

  test("连发消息触发 abort 后立即重发", async () => {
    const visitors = new Map(),
      pending_id = new Map(),
      entry = makeFakeEntry();
    visitors.set("200", entry);

    const { default: msgIn } = await import("../msgIn.js");
    const handle = msgIn(visitors, pending_id, null, async () => {});

    await handle([2001, 200, null, "第一条长问题"]);
    expect(pending_id.get("200")).toBe(2001);

    await handle([2002, 200, null, "第二条短问题"]);

    expect(entry.log.filter((e) => e.type === "abort").length).toBe(1);
    expect(pending_id.get("200")).toBe(2002);

    const chats = entry.log.filter((e) => e.type === "chat");
    expect(chats.length).toBe(2);
    expect(chats[0].msg).toBe("第一条长问题");
    expect(chats[1].msg).toBe("第二条短问题");
  });

  test("连发三条消息触发两次 abort", async () => {
    const visitors = new Map(),
      pending_id = new Map(),
      entry = makeFakeEntry();
    visitors.set("300", entry);

    const { default: msgIn } = await import("../msgIn.js");
    const handle = msgIn(visitors, pending_id, null, async () => {});

    await handle([3001, 300, null, "问题A"]);
    await handle([3002, 300, null, "问题B"]);
    await handle([3003, 300, null, "问题C"]);

    expect(entry.log.filter((e) => e.type === "abort").length).toBe(2);
    expect(pending_id.get("300")).toBe(3003);

    const chats = entry.log.filter((e) => e.type === "chat");
    expect(chats.length).toBe(3);
    expect(chats[2].msg).toBe("问题C");
  });
});

describe("reply: 状态过滤", () => {
  test("aborted 状态被忽略", async () => {
    const visitors = new Map(),
      pending_id = new Map(),
      entry = makeFakeEntry();
    visitors.set("100", entry);
    pending_id.set("100", 5001);

    const { default: reply } = await import("../reply.js");
    const handle = reply("agent:main:test:", null, null, visitors, pending_id, null);

    await handle(
      JSON.stringify({
        payload: {
          state: "aborted",
          sessionKey: "agent:main:test:100",
          message: { role: "assistant", content: [{ type: "text", text: "aborted" }] },
        },
      }),
    );

    expect(pending_id.has("100")).toBe(true);
    expect(entry.log.length).toBe(0);
  });

  test("final 状态正常处理", async () => {
    const visitors = new Map(),
      pending_id = new Map(),
      entry = makeFakeEntry();
    visitors.set("100", entry);
    pending_id.set("100", 5001);

    const { default: reply } = await import("../reply.js");
    const handle = reply(
      "agent:main:test:",
      "fakeUid",
      "fakeToken",
      visitors,
      pending_id,
      "http://localhost:19999/",
    );

    try {
      await handle(
        JSON.stringify({
          payload: {
            state: "final",
            sessionKey: "agent:main:test:100",
            message: { role: "assistant", content: [{ type: "text", text: "回答" }] },
          },
        }),
      );
    } catch {}

    expect(entry.log.some((e) => e.type === "notify" && e.msg.includes("回答"))).toBe(true);
  });
});
