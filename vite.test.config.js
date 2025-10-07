import { defineConfig } from "vitest/config";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  test: {
    globals: true,
    setupFiles: "./test/vitest.setup.js",
    include: ["test/**/*.test.js"],
  },
});
