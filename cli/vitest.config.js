import { defineConfig } from "vitest/config";
import { join } from "path";
import ROOT from "./const/ROOT.js";

export default defineConfig({
  resolve: {
    alias: {
      "@": join(ROOT, "lib"),
      "~": join(ROOT, "srv"),
    },
  },
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // globalSetup: ["./tests/globalTeardown.js"],
  },
});
