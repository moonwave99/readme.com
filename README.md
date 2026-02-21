# Readme.com

[![Build Status](https://github.com/moonwave99/readme.com/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/moonwave99/readme.com/actions?workflow=Test)

From `README.md`  
to `index.html` in one touch

---

## Usage

Inside a folder with a `README.md` file:

```txt
npx readme.com
```

You'll get:

```txt
dist
  index.html
  styles.css
```

The `styles.css` file provides minimal page styling. You can override it by providing your styles, see below for how to use the `assetsPath` option.

### Automatic content arrangement

The markdown contents are split at the `---` delimiters and organized in `<section>`, e.g. the following:

```md
# My Document

Some text

---

## About

Some more text

---

## Contact

Some further text
```

Will output:

```html
<nav>
  <a href="#top">Home</a>
  <a href="#some-content">About</a>
  <a href="#some-more-content">Contact</a>>
</nav>
<main>
  <section class="top">
    <h1 id="my-document">My Document</h1>
    <p>Some text</p>
  </section>
  <section class="about">
    <h2 id="about">About</h2>
    <p>Some more text</p>
  </section>
  <section class="contact">
    <h2 id="contact">Contact</h2>
    <p>Some further text</p>
  </section>
</main>
```

The `<nav>` is populated accordingly to the content.

### Local development

You can add the following scripts to your `package.json` in order to test the output locally and eventually building it:

```js
{
  "scripts": {
    "dev:site": "npx concurrently 'npx serve site' 'npx nodemon --watch readme.md --exec npm run build:site'",
    "build:site": "rm -rf site && npx readme.com"
  }
}
```

- run `npm run dev:site` to see a preview at http://localhost:3000;
- run `npm run dev:build` to generate the website inside the `outputPath` folder (defaults to `'./dist`).

If you want to deploy your website to [Github Pages](https://docs.github.com/en/pages), configure your repo accordingly and set up an action [like the one used by this library](./.github/workflows/github-pages.yml).

### Include assets

Any files contained in the `assets` folder will be copied over to the dist folder and then available at the same level of the `index.html` file, i.e.:

```txt
assets
  robots.txt
  styles.css
  image.jpg
README.md
```

Yields:

```txt
dist
  index.html
  styles.css  // overwritten
  robots.txt
  image.jpg
```

The assets folder is configurable via the `assetsPath` option:

```txt
npx readme.com --assetsPath ./my-assets-path
```

### Template override

The library uses the following [templates](./src/templates):

```txt
meta.ejs
navbar.ejs
section.ejs
footer.ejs
scripts.ejs
styles.ejs
```

You can override any of them by providing a same named file in a folder called `templates`:

```txt
templates
  footer.ejs
README.md
```

And your custom footer will be used **instead** of the existing one.

The custom templates folder is configurable via the `templatesPaths` option:

```txt
npx readme.com --templatesPaths ./my-templates-path
```

---

## Documentation

### Command Line

```txt
npx readme.com

Generates an HTML document from a README.md file

Options:
  --help            Show help                                            [boolean]
  --version         Show version number                                  [boolean]
  --readmePath      README path               [default: "{process.cwd}/README.md"]
  --outputPath      dist path                 [default: "{process.cwd}"]
  --templatesPaths  custom templates path
  --assetsPath      assets path               [default: "{process.cwd}/assets"]
```

### Programmatic usage

```js
import { parse, render } from "readme.com";

const { sections, meta } = await parse({
  readmePath: "...", // path to your readme file, defaults to ./README.md
});

await render({
  sections,
  meta,
  // additional options here
});
```

### Render function options

| Name             | Default value                                | Description                                                           |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| `cwd`            | `process.cwd`                                | Used to retrieve the `package.json` file                              |
| `outputPath`     | `./dist`                                     | The output folder                                                     |
| `assetsPath`     | `./assets`                                   | Additional assets folder                                              |
| `templatesPaths` | `null`                                       | Custom templates folder                                               |
| `ejsOptions`     | `{ openDelimiter: "{", closeDelimiter: "}"}` | EJS configuration (in case you provide different formatted templates) |

---

## Examples

- this page!
- [homepage example](./examples/personal-website/)
- [test-fs](https://moonwave99.github.io/test-fs/)
