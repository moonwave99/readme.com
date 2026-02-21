import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    copy: ["src/templates"],
  },
  {
    entry: ["src/build.ts"],
  },
]);
