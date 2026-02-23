import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import AdSlot from "@/components/tool/AdSlot";
import { getRelatedTools } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
  structuredData?: Record<string, unknown>;
}

export default function ToolLayout({ tool, children, structuredData }: ToolLayoutProps) {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.metaDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://clevr.tools${tool.route}`,
  };

  const jsonLd = structuredData ?? defaultStructuredData;
  const relatedTools = getRelatedTools(tool);

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
          <div className="border-b border-border bg-muted/20">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="capitalize">{tool.category}</span>
                <span>/</span>
                <span>{tool.name}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tool.name}</h1>
              <p className="mt-2 text-muted-foreground">{tool.shortDescription}</p>
            </div>
          </div>

          {/* Tool area */}
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            {children}
            <AdSlot className="mt-8 h-[90px]" />
          </div>

          {/* SEO content */}
          {tool.seoContent && (
            <div className="border-t border-border bg-muted/10">
              <div
                className="mx-auto max-w-4xl px-4 py-10 sm:px-6 prose prose-zinc dark:prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: tool.seoContent }}
              />
            </div>
          )}

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <div className="border-t border-border">
              <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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
