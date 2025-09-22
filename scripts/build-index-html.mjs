import nunjucks from "nunjucks";
import { readdir, writeFile } from "fs/promises";

nunjucks.configure({ autoescape: true });

const files = await readdir("dist");

const renderedIndexPage = nunjucks.render("src/index.njk", {
  files: files.map((file) => {
    return {
      name: file,
      href: process.env.CI
        ? `https://phelipetls.github.io/resumes/${file}`
        : `http://localhost:3000/${file}`,
    };
  }),
});

await writeFile("dist/index.html", renderedIndexPage);