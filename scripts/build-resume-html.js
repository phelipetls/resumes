const nunjucks = require("nunjucks");
const jsonResumePtBr = require("../src/phelipe-teles-resume-pt-br.json");
const jsonResumeEnUs = require("../src/phelipe-teles-resume-en-us.json");
const fs = require("fs");

nunjucks
  .configure({ autoescape: true })
  .addFilter("birthday", birthday)
  .addFilter("formatPeriod", formatPeriod);

const renderedResumePtBr = nunjucks.render("src/resume.html.njk", {
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
fs.writeFileSync("src/phelipe-teles-resume-pt-br.html", renderedResumePtBr);

const renderedResumeEnUs = nunjucks.render("src/resume.html.njk", {
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
fs.writeFileSync("src/phelipe-teles-resume-en-us.html", renderedResumeEnUs);

function birthday(value) {
  if (!value) {
    throw new Error("Unexpected empty date");
  }

  const [year, month, day] = value.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPeriod(start, end) {
  if (!start && !end) {
    throw new Error("Unexpected missing start and end dates");
  }

  return `${formatDatePeriod(start)} -- ${end ? formatDatePeriod(end) : "Presente"}`;
}

function formatDatePeriod(value) {
  if (!value) {
    throw new Error("Unexpected missing date");
  }

  const [year, month, day] = value.split("-");
  const date = new Date(year, month - 1, day);
  const s = date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  return s[0].toUpperCase() + s.slice(1);
}
