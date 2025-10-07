#!/usr/bin/env node

import path from "path";
import { parse, render } from "../src/index.js";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const { argv } = yargs(hideBin(process.argv))
  .command("$0", "generates the html")
  .option("readmePath", {
    describe: "README path",
    default: path.join(process.cwd(), "README.md"),
  })
  .option("distPath", {
    describe: "dist path",
    default: path.join(process.cwd(), "dist"),
  })
  .option("templatePath", {
    describe: "custom templates path",
    default: path.join(process.cwd(), "templates"),
  })
  .coerce("templatePath", (value) =>
    path.isAbsolute(value) ? value : path.join(process.cwd(), value)
  )
  .option("assetsPath", {
    describe: "assets path",
    default: path.join(process.cwd(), "assets"),
  })
  .coerce("assetsPath", (value) =>
    path.isAbsolute(value) ? value : path.join(process.cwd(), value)
  );

const data = await parse(argv);
await render({ ...data, ...argv });
