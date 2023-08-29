import path from "path";
import matter from "gray-matter";
import fs from "fs-extra";
import { globby } from "globby";
import { marked } from "marked";
import ejs from "ejs";
import prettify from "html-prettify";

const templateFiles = await globby("*.ejs", {
    cwd: new URL(`./templates`, import.meta.url),
});

const templates = (
    await Promise.all(
        templateFiles.map(async (fileName) => ({
            id: path.basename(fileName, ".ejs"),
            template: ejs.compile(
                await fs.readFile(
                    new URL(`./templates/${fileName}`, import.meta.url),
                    "utf8"
                ),
                {
                    openDelimiter: "{",
                    closeDelimiter: "}",
                }
            ),
        }))
    )
).reduce((memo, { id, template }) => ({ ...memo, [id]: template }), {});

function parseMarkdown(content) {
    const parsed = marked(content);
    const split = parsed.split(/(<!--[\s\S]*?-->)/g);
    const output = [
        {
            id: "hero",
            content: split[0],
        },
    ];
    for (let i = 1; i < split.length; i += 2) {
        output.push({
            id: split[i].match(/(<!--([\s\S]*?)-->)/)[2].trim(),
            content: split[i + 1],
        });
    }
    return output;
}

export async function parse(readmePath = "./README.md") {
    const readme = await fs.readFile(readmePath, "utf8");
    const { content, data: meta } = matter(readme);
    return {
        sections: parseMarkdown(content),
        meta,
    };
}

export async function render({ sections, meta, distPath = "./dist" }) {
    const outputPath = path.join(distPath, "index.html");
    const output = templates.main({
        title: meta.title,
        body: sections.map(templates.section).join("\n"),
        footer: templates.footer(),
    });
    await fs.writeFile(outputPath, prettify(output));
}
