import Nunjucks from "nunjucks";
import { writeFile, mkdir } from "fs/promises";
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

await Promise.all(
  languages.map(lang => mkdir(join(OUT_DIR, lang.code), { recursive: true }))
);

const pdfPaths = {
  "en-US": join(OUT_DIR, 'Phelipe_Teles_Frontend_Developer.pdf'),
  "pt-BR": join(OUT_DIR, 'Phelipe_Teles_Desenvolvedor_Frontend.pdf'),
}

await Promise.all(
  languages.map(async (language) => {
    const pdf = await buildPdf(language.code);
    await writeFile(pdfPaths[language.code], pdf);
  })
);

const htmlPaths = {
  "en-US": join(OUT_DIR, 'Phelipe_Teles_Frontend_Developer.html'),
  "pt-BR": join(OUT_DIR, 'Phelipe_Teles_Desenvolvedor_Frontend.html'),
}

await Promise.all(
  languages.map(async (language) => {
    const html = await buildHtml(language.code);
    await writeFile(htmlPaths[language.code], html);
  })
);

const nunjucks = Nunjucks.configure({ autoescape: true });

const templatePath = join(__dirname, "templates", "site.html.njk")

const pathToRelativeUrl = (path) => relative(OUT_DIR, path)
const applyToObjectValues = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]))

console.log(`Will render ${templatePath}`)
const renderedSite = nunjucks.render(templatePath, {
  languages,
  defaultLanguage: "pt-BR",
  urls: {
    html: applyToObjectValues(htmlPaths, pathToRelativeUrl),
    pdf: applyToObjectValues(pdfPaths, pathToRelativeUrl)
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
