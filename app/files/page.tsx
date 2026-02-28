import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";
import type { Metadata } from "next";

const category = siteCategories.find((c) => c.id === "files")!;

export const metadata: Metadata = {
  title: "File Tools — Free Online Compress, Convert & PDF Tools | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://clevr.tools/files" },
  openGraph: {
    title: "File Tools — Free Online Compress, Convert & PDF Tools | clevr.tools",
    description: category.description,
    url: "https://clevr.tools/files",
    siteName: "clevr.tools",
  },
};

export default function FilesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>{category.label}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {category.label} Tools
            </h1>
            <p className="mt-2 text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Subcategories */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          {category.subcategories.map((sub) => {
            const subTools = sub.slugs
              .map((slug) => getToolBySlug(slug))
              .filter((t): t is Tool => t !== undefined && t.live !== false);
            if (subTools.length === 0) return null;

            return (
              <div key={sub.label} className="mb-10">
                <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                  {sub.label}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
