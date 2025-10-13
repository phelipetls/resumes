import Nunjucks from "nunjucks";
import jsonResumePtBr from "./resumes/pt-br.json" with { type: "json" };
import jsonResumeEnUs from "./resumes/en-us.json" with { type: "json" };
import { translations } from "./i18n/index.mjs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import {
  createBirthdayFormatter,
  createPeriodFormatter,
} from "./utils/date.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const build = async (language) => {
  const jsonResume = language === "pt-BR" ? jsonResumePtBr : jsonResumeEnUs;

  const nunjucks = Nunjucks.configure({ autoescape: true })
    .addFilter("birthday", createBirthdayFormatter(language))
    .addFilter("formatPeriod", createPeriodFormatter(language));

  const templatePath = join(__dirname, "templates", "resume.html.njk");

  console.log(`Will render ${templatePath} template into HTML`);
  const result = nunjucks.render(templatePath, {
    ...jsonResume,
    translations: translations[language],
  });
  console.log("Rendered HTML successfully");

  return result;
};
