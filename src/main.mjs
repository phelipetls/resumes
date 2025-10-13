import Nunjucks from "nunjucks";
import { writeFile, mkdir, readFile } from "fs/promises";
import { build as buildPdf } from './build-pdf.mjs'
import { build as buildHtml } from './build-html.mjs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from "node:url";
import { env } from 'node:process'
import { createServer } from "http";
import ServeHandler from 'serve-handler'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OUT_DIR = env.OUT_DIR

if (!OUT_DIR) {
  console.error("Unexpectedly missing OUT_DIR")
  process.exit(1)
}

await mkdir(OUT_DIR, { recursive: true })

const languages = [
  { code: "en-US", name: "English" },
  { code: "pt-BR", name: "Português" },
];

const resumeCssStyles = `<style>${await readFile(join(__dirname, "resume.css"))}</style>`

await Promise.all(
  languages.map(lang => mkdir(join(OUT_DIR, lang.code), { recursive: true }))
);

async function buildAndWritePdf(language, fileName) {
  const pdf = await buildPdf(language.code);
  const filePath = join(OUT_DIR, fileName)
  await writeFile(filePath, pdf);
  return relative(OUT_DIR, fileName)
}

const nunjucks = Nunjucks.configure({ autoescape: true });

const templatePath = join(__dirname, "templates", "site.html.njk")

console.log(`Will render ${templatePath}`)
const renderedSite = nunjucks.render(templatePath, {
  languages,
  defaultLanguage: "pt-BR",
  resumeCssStyles,
  pdfUrls: {
    "pt-BR": await buildAndWritePdf("pt-BR", 'Phelipe_Teles_Desenvolvedor_Frontend.html'),
    "en-US": await buildAndWritePdf("en-US", 'Phelipe_Teles_Frontend_Developer.html')
  },
  htmlContents: {
    "pt-BR": await buildHtml("pt-BR"),
    "en-US": await buildHtml("en-US"),
  }
});
console.log(`Rendered ${templatePath}`)

await writeFile(join(OUT_DIR, "index.html"), renderedSite);

const server = createServer((request, response) => {
  return ServeHandler(request, response);
});

if (env.NODE_ENV === 'production') {
  process.exit(0)
}

process.chdir(OUT_DIR)

const PORT = env.PORT ?? 3000

server.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
