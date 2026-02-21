import path from "node:path";
import fs from "fs-extra";
import { globby } from "globby";
import matter from "gray-matter";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import ejs, { type Options, TemplateFunction } from "ejs";
import * as cheerio from "cheerio";

marked.use(gfmHeadingId());

async function parseTemplates(
  templatesPath: string,
  options: Options,
): Promise<Record<string, TemplateFunction>> {
  if (!templatesPath) {
    return {} as Record<string, TemplateFunction>;
  }

  const templateFiles = await globby("*.ejs", { cwd: templatesPath });

  return (
    await Promise.all(
      templateFiles.map(async (fileName) => ({
        id: path.basename(fileName, ".ejs"),
        template: ejs.compile(
          await fs.readFile(path.join(templatesPath, fileName), "utf8"),
          options,
        ) as TemplateFunction,
      })),
    )
  ).reduce((memo, { id, template }) => ({ ...memo, [id]: template }), {});
}

function parseMarkdown(content: string) {
  const split = marked(content).split("<hr>");

  return [
    {
      id: "top",
      title: "Home",
      content: split[0],
    },
    ...split.slice(1).map((content) => {
      const $ = cheerio.load(content);
      const title = $("h2");
      return {
        content,
        id: title.attr("id") as string,
        title: title.text(),
      };
    }),
  ];
}

export type ParseParams = {
  readmePath: string;
};

export async function parse(
  { readmePath }: ParseParams = { readmePath: "./README.md" },
) {
  const readme = await fs.readFile(readmePath, "utf8");
  const { content, data: meta } = matter(readme);
  return {
    sections: parseMarkdown(content),
    meta,
  };
}

export type Section = {
  id: string;
  content: string;
};

export type RenderParams = {
  sections: Section[];
  meta: Record<string, unknown>;
  cwd?: string;
  outputPath?: string;
  assetsPath?: string;
  templatesPaths?: string;
  ejsOptions?: Options;
};

export async function render({
  sections,
  meta,
  cwd = process.cwd(),
  outputPath = "./out",
  assetsPath = "./assets",
  templatesPaths,
  ejsOptions = {
    openDelimiter: "{",
    closeDelimiter: "}",
  },
}: RenderParams) {
  const templates = {
    ...(await parseTemplates(
      path.join(import.meta.dirname, "templates"),
      ejsOptions,
    )),
    ...(templatesPaths ? await parseTemplates(templatesPaths, ejsOptions) : {}),
  };

  let info = {
    name: "My Project",
    description: "An awesome idea",
    homepage: "https://www.acme.com/my-project",
    author: {
      name: "ACME",
      email: "hello@acme.com",
      url: "https://www.acme.com",
    },
  };

  let config = {
    syntaxHighlight: true,
  };

  try {
    const pkg = await fs.readJSON(path.join(cwd, "package.json"));
    info = { ...info, ...pkg };
    config = { ...config, ...(pkg["readme.com"] || {}) };
  } catch {
    console.log("package.json file not found");
  }

  const data = {
    title: info.name,
    description: info.description,
    copyright: `${new Date().getFullYear()} ${
      info.author?.name || info.author
    }`,
    homepage: info.homepage,
    config,
    ...meta,
  };

  const output = templates.main({
    ...data,
    meta: templates.meta(data),
    body: sections.map(templates.section).join("\n"),
    navbar: templates.navbar({ sections }),
    footer: templates.footer(data),
    scripts: templates.scripts(data),
    styles: templates.styles(data),
  });

  const outputFileName = path.join(outputPath, "index.html");
  await fs.outputFile(outputFileName, output);

  const defaultAssetsPath = path.resolve(
    new URL(".", import.meta.url).pathname,
    "..",
    "assets",
  );

  await fs.copy(defaultAssetsPath, outputPath);

  if (fs.existsSync(assetsPath)) {
    await fs.copy(assetsPath, outputPath);
  }
}
