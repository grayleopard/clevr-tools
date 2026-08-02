const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "en",
  "for",
  "if",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "per",
  "so",
  "the",
  "to",
  "up",
  "via",
  "vs",
  "yet",
]);

const KNOWN_ACRONYMS = new Set([
  "AI",
  "API",
  "CPU",
  "CSS",
  "CPS",
  "EU",
  "FAQ",
  "GIF",
  "GPU",
  "HTML",
  "HTTP",
  "HTTPS",
  "JPEG",
  "JPG",
  "JSON",
  "NASA",
  "PDF",
  "PNG",
  "SEO",
  "SQL",
  "SVG",
  "UK",
  "UI",
  "URI",
  "URL",
  "USA",
  "UX",
  "WPM",
  "XML",
]);

const WORD_PATTERN =
  /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*(?:[-‐‑][\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*)*/gu;

function casedLetters(value: string): string[] {
  return [...value].filter(
    (character) => character.toLowerCase() !== character.toUpperCase()
  );
}

function isAllCapsLine(value: string): boolean {
  const letters = casedLetters(value);
  return (
    letters.length > 0 &&
    letters.every((character) => character === character.toUpperCase())
  );
}

function isAcronym(value: string, allCapsLine: boolean): boolean {
  const upper = value.toUpperCase();
  if (KNOWN_ACRONYMS.has(upper)) return true;

  const letters = casedLetters(value);
  return (
    !allCapsLine &&
    !/['’]/u.test(value) &&
    letters.length >= 2 &&
    letters.every((character) => character === character.toUpperCase())
  );
}

function capitalizeWord(value: string): string {
  const lower = value.toLowerCase();
  let capitalized = lower.replace(/\p{L}/u, (letter) => letter.toUpperCase());

  // Preserve common one-letter surname/language prefixes without turning
  // ordinary contractions such as "don't" into "Don'T".
  const apostropheIndex = capitalized.search(/['’]/u);
  if (apostropheIndex === 1) {
    const prefix = capitalized.slice(0, apostropheIndex + 1);
    const suffix = capitalized
      .slice(apostropheIndex + 1)
      .replace(/\p{L}/u, (letter) => letter.toUpperCase());
    capitalized = prefix + suffix;
  }

  return capitalized;
}

function formatCompound(
  value: string,
  forceBoundaryCapital: boolean,
  allCapsLine: boolean
): string {
  const pieces = value.split(/([-‐‑])/u);
  const wordPieces = pieces.filter((piece) => !/^[-‐‑]$/u.test(piece));
  let wordPieceIndex = 0;

  return pieces
    .map((piece) => {
      if (/^[-‐‑]$/u.test(piece)) return piece;

      const lower = piece.toLowerCase();
      const isBoundaryPiece =
        forceBoundaryCapital &&
        (wordPieces.length === 1 || wordPieceIndex === 0);
      wordPieceIndex += 1;

      if (isAcronym(piece, allCapsLine)) return piece.toUpperCase();
      if (SMALL_WORDS.has(lower) && !isBoundaryPiece) return lower;
      return capitalizeWord(piece);
    })
    .join("");
}

function titleCaseLine(line: string): string {
  const matches = [...line.matchAll(WORD_PATTERN)];
  if (matches.length === 0) return line;

  const allCapsLine = isAllCapsLine(line);
  let output = "";
  let cursor = 0;
  let capitalizeNext = true;

  matches.forEach((match, index) => {
    const matchIndex = match.index ?? cursor;
    const separator = line.slice(cursor, matchIndex);
    output += separator;
    if (/[:.!?]\s*["'’”’)}\]]*$/u.test(separator)) {
      capitalizeNext = true;
    }

    const forceBoundaryCapital =
      index === 0 || index === matches.length - 1 || capitalizeNext;
    output += formatCompound(match[0], forceBoundaryCapital, allCapsLine);
    cursor = matchIndex + match[0].length;
    capitalizeNext = false;
  });

  return output + line.slice(cursor);
}

/**
 * English editorial title case. Whitespace and punctuation are preserved,
 * common small words stay lowercase internally, subtitle/line boundaries are
 * capitalized, and recognized or clearly intentional acronyms remain uppercase.
 */
export function toEditorialTitleCase(value: string): string {
  return value
    .split(/(\r?\n)/u)
    .map((part) => (/^\r?\n$/u.test(part) ? part : titleCaseLine(part)))
    .join("");
}
