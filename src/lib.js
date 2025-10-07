import path from "path";
import fs from "fs-extra";
import { globby } from "globby";
import matter from "gray-matter";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import ejs from "ejs";
import * as cheerio from "cheerio";

marked.use(gfmHeadingId());

async function parseTemplates(templatesPath, options) {
  if (!templatesPath) {
    return {};
  }

  const templateFiles = await globby("*.ejs", { cwd: templatesPath });

  return (
    await Promise.all(
      templateFiles.map(async (fileName) => ({
        id: path.basename(fileName, ".ejs"),
        template: ejs.compile(
          await fs.readFile(path.join(templatesPath, fileName), "utf8"),
          options
        ),
      }))
    )
  ).reduce((memo, { id, template }) => ({ ...memo, [id]: template }), {});
}

function parseMarkdown(content) {
  const split = marked(content).split("<hr>");

  return [
    {
      id: "top",
      title: "Home",
      content: split[0],
    },
    ...split.slice(1).map((html) => {
      const $ = cheerio.load(html);
      const title = $("h2");
      return {
        content: html,
        id: title.attr("id"),
        title: title.text(),
      };
    }),
  ];
}

export async function parse({ readmePath = "./README.md" }) {
  const readme = await fs.readFile(readmePath, "utf8");
  const { content, data: meta } = matter(readme);
  return {
    sections: parseMarkdown(content),
    meta,
  };
}

export async function render({
  sections,
  meta,
  distPath = "./dist",
  assetsPath = "./assets",
  templatePath,
  ejsOptions = {
    openDelimiter: "{",
    closeDelimiter: "}",
  },
}) {
  const templates = {
    ...(await parseTemplates(
      new URL(`./templates`, import.meta.url).pathname,
      ejsOptions
    )),
    ...(await parseTemplates(templatePath, ejsOptions)),
  };

  const data = {
    title: "",
    description: "",
    copyright: "ACME",
    links: {},
    ...meta,
  };

  const output = templates.main({
    ...data,
    meta: templates.meta(data),
    body: sections.map(templates.section).join("\n"),
    navbar: templates.navbar({ sections }),
    footer: templates.footer(data),
  });

  const outputPath = path.join(distPath, "index.html");
  await fs.outputFile(outputPath, output);
  await fs.copy(assetsPath, distPath);
}
