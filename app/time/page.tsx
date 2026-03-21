import type { Metadata } from "next";
import { Timer } from "lucide-react";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const category = siteCategories.find((c) => c.id === "time")!;

export const metadata: Metadata = {
  title: "Time Tools — Free Online Timers & Stopwatch | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://www.clevr.tools/time" },
  openGraph: {
    title: "Time Tools — Free Online Timers & Stopwatch | clevr.tools",
    description: category.description,
    url: "https://www.clevr.tools/time",
    siteName: "clevr.tools",
  },
};

export default function TimePage() {
  return (
    <CategoryPageScaffold
      categoryName={category.label}
      headerLabel="FOCUS TOOLS"
      titleLineOne="Timers, Stopwatches, and"
      titleLineTwo="Productivity"
      description="Stay focused and track time with lightweight browser-based tools."
      Icon={Timer}
      sections={category.subcategories.map((sub) => ({
        title: sub.label,
        columnsClassName: "sm:grid-cols-2 xl:grid-cols-2",
        tools: sub.slugs
          .map((slug) => getToolBySlug(slug))
          .filter((tool): tool is Tool => tool !== undefined && tool.live !== false),
      }))}
    />
  );
}
