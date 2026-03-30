import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "../lib"),
      "~": resolve(import.meta.dirname, "../srv"),
    },
  },
  test: {
    globalSetup: [resolve(import.meta.dirname, "../srv/tests/globalTeardown.js")],
    pool: "forks",
  },
});
