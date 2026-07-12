import { tools, type Tool } from "@/lib/tools";

/**
 * Common alternate phrasings that share no words with the tool's own name,
 * so a plain substring/fuzzy match on name + description wouldn't catch
 * them (e.g. "shrink image" vs. "Image Compressor"). Not exhaustive —
 * covers the highest-value synonyms; most tool names already match their
 * own obvious search terms without help.
 */
const ALIASES: Record<string, string[]> = {
  "image-compressor": ["shrink image", "reduce image size", "make image smaller", "compress photo"],
  "resize-image": ["scale image", "change image dimensions", "change image size"],
  "gif-compressor": ["shrink gif", "reduce gif size", "make gif smaller"],
  "pdf-compressor": ["shrink pdf", "reduce pdf size", "make pdf smaller"],
  "merge-pdf": ["combine pdf", "join pdf", "pdf merger"],
  "split-pdf": ["separate pdf", "extract pdf pages", "divide pdf"],
  "rotate-pdf": ["turn pdf", "flip pdf pages"],
  "heic-to-jpg": ["iphone photos", "convert heic"],
  "image-cropper": ["crop photo", "trim image", "cut image"],
  "background-remover": ["remove background", "transparent background", "cutout image", "remove bg"],
  "invoice-generator": ["make an invoice", "billing template"],
  "word-counter": ["count words", "character count"],
  "character-counter": ["count characters", "letter count"],
  "case-converter": ["uppercase lowercase", "change text case", "capitalize text"],
  "text-to-slug": ["url slug", "slugify"],
  "lorem-generator": ["placeholder text", "dummy text", "filler text"],
  "remove-line-breaks": ["strip newlines", "remove new lines"],
  "sort-lines": ["alphabetize lines", "sort text alphabetically"],
  "find-and-replace": ["text replace", "search and replace"],
  "json-formatter": ["pretty print json", "validate json", "minify json"],
  "base64": ["encode base64", "decode base64"],
  "url-encoder": ["encode url", "percent encoding", "uri encode"],
  "uuid-generator": ["generate guid", "random id"],
  "color-picker": ["hex to rgb", "color converter", "rgb to hex"],
  "password-generator": ["random password", "strong password"],
  "qr-code-generator": ["make qr code", "generate qr"],
  "random-number": ["dice roll", "random number picker"],
  "salary": ["hourly to salary", "wage calculator"],
  "take-home-pay": ["net pay calculator"],
  "loan": ["loan payment calculator"],
  "auto-loan": ["car loan calculator"],
  "mortgage-calculator": ["home loan calculator"],
  "credit-card-payoff": ["pay off credit card debt"],
  "debt-to-income": ["dti calculator"],
  "retirement": ["401k calculator"],
  "investment-return": ["roi calculator"],
  "compound-interest": ["interest calculator"],
  "calorie": ["tdee calculator", "maintenance calories"],
  "macro": ["macro calculator", "protein carbs fat"],
  "bmi-calculator": ["body mass index"],
  "due-date": ["pregnancy due date"],
  "sleep": ["bedtime calculator", "sleep cycle calculator"],
  "pace": ["running pace calculator"],
  "age-calculator": ["how old am i"],
  "gpa-calculator": ["grade point average"],
  "unit-converter": ["convert units"],
  "date-difference": ["days between dates"],
  "sales-tax": ["tax calculator"],
  "odds-calculator": ["betting odds"],
  "poker": ["poker odds", "hand rankings"],
  "convert-temperature": ["celsius to fahrenheit"],
  "typing-test": ["wpm test", "typing speed test"],
  "wpm-test": ["words per minute test"],
  "keyboard-tester": ["test keys", "key tester"],
  "cps-test": ["clicks per second"],
  "reaction-time": ["reflex test"],
  "timer": ["countdown timer"],
  "stopwatch": ["time tracker"],
  "pomodoro": ["focus timer"],
};

export interface SearchResult {
  tool: Tool;
  score: number;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/** True if every character of `needle` appears in `haystack`, in order. */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

function scoreTool(tool: Tool, query: string): number {
  const name = normalize(tool.name);
  const description = normalize(tool.shortDescription);
  const aliases = (ALIASES[tool.slug] ?? []).map(normalize);
  const words = query.split(/\s+/).filter(Boolean);

  if (name === query) return 100;
  if (name.startsWith(query)) return 90;
  if (aliases.some((a) => a === query)) return 88;
  if (aliases.some((a) => a.startsWith(query))) return 80;
  if (name.includes(query)) return 70;
  if (aliases.some((a) => a.includes(query))) return 65;

  // All query words appear somewhere in name/aliases/description.
  const corpus = `${name} ${aliases.join(" ")} ${description}`;
  if (words.length > 1 && words.every((w) => corpus.includes(w))) return 50;

  if (description.includes(query)) return 35;

  // Fuzzy fallback: characters of the query appear in order in the name.
  if (query.length >= 3 && isSubsequence(query, name)) return 15;

  return 0;
}

export function searchTools(query: string, limit = 8): Tool[] {
  const q = normalize(query);
  if (!q) return [];

  const results: SearchResult[] = tools
    .filter((tool) => tool.live !== false)
    .map((tool) => ({ tool, score: scoreTool(tool, q) }))
    .filter((result) => result.score > 0);

  results.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  return results.slice(0, limit).map((result) => result.tool);
}
