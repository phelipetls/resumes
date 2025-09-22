import Nunjucks from "nunjucks";
import jsonResumePtBr from "./resumes/pt-br.json" assert { type: "json" };
import jsonResumeEnUs from "./resumes/en-us.json" assert { type: "json" };
import { writeFile } from "fs/promises";
import { translations } from './builders/i18n/index.jss'
import child_process from 'node:child_process'
import { promisify } from "node:util";
import { mkdtemp, readFile } from "node:fs/promises";
import { fileURLToPath } from 'node:url';
import { join } from 'node:path'

const __dirname = fileURLToPath(import.meta.url)
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

  const tempDir = await mkdtemp()
  const texFilePath = join(tempDir, "resume.tex")
  await writeFile(texFilePath, texFile)
  await exec(`pdflatex -output-directory=${tempDir} "${texFilePath}"`)

  return readFile(join(tempDir, "resume.pdf"))
}
