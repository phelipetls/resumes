export function escapeUnderline(text) {
  return text.replace(/_/g, "\\_");
}

export function escapeQuotes(text) {
  return text.replace(/"([^"]+)"/g, (_, p1) => {
    return `\\enquote{${p1}}`;
  });
}

export function escapeApostrophe(text) {
  return text.replace(/'/g, `\\textquotesingle `);
}
