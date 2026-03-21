import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { getRelatedTools, toolCategories } from "@/lib/tools";
import { siteCategories } from "@/lib/site-structure";
import type { Tool } from "@/lib/tools";

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
  structuredData?: Record<string, unknown>;
  fullWidth?: boolean;
  embeddedShell?: boolean;
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

const siteCategoryIdByToolCategory: Record<Tool["category"], string> = {
  compress: "files",
  convert: "files",
  generate: "text-code",
  ai: "files",
  tools: "files",
  text: "text-code",
  dev: "text-code",
  calc: "calculate",
  time: "time",
  type: "type",
  files: "files",
};

function formatAcceptedFormat(value: string): string {
  return value.replace(/^\./, "").toUpperCase();
}

function RelatedToolLinkList({
  tools,
}: {
  tools: ReturnType<typeof getRelatedTools>;
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {tools.slice(0, 4).map((relatedTool) => (
        <Link
          key={relatedTool.slug}
          href={relatedTool.route}
          className="flex items-center justify-between rounded-[1rem] bg-card/80 px-4 py-3 text-sm text-foreground transition-colors hover:text-primary"
        >
          <span>{relatedTool.name}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}

function getSidebarContent(tool: Tool, relatedTools: ReturnType<typeof getRelatedTools>) {
  const acceptedFormats = tool.acceptedFormats.map(formatAcceptedFormat);

  if (tool.slug === "background-remover") {
    return {
      settingsTitle: "Processing info",
      settingsPanel: (
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Background removal may call a server-side model. The tool UI will tell you when a
            request leaves the browser.
          </p>
          <div className="rounded-[1rem] bg-card/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Rate limits
            </p>
            <p className="mt-3">
              Keep requests lightweight and process one image at a time for the most reliable
              results.
            </p>
          </div>
        </div>
      ),
      infoTitle: "Related tools",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  if (tool.category === "calc") {
    return {
      settingsTitle: "Formula reference",
      settingsPanel: (
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>{tool.shortDescription}</p>
          <div className="rounded-[1rem] bg-card/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Reference
            </p>
            <p className="mt-3">
              Adjust the inputs and see the result update in real time.
            </p>
          </div>
        </div>
      ),
      infoTitle: "Related calculators",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  if (tool.category === "time") {
    return {
      settingsTitle: "Session settings",
      settingsPanel: (
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>{tool.shortDescription}</p>
        </div>
      ),
      infoTitle: "Related tools",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  if (tool.category === "type") {
    return {
      settingsTitle: "Session controls",
      settingsPanel: (
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>{tool.shortDescription}</p>
        </div>
      ),
      infoTitle: "Related tools",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  if (tool.category === "text" || tool.category === "dev" || tool.category === "generate") {
    return {
      settingsTitle: "Related tools",
      settingsPanel: <RelatedToolLinkList tools={relatedTools} />,
      infoTitle: "Tool notes",
      infoPanel: (
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>{tool.shortDescription}</p>
        </div>
      ),
    };
  }

  return {
    settingsTitle: acceptedFormats.length > 0 ? "Supported input" : "Workspace notes",
    settingsPanel: (
      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        {acceptedFormats.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {acceptedFormats.map((format) => (
              <span
                key={format}
                className="rounded-full bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                {format}
              </span>
            ))}
          </div>
        ) : null}
        <p>{tool.shortDescription}</p>
      </div>
    ),
    infoTitle: "Related tools",
    infoPanel: <RelatedToolLinkList tools={relatedTools} />,
  };
}

export default function ToolLayout({
  tool,
  children,
  structuredData,
  fullWidth = false,
  embeddedShell = false,
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
    toolCategories.find((category) => category.id === tool.category)?.label ?? tool.category;
  const badgeLabel = primarySectionLabels[tool.category] ?? categoryLabel;
  const siteCategory =
    siteCategories.find((category) => category.id === siteCategoryIdByToolCategory[tool.category]) ??
    siteCategories[0];
  const contentWidth = fullWidth || !embeddedShell ? "max-w-7xl" : "max-w-7xl";
  const sidebarContent = getSidebarContent(tool, relatedTools);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="bg-muted/20">
            <div className={`mx-auto ${contentWidth} px-4 py-10 sm:px-6 sm:py-14`}>
              <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <Link href="/" className="transition-colors hover:text-primary">
                  Home
                </Link>
                <span>/</span>
                <Link href={siteCategory.route} className="transition-colors hover:text-primary">
                  {siteCategory.label}
                </Link>
                <span>/</span>
                <span>{tool.name}</span>
              </nav>

              <header className="mb-8 max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-primary">
                  <Zap className="h-[14px] w-[14px]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {badgeLabel}
                  </span>
                </div>

                <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
                  {tool.name}
                </h1>
                <p className="text-base text-muted-foreground">
                  {tool.shortDescription}
                </p>
              </header>

              {embeddedShell ? (
                children
              ) : (
                <ToolPageLayout
                  categoryName={siteCategory.label}
                  categoryHref={siteCategory.route}
                  relatedTools={relatedTools.slice(0, 5).map((relatedTool) => ({
                    name: relatedTool.name,
                    href: relatedTool.route,
                  }))}
                  settingsPanel={sidebarContent.settingsPanel}
                  infoPanel={sidebarContent.infoPanel}
                  settingsTitle={sidebarContent.settingsTitle}
                  infoTitle={sidebarContent.infoTitle}
                >
                  {children}
                </ToolPageLayout>
              )}
            </div>
          </div>

          {tool.seoContent ? (
            <div className="border-t border-border bg-muted/10">
              <div
                className={`mx-auto ${contentWidth} max-w-none px-4 py-10 prose prose-zinc prose-sm dark:prose-invert sm:px-6`}
                dangerouslySetInnerHTML={{ __html: tool.seoContent }}
              />
            </div>
          ) : null}

          {relatedTools.length > 0 ? (
            <div className="border-t border-border">
              <div className={`mx-auto ${contentWidth} px-4 py-10 sm:px-6`}>
                <h2 className="mb-4 text-lg font-semibold tracking-tight">Related Tools</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedTools.map((relatedTool) => (
                    <ToolCard key={relatedTool.slug} tool={relatedTool} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </main>
        <Footer />
      </div>
    </>
  );
}
