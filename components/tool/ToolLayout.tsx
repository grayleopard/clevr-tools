import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import AdSlot from "@/components/tool/AdSlot";
import { getRelatedTools, toolCategories } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
  structuredData?: Record<string, unknown>;
  fullWidth?: boolean;
}

const primarySectionLabels: Record<Tool["category"], string> = {
  compress: "Files & Assets",
  convert: "Files & Assets",
  generate: "Text & Code",
  ai: "Files & Assets",
  tools: "Files & Assets",
  text: "Text & Code",
  dev: "Text & Code",
  calc: "Calculate",
  time: "Time",
  type: "Type",
  files: "Files & Assets",
};

export default function ToolLayout({
  tool,
  children,
  structuredData,
  fullWidth = false,
}: ToolLayoutProps) {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.metaDescription,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://clevr.tools${tool.route}`,
    creator: {
      "@type": "Organization",
      name: "clevr.tools",
      url: "https://clevr.tools",
    },
  };

  const jsonLd = structuredData ?? defaultStructuredData;
  const relatedTools = getRelatedTools(tool);
  const categoryLabel =
    toolCategories.find((c) => c.id === tool.category)?.label ?? tool.category;
  const contentWidth = fullWidth ? "max-w-7xl" : "max-w-4xl";
  const badgeLabel = primarySectionLabels[tool.category] ?? categoryLabel;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          {/* Tool header */}
          <div className="bg-muted/25">
            <div className={`mx-auto ${contentWidth} px-4 py-10 sm:px-6 sm:py-14`}>
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  {badgeLabel}
                </span>
                <h1 className="mt-5 text-4xl font-black tracking-[-0.03em] sm:text-[2.75rem]">
                  {tool.name}
                </h1>
                <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                  {tool.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Tool area */}
          <div className={`mx-auto ${contentWidth} px-4 py-8 sm:px-6 sm:py-10`}>
            {children}
            <AdSlot className="mt-8 h-[90px]" />
          </div>

          {/* SEO content */}
          {tool.seoContent && (
            <div className="border-t border-border bg-muted/10">
              <div
                className={`mx-auto ${contentWidth} px-4 py-10 sm:px-6 prose prose-zinc dark:prose-invert prose-sm max-w-none`}
                dangerouslySetInnerHTML={{ __html: tool.seoContent }}
              />
            </div>
          )}

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <div className="border-t border-border">
              <div className={`mx-auto ${contentWidth} px-4 py-10 sm:px-6`}>
                <h2 className="mb-4 text-lg font-semibold tracking-tight">Related Tools</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedTools.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
