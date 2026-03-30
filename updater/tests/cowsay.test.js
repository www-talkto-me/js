#! /usr/bin/env bun
import { test, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync } from "fs";
import updater from "../update.js";

const config_path = join(tmpdir(), "cowsay-test-updater.yml"),
  [, orig_argv1] = process.argv;

beforeAll(() => {
  console.log("\n--- 测试准备: 安装旧版本 cowsay@1.4.0 ---");
  execSync("bun add -g cowsay@1.4.0", { stdio: "inherit" });
  process.argv[1] = execSync("which cowsay", { encoding: "utf8" }).trim();
});

afterAll(() => {
  console.log("\n--- 测试清理: 卸载 cowsay ---");
  execSync("bun remove -g cowsay", { stdio: "pipe" }).toString();
  try {
    unlinkSync(config_path);
  } catch {}
  process.argv[1] = orig_argv1;
});

test("自动更新器能够执行 cowsay 全局更新", async () => {
  console.log("\n--- 开始测试: 触发 updater ---");
  const auto_install = await updater("cowsay", "1.4.0", config_path);

  expect(typeof auto_install).toBe("function");

  console.log("\n--- 开始进行后台安装 ---");
  const child = auto_install();
  expect(child).toBeDefined();

  await new Promise((resolve, reject) => {
    child.on("close", (code) => {
      console.log(`\n后台更新进程已结束。退出码: ${code}`);
      code === 0 ? resolve() : reject(new Error(`更新失败，退出码: ${code}`));
    });
  });

  console.log("\n--- 测试更新结果: 运行新的 cowsay ---");
  const out = execSync('bunx --bun cowsay "Update Successful!"', { encoding: "utf8" });
  console.log(out);

  expect(out).toContain("Update Successful!");
}, 30000);
