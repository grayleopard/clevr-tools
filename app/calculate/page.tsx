import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const category = siteCategories.find((c) => c.id === "calculate")!;

export const metadata: Metadata = {
  title: "Calculators — Free Online Financial & Math Calculators | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://www.clevr.tools/calculate" },
  openGraph: {
    title: "Calculators — Free Online Financial & Math Calculators | clevr.tools",
    description: category.description,
    url: "https://www.clevr.tools/calculate",
    siteName: "clevr.tools",
  },
};

export default function CalculatePage() {
  return (
    <CategoryPageScaffold
      categoryName={category.label}
      headerLabel="MONEY + LIFE"
      titleLineOne="Financial, Health, and Everyday"
      titleLineTwo="Calculators"
      description="Financial calculators, health tools, and everyday math. Precise results, no signup."
      Icon={Calculator}
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
