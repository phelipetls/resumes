const nunjucks = require("nunjucks");
const jsonResume = require("./resume-ptbr.json");
const fs = require("fs");

nunjucks
  .configure({
    autoescape: false,
    tags: {
      blockStart: "<%",
      blockEnd: "%>",
      variableStart: "<$",
      variableEnd: "$>",
      commentStart: "<#",
      commentEnd: "#>",
    },
  })
  .addFilter("birthday", birthday)
  .addFilter("periodDate", periodDate)
  .addFilter("escapeQuotes", escapeQuotes)
  .addFilter("escapeUnderline", escapeUnderline);

const renderedResume = nunjucks.render("resume-ptbr.njk", jsonResume);
fs.writeFileSync("resume-ptbr.tex", renderedResume);

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

function periodDate(value) {
  if (!value) {
    throw new Error("Unexpected empty date");
  }

  const [year, month, day] = value.split("-");
  const date = new Date(year, month - 1, day);
  const s = date.toLocaleDateString("pt-BR", {
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
    return `\\enquote{${p1}}`
  });
}
