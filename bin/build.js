#!/usr/bin/env node

import path from "path";
import { parse, render } from "../src/index.js";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

function coercePath(value) {
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value);
}

const { argv } = yargs(hideBin(process.argv))
  .command("$0", "Generates an HTML document from a README.md file")
  .option("readmePath", {
    describe: "README path",
    default: path.join(process.cwd(), "README.md"),
  })
  .option("distPath", {
    describe: "dist path",
    default: path.join(process.cwd(), "dist"),
  })
  .coerce("distPath", coercePath)
  .option("templatePath", {
    describe: "custom templates path",
    default: path.join(process.cwd(), "templates"),
  })
  .coerce("templatePath", coercePath)
  .option("assetsPath", {
    describe: "assets path",
    default: path.join(process.cwd(), "assets"),
  })
  .coerce("assetsPath", coercePath);

const data = await parse(argv);
await render({ ...data, ...argv });
