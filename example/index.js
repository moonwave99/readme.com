import path from "path";
import { parse, render } from "../src/index.js";

const readmePath = path.join(process.cwd(), "README.md");
const distPath = path.join(process.cwd(), ".");

const data = await parse(readmePath);
await render({ ...data, distPath });
