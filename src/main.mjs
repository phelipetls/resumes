import Nunjucks from "nunjucks";
import { writeFile, mkdir } from "fs/promises";
import { build as buildPdf } from './build-pdf.mjs'
import { build as buildHtml } from './build-html.mjs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from "node:url";
import { env } from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OUT_DIR = env.OUT_DIR

await mkdir(OUT_DIR)

await Promise.all([
  buildPdf("pt-BR").then(content => writeFile(join(OUT_DIR, 'pt-BR', 'resume.pdf'), content)),
  buildPdf("en-US").then(content => writeFile(join(OUT_DIR, 'en-US', 'resume.pdf'), content)),
])

const [htmlResume_ptBR, htmlResume_enUS] = await Promise.all([buildHtml("pt-BR"), buildHtml("en-US")])

const nunjucks = Nunjucks.configure({ autoescape: true });

const templatePath = join(__dirname, "templates", "site.html.njk")

console.log(`Will render ${templatePath} into HTML`)
const renderedSite = nunjucks.render(templatePath , {
  resumes: {
    ptBr: htmlResume_ptBR,
    enUs: htmlResume_enUS,
  },
  files: files.map((file) => {
    return {
      name: file,
      href: env.CI
        ? `https://phelipetls.github.io/resumes/${file}`
        : `http://localhost:3000/${file}`,
    };
  }),
});
console.log(`Rendered ${templatePath} into HTML`)

await writeFile(join(OUT_DIR, "index.html"), renderedSite);
