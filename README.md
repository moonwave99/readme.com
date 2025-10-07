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

### Local development

You can add the following scripts to your `package.json` in order to test the output locally and eventually building it:

```json
{
  "scripts": {
    "dev:site": "npx concurrently 'npx serve site' 'npx nodemon --watch readme.md --exec npm run build:site'",
    "build:site": "rm -rf site && npx readme.com"
  }
}
```

- run `npm run dev:site` to see a preview at http://localhost:3000;
- run `npm run dev:build` to generate the website inside the `distPath` folder (defaults to `'./dist`).

If you want to deploy your website to [Github Pages](https://docs.github.com/en/pages), configure your repo accordingly and set up an action [like the one used by this library](./.github/workflows/github-pages.yml).

### Include assets

Any files contained in the `assets` folder will be copied over to the dist folder and then available at the same level of the `index.html` file, i.e.:

```txt
assets
  robots.txt
  image.jpg
README.md
```

Yields:

```txt
dist
  index.html
  styles.css
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

The custom templates folder is configurable via the `templatePath` option:

```txt
npx readme.com --templatePath ./my-templates-path
```

---

## Documentation

### Command Line

```txt
npx readme.com

Generates an HTML document from a README.md file

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --readmePath    README path               [default: "{process.cwd}/README.md"]
  --distPath      dist path                           [default: "{process.cwd}"]
  --templatePath  custom templates path     [default: "{process.cwd}/templates"]
  --assetsPath    assets path
```

---

## Examples

- this page!
- [homepage example](https://moonwave99.github.io/readme.com.example/)
