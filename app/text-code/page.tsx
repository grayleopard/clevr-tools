import type { Metadata } from "next";
import { Code2 } from "lucide-react";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const category = siteCategories.find((c) => c.id === "text-code")!;

export const metadata: Metadata = {
  title: "Text & Code Tools — Free Online Text & Dev Tools | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://www.clevr.tools/text-code" },
  openGraph: {
    title: "Text & Code Tools — Free Online Text & Dev Tools | clevr.tools",
    description: category.description,
    url: "https://www.clevr.tools/text-code",
    siteName: "clevr.tools",
  },
};

export default function TextCodePage() {
  return (
    <CategoryPageScaffold
      categoryName={category.label}
      headerLabel="WRITE + TRANSFORM"
      titleLineOne="Write, Format, and Analyze"
      titleLineTwo="Text & Code"
      description="Transform text, debug code, and analyze content — all in your browser."
      Icon={Code2}
      sections={category.subcategories.map((sub) => ({
        title: sub.label,
        columnsClassName: "sm:grid-cols-2 xl:grid-cols-3",
        tools: sub.slugs
          .map((slug) => getToolBySlug(slug))
          .filter((tool): tool is Tool => tool !== undefined && tool.live !== false),
      }))}
    />
  );
}
