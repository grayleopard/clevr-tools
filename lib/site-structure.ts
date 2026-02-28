import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

export interface SiteCategory {
  id: string;
  label: string;
  route: string;
  description: string;
  featuredSlugs: string[];
  subcategories: {
    label: string;
    slugs: string[];
  }[];
}

export const siteCategories: SiteCategory[] = [
  {
    id: "files",
    label: "Files",
    route: "/files",
    description: "Compress, convert, and transform files directly in your browser.",
    featuredSlugs: [
      "image-compressor",
      "resize-image",
      "pdf-to-jpg",
      "merge-pdf",
      "word-to-pdf",
      "pdf-compressor",
    ],
    subcategories: [
      {
        label: "Compress",
        slugs: ["image-compressor", "pdf-compressor"],
      },
      {
        label: "Convert Images",
        slugs: [
          "heic-to-jpg",
          "jpg-to-png",
          "png-to-jpg",
          "png-to-webp",
          "webp-to-png",
          "resize-image",
        ],
      },
      {
        label: "PDF Tools",
        slugs: [
          "pdf-to-jpg",
          "jpg-to-pdf",
          "png-to-pdf",
          "merge-pdf",
          "split-pdf",
          "rotate-pdf",
          "word-to-pdf",
        ],
      },
      {
        label: "Create & Edit",
        slugs: ["resize-image", "image-cropper", "invoice-generator"],
      },
    ],
  },
  {
    id: "text-code",
    label: "Text & Code",
    route: "/text-code",
    description: "Write, format, analyze, and transform text and code.",
    featuredSlugs: [
      "word-counter",
      "json-formatter",
      "password-generator",
      "qr-code-generator",
      "base64",
      "color-picker",
    ],
    subcategories: [
      {
        label: "Text Tools",
        slugs: [
          "word-counter",
          "character-counter",
          "case-converter",
          "text-to-slug",
          "lorem-generator",
          "remove-line-breaks",
          "sort-lines",
          "find-and-replace",
        ],
      },
      {
        label: "Dev Tools",
        slugs: [
          "json-formatter",
          "base64",
          "url-encoder",
          "uuid-generator",
          "color-picker",
        ],
      },
      {
        label: "Generate",
        slugs: ["password-generator", "qr-code-generator", "random-number"],
      },
    ],
  },
  {
    id: "calculate",
    label: "Calculate",
    route: "/calculate",
    description: "Financial calculators, health tools, and everyday math.",
    featuredSlugs: [
      "mortgage-calculator",
      "bmi-calculator",
      "compound-interest",
      "tip-calculator",
      "age-calculator",
      "percentage-calculator",
    ],
    subcategories: [
      {
        label: "Finance",
        slugs: [
          "mortgage-calculator",
          "compound-interest",
          "tip-calculator",
          "discount-calculator",
          "percentage-calculator",
        ],
      },
      {
        label: "Health & Life",
        slugs: ["bmi-calculator", "age-calculator", "gpa-calculator"],
      },
      {
        label: "Math & Conversion",
        slugs: ["unit-converter", "date-difference"],
      },
    ],
  },
  {
    id: "time",
    label: "Time",
    route: "/time",
    description: "Timers, stopwatches, and productivity tools.",
    featuredSlugs: ["timer", "stopwatch", "pomodoro"],
    subcategories: [
      {
        label: "Timers",
        slugs: ["timer", "stopwatch", "pomodoro"],
      },
    ],
  },
  {
    id: "type",
    label: "Type",
    route: "/type",
    description: "Improve your typing speed and accuracy.",
    featuredSlugs: ["typing-test"],
    subcategories: [
      {
        label: "Typing",
        slugs: ["typing-test"],
      },
    ],
  },
];

/** Get all tools for a site category, resolved from slugs */
export function getCategoryTools(category: SiteCategory): Tool[] {
  const allSlugs = category.subcategories.flatMap((sc) => sc.slugs);
  const unique = [...new Set(allSlugs)];
  return unique
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t !== undefined && t.live !== false);
}

/** Get a site category by its id */
export function getSiteCategoryById(id: string): SiteCategory | undefined {
  return siteCategories.find((c) => c.id === id);
}

/** Total count of live tools in a site category */
export function getCategoryToolCount(category: SiteCategory): number {
  return getCategoryTools(category).length;
}
