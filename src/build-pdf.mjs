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

  const texFile = nunjucks.render(join(__dirname, "templates", "resume.tex.njk"), {
    ...jsonResume,
    translations: translations[language]
  })

   const tempDir = await mkdtemp(join(tmpdir(), 'latex-'))
   const texFilePath = join(tempDir, "resume.tex")
   await writeFile(texFilePath, texFile)
   console.log(`Running pdflatex for ${language}`)
   await exec(`pdflatex -output-directory="${tempDir}" "${texFilePath}"`)
   console.log(`pdflatex completed for ${language}`)

   return readFile(join(tempDir, "resume.pdf"))
}
