import nunjucks from "nunjucks";
import jsonResumePtBr from "../src/phelipe-teles-resume-pt-br.json" assert { type: "json" };
import jsonResumeEnUs from "../src/phelipe-teles-resume-en-us.json" assert { type: "json" };
import { writeFile } from "fs/promises";

const setupNunjucks = (language) =>
  nunjucks
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

const renderedResumePtBr = setupNunjucks("pt-BR").render("src/resume.tex.njk", {
  ...jsonResumePtBr,
  translations: {
    sections: {
      work: "EXPERIÊNCIA",
      projects: "PROJETOS",
      education: "FORMAÇÃO",
      languages: "IDIOMAS",
    },
  },
});
await writeFile("src/phelipe-teles-resume-pt-br.tex", renderedResumePtBr);

const renderedResumeEnUs = setupNunjucks("en-US").render("src/resume.tex.njk", {
  ...jsonResumeEnUs,
  translations: {
    sections: {
      work: "EXPERIENCE",
      projects: "PROJECTS",
      education: "EDUCATION",
      languages: "LANGUAGES",
    },
  },
});
await writeFile("src/phelipe-teles-resume-en-us.tex", renderedResumeEnUs);

function createBirthdayFormatter(language) {
  return (value) => {
    if (!value) {
      throw new Error("Unexpected empty date");
    }

    const [year, month, day] = value.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
}

function createPeriodFormatter(language) {
  return (start, end) => {
    if (!start && !end) {
      throw new Error("Unexpected missing start and end dates");
    }

    const present = language === "pt-BR" ? "Presente" : "Present";
    return `${formatDatePeriod(start, language)} -- ${end ? formatDatePeriod(end, language) : present}`;
  };
}

function formatDatePeriod(value, language) {
  if (!value) {
    throw new Error("Unexpected missing date");
  }

  const [year, month, day] = value.split("-");
  const date = new Date(year, month - 1, day);
  const s = date.toLocaleDateString(language, {
    month: "short",
    year: "numeric",
  });

  return s[0].toUpperCase() + s.slice(1);
}

function escapeUnderline(text) {
  return text.replace(/_/g, "\\_");
}

function escapeQuotes(text) {
  return text.replace(/"([^"]+)"/g, (_, p1) => {
    return `\\enquote{${p1}}`;
  });
}

function escapeApostrophe(text) {
  return text.replace(/'/g, `\\textquotesingle `);
}