const nunjucks = require("nunjucks");
const jsonResume = require("../src/phelipe-teles-resume-ptbr.json");
const fs = require("fs");

nunjucks
  .configure({ autoescape: true })
  .addFilter("birthday", birthday)
  .addFilter("formatPeriod", formatPeriod)

const renderedResume = nunjucks.render("src/phelipe-teles-resume-ptbr.html.njk", jsonResume);
fs.writeFileSync("src/phelipe-teles-resume-ptbr.html", renderedResume);

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

  return `${formatDatePeriod(start)} -- ${end ? formatDatePeriod(end) : 'Presente'}`
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
