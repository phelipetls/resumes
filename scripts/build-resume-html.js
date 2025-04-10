const nunjucks = require("nunjucks");
const jsonResumePtBr = require("../src/phelipe-teles-resume-pt-br.json");
const jsonResumeEnUs = require("../src/phelipe-teles-resume-en-us.json");
const fs = require("fs");

function setupNunjucks(language) {
  return nunjucks
    .configure({ autoescape: true })
    .addFilter("birthday", createBirthdayFormatter(language))
    .addFilter("formatPeriod", createPeriodFormatter(language));
}

const renderedResumePtBr = setupNunjucks("pt-BR").render("src/resume.html.njk", {
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

const renderedResumeEnUs = setupNunjucks("en-US").render("src/resume.html.njk", {
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
