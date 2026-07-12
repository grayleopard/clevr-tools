export interface TocHeading {
  id: string;
  text: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Extracts h2 headings from a seoContent HTML string, server-side, no DOM needed. */
export function extractHeadings(html: string): TocHeading[] {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)];
  const seen = new Set<string>();
  const headings: TocHeading[] = [];

  for (const match of matches) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    let id = slugify(text);
    let unique = id;
    let suffix = 2;
    while (seen.has(unique)) {
      unique = `${id}-${suffix}`;
      suffix++;
    }
    seen.add(unique);
    headings.push({ id: unique, text });
  }

  return headings;
}

/** Adds id="..." to each h2 tag in a seoContent HTML string, matching extractHeadings order. */
export function injectHeadingIds(html: string, headings: TocHeading[]): string {
  let index = 0;
  return html.replace(/<h2([^>]*)>/g, (match, attrs: string) => {
    const heading = headings[index];
    index++;
    if (!heading || /\bid=/.test(attrs)) return match;
    return `<h2${attrs} id="${heading.id}">`;
  });
}
