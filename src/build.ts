#!/usr/bin/env node

import path from "path";
import { parse, render, type ParseParams } from ".";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

function coercePath(value: string) {
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value);
}

const { argv } = yargs(hideBin(process.argv))
  .command("$0", "Generates an HTML document from a README.md file")
  .option("readmePath", {
    describe: "README path",
    default: path.join(process.cwd(), "README.md"),
  })
  .option("outputPath", {
    describe: "output path",
    default: path.join(process.cwd(), "out"),
  })
  .coerce("outputPath", coercePath)
  .option("templatesPaths", {
    describe: "custom templates path",
    default: path.join(process.cwd(), "templates"),
  })
  .coerce("templatesPaths", coercePath)
  .option("assetsPath", {
    describe: "assets path",
    default: path.join(process.cwd(), "assets"),
  })
  .coerce("assetsPath", coercePath);

const data = await parse(argv as ParseParams);
await render({ ...data, ...argv });
