import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const category = siteCategories.find((c) => c.id === "files")!;

export const metadata: Metadata = {
  title: "File Tools — Free Online Compress, Convert & PDF Tools | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://www.clevr.tools/files" },
  openGraph: {
    title: "File Tools — Free Online Compress, Convert & PDF Tools | clevr.tools",
    description: category.description,
    url: "https://www.clevr.tools/files",
    siteName: "clevr.tools",
  },
};

export default function FilesPage() {
  return (
    <CategoryPageScaffold
      categoryName={category.label}
      headerLabel="Route 02 · File workshop"
      titleLineOne="Compress, Convert, and Transform"
      titleLineTwo="Files & Assets"
      description="Compress, combine, resize, and convert files without an account. Each tool states where processing happens and what it accepts before you begin."
      Icon={FolderOpen}
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
