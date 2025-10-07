import path from "node:path";
import fs from "fs-extra";
import { testFs } from "@moonwave99/test-fs";
import * as cheerio from "cheerio";
import { parse, render } from "../src";

const readme = `
# Hello

Some text main

---

## Section 1

Some text 1

---

## Section 2

Some text 2
`;

const readmeWithFrontMatter = `---
links:
  - http://example.com/one
  - http://example.com/two
---
# Hello

Some text main

---

## Section 1

Some text 1

---

## Section 2

Some text 2
`;

describe("parse function", () => {
  it("parses the readme file correctly", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
      },
      context.task.id
    );

    const output = await parse({
      readmePath: path.join(directory, "README.md"),
    });

    expect(output).toMatchObject({
      meta: {},
      sections: [
        {
          id: "top",
          title: "Home",
        },
        {
          id: "section-1",
          title: "Section 1",
        },
        {
          id: "section-2",
          title: "Section 2",
        },
      ],
    });

    output.sections.forEach(({ id, title, content }, index) => {
      const $ = cheerio.load(content);
      if (id === "top") {
        expect($("h1").text()).toMatch("Hello");
        expect($("p").text()).toMatch("Some text main");
        return;
      }
      expect($("h2").text()).toMatch(title);
      expect($("p").text()).toMatch(`Some text ${index}`);
    });
  });

  it("parses the readme file with front matter correctly", async (context) => {
    const directory = await testFs(
      {
        "README.md": readmeWithFrontMatter,
      },
      context.task.id
    );

    const output = await parse({
      readmePath: path.join(directory, "README.md"),
    });

    expect(output).toMatchObject({
      meta: { links: ["http://example.com/one", "http://example.com/two"] },
      sections: [
        {
          id: "top",
          title: "Home",
        },
        {
          id: "section-1",
          title: "Section 1",
        },
        {
          id: "section-2",
          title: "Section 2",
        },
      ],
    });

    output.sections.forEach(({ id, title, content }, index) => {
      const $ = cheerio.load(content);
      if (id === "top") {
        expect($("h1").text()).toMatch("Hello");
        expect($("p").text()).toMatch("Some text main");
        return;
      }
      expect($("h2").text()).toMatch(title);
      expect($("p").text()).toMatch(`Some text ${index}`);
    });
  });
});

describe("render function", () => {
  it("renders the HTML document", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
        "package.json": {},
      },
      context.task.id
    );

    const parsed = await parse();
    await render({
      ...parsed,
      cwd: directory,
      distPath: path.join(directory, "dist"),
    });

    await Promise.all(
      ["index.html", "styles.css"].map(async (fileName) =>
        expect(await fs.exists(path.join(directory, "dist", fileName))).toBe(
          true
        )
      )
    );

    const output = await fs.readFile(
      path.join(directory, "dist", "index.html"),
      "utf8"
    );

    const $ = cheerio.load(output);

    expect($("title").text()).toBe("My Project");
    expect($('meta[name="description"]').attr("content")).toBe(
      "An awesome idea"
    );

    parsed.sections.forEach((section, index) => {
      expect($("nav a").eq(index).text()).toBe(section.title);
      expect($("nav a").eq(index).attr("href")).toBe(`#${section.id}`);
    });

    expect($("link").length).toBe(2);
    expect($("script").length).toBe(1);

    expect($("footer a").attr("href")).toBe("https://www.acme.com/my-project");
    expect($("footer a").text()).toBe("Homepage");
  });

  it("parses info from package.json correctly", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
        "package.json": JSON.stringify({
          name: "Custom name",
          description: "Custom description",
          homepage: "https://github.com/acme/some-page",
        }),
      },
      context.task.id
    );

    const parsed = await parse();
    await render({
      ...parsed,
      cwd: directory,
      distPath: path.join(directory, "dist"),
    });

    const output = await fs.readFile(
      path.join(directory, "dist", "index.html"),
      "utf8"
    );

    const $ = cheerio.load(output);

    expect($("title").text()).toBe("Custom name");
    expect($('meta[name="description"]').attr("content")).toBe(
      "Custom description"
    );

    expect($("footer a").attr("href")).toBe(
      "https://github.com/acme/some-page"
    );
    expect($("footer a").text()).toBe("Github");
  });

  it("does not include prism.js if no syntax highlight is required", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
        "package.json": JSON.stringify({
          "readme.com": {
            syntaxHighlight: false,
          },
        }),
      },
      context.task.id
    );

    const parsed = await parse();
    await render({
      ...parsed,
      cwd: directory,
      distPath: path.join(directory, "dist"),
    });

    const output = await fs.readFile(
      path.join(directory, "dist", "index.html"),
      "utf8"
    );

    const $ = cheerio.load(output);

    expect($("link").length).toBe(1);
    expect($("script").length).toBe(0);
  });

  it("uses custom templates", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
        templates: {
          "footer.ejs": "<footer>Custom footer</footer>",
        },
      },
      context.task.id
    );

    const parsed = await parse();
    await render({
      ...parsed,
      cwd: directory,
      distPath: path.join(directory, "dist"),
      templatePath: path.join(directory, "templates"),
    });

    const output = await fs.readFile(
      path.join(directory, "dist", "index.html"),
      "utf8"
    );

    const $ = cheerio.load(output);

    expect($("footer").text()).toBe("Custom footer");
  });

  it("generates the document in the custom distPath", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
      },
      context.task.id
    );

    const parsed = await parse();
    await render({
      ...parsed,
      distPath: path.join(directory, "customDist"),
    });

    await Promise.all(
      ["index.html", "styles.css"].map(async (fileName) =>
        expect(
          await fs.exists(path.join(directory, "customDist", fileName))
        ).toBe(true)
      )
    );
  });

  it("includes assets from assetsPath", async (context) => {
    const directory = await testFs(
      {
        "README.md": readme,
        customAssets: {
          "robots.txt": "",
        },
      },
      context.task.id
    );

    const parsed = await parse();
    await render({
      ...parsed,
      assetsPath: path.join(directory, "customAssets"),
    });

    expect(
      await fs.exists(path.join(directory, "customAssets", "robots.txt"))
    ).toBe(true);
  });
});
