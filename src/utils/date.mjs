export function createBirthdayFormatter(language) {
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

export function createPeriodFormatter(language) {
  return (start, end) => {
    if (!start && !end) {
      throw new Error("Unexpected missing start and end dates");
    }

    const present = language === "pt-BR" ? "Presente" : "Present";
    return `${formatDatePeriod(start, language)} — ${end ? formatDatePeriod(end, language) : present}`;
  };
}

export function formatDatePeriod(value, language) {
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
