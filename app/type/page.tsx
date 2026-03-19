import type { Metadata } from "next";
import { Keyboard } from "lucide-react";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const category = siteCategories.find((c) => c.id === "type")!;

export const metadata: Metadata = {
  title: "Typing Tools — Free Online Typing Test | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://www.clevr.tools/type" },
  openGraph: {
    title: "Typing Tools — Free Online Typing Test | clevr.tools",
    description: category.description,
    url: "https://www.clevr.tools/type",
    siteName: "clevr.tools",
  },
};

export default function TypePage() {
  return (
    <CategoryPageScaffold
      categoryName={category.label}
      headerLabel="SPEED + RHYTHM"
      titleLineOne="Test and Improve Your"
      titleLineTwo="Typing Speed"
      description="Typing tests, practice modes, and keyboard tools to sharpen your skills."
      Icon={Keyboard}
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
