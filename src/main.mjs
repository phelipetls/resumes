import Nunjucks from "nunjucks";
import { readdir, writeFile, mkdir } from "fs/promises";
import { build as buildPdf } from './build-pdf.mjs'
import { build as buildHtml } from './build-html.mjs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from "node:url";
import { env } from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const fileName_enUS = 'Phelipe_Teles_Frontend_Developer'
const fileName_ptBR = 'Phelipe_Teles_Desenvolvedor_Frontend'

const OUT_DIR = env.OUT_DIR

await mkdir(OUT_DIR)

await Promise.all([
  buildPdf("pt-BR").then(content => writeFile(join(OUT_DIR, fileName_ptBR + '.pdf'), content)),
  buildPdf("en-US").then(content => writeFile(join(OUT_DIR, fileName_enUS + '.pdf'), content)),
  buildHtml("pt-BR").then(content => writeFile(join(OUT_DIR, fileName_ptBR + '.html'), content)),
  buildHtml("en-US").then(content => writeFile(join(OUT_DIR, fileName_enUS + '.html'), content)),
])

const nunjucks = Nunjucks.configure({ autoescape: true });

const files = await readdir(OUT_DIR);

const templatePath = join(__dirname, "templates", "site.html.njk")

console.log(`Will render ${templatePath} into HTML`)
const renderedSite = nunjucks.render(templatePath , {
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
