#! /usr/bin/env bun
import { test, expect } from "vitest";
import pkgVer from "../pkgVer.js";
import REGISTRIES from "../registry.js";

for (const registry of REGISTRIES) {
  test(`获取依赖包最新版本号测试: ${registry}`, async () => {
    const pkg = "@talkto-me/cli",
      [ver] = await pkgVer(pkg, [registry]);

    expect(typeof ver).toBe("string");
  });
}
