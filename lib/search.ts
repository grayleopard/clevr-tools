import { searchIndex, type SearchTool } from "@/lib/search-index";

export interface SearchResult {
  tool: SearchTool;
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

function scoreTool(tool: SearchTool, query: string): number {
  const name = normalize(tool.name);
  const description = normalize(tool.shortDescription);
  const aliases = tool.aliases.map(normalize);
  const words = query.split(/\s+/).filter(Boolean);

  if (name === query) return 100;
  if (name.startsWith(query)) return 90;
  if (aliases.some((alias) => alias === query)) return 88;
  if (aliases.some((alias) => alias.startsWith(query))) return 80;
  if (name.includes(query)) return 70;
  if (aliases.some((alias) => alias.includes(query))) return 65;

  // All query words appear somewhere in name, aliases, or description.
  const corpus = `${name} ${aliases.join(" ")} ${description}`;
  if (words.length > 1 && words.every((word) => corpus.includes(word))) return 50;

  if (description.includes(query)) return 35;

  // Fuzzy fallback: characters of the query appear in order in the name.
  if (query.length >= 3 && isSubsequence(query, name)) return 15;

  return 0;
}

export function searchTools(query: string, limit = 8): SearchTool[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const results: SearchResult[] = searchIndex
    .map((tool) => ({ tool, score: scoreTool(tool, normalizedQuery) }))
    .filter((result) => result.score > 0);

  results.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  return results.slice(0, limit).map((result) => result.tool);
}
