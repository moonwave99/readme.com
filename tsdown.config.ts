import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    copy: ["src/templates", "src/assets"],
  },
  {
    entry: ["src/build.ts"],
  },
]);
