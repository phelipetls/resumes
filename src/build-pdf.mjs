import Nunjucks from "nunjucks";
import jsonResumePtBr from "./resumes/pt-br.json" with { type: "json" };
import jsonResumeEnUs from "./resumes/en-us.json" with { type: "json" };
import { writeFile } from "fs/promises";
import { translations } from './i18n/index.mjs'
import child_process from 'node:child_process'
import { promisify } from "node:util";
import { mkdtemp, readFile } from "node:fs/promises";
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path'
import { createBirthdayFormatter, createPeriodFormatter } from './utils/date.mjs'
import { escapeQuotes, escapeUnderline, escapeApostrophe } from './utils/latex.mjs'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const exec = promisify(child_process.exec)

export const build = async (language) => {
  const nunjucks = Nunjucks
    .configure({
      autoescape: false,
      tags: {
        blockStart: "<%%",
        blockEnd: "%%>",
        variableStart: "<$%%",
        variableEnd: "%%$>>",
        commentStart: "<#%%",
        commentEnd: "%%#>",
      },
    })
    .addFilter("birthday", createBirthdayFormatter(language))
    .addFilter("formatPeriod", createPeriodFormatter(language))
    .addFilter("escapeQuotes", escapeQuotes)
    .addFilter("escapeUnderline", escapeUnderline)
    .addFilter("escapeApostrophe", escapeApostrophe);

  const jsonResume = language === "pt-BR" ? jsonResumePtBr : jsonResumeEnUs

  const templatePath = join(__dirname, "templates", "resume.tex.njk")

  console.log(`Will render ${templatePath} template into .tex file`)
  const texFile = nunjucks.render(templatePath, {
    ...jsonResume,
    translations: translations[language]
  })
  console.log('Rendered .tex template')

  const tempDir = await mkdtemp(join(tmpdir(), 'latex-'))
  const texFilePath = join(tempDir, "resume.tex")
  await writeFile(texFilePath, texFile)
  console.log(`Saved ${texFilePath} template into disk`)

  const pdfPath = join(tempDir, "resume.pdf")
  console.log(`Will build ${pdfPath} from .tex with pdflatex`)
  await exec(`pdflatex -output-directory=${tempDir} ${texFilePath}`)
  console.log(`Built ${pdfPath} from .tex with pdflatex`)

  return readFile(pdfPath)
}
