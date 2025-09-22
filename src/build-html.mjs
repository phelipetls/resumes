import Nunjucks from "nunjucks";
import jsonResumePtBr from "./resumes/pt-br.json" with { type: "json" };
import jsonResumeEnUs from "./resumes/en-us.json" with { type: "json" };
import { translations } from './i18n/index.mjs'
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const build = async (language) => {
  const jsonResume = language === "pt-BR" ? jsonResumePtBr : jsonResumeEnUs

  const nunjucks = Nunjucks(language).render(join(__dirname, "templates", "resume.html.njk"), {
    ...jsonResume,
    translations: translations[language]
  })

  const result = nunjucks
    .configure({ autoescape: true })
    .addFilter("birthday", createBirthdayFormatter(language))
    .addFilter("formatPeriod", createPeriodFormatter(language));

  await readFile(result)
}
