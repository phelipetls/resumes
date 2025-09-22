const nunjucks = require("nunjucks");
const fs = require("fs");

nunjucks.configure({ autoescape: true });

const files = fs.readdirSync("dist");

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

fs.writeFileSync("dist/index.html", renderedIndexPage);
