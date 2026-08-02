import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import OnThisPageNav from "@/components/tool/OnThisPageNav";
import { getPrivacyContext, getRelatedTools, toolCategories } from "@/lib/tools";
import { siteCategories } from "@/lib/site-structure";
import { extractHeadings, injectHeadingIds, type TocHeading } from "@/lib/seo/toc";
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
          className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-[1rem] bg-card/80 px-4 py-3 text-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="min-w-0 break-words">{relatedTool.name}</span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}

function getSidebarContent(
  tool: Tool,
  relatedTools: ReturnType<typeof getRelatedTools>,
  seoHeadings: TocHeading[]
) {
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

  if (
    tool.category === "calc" ||
    tool.category === "text" ||
    tool.category === "dev" ||
    tool.category === "generate"
  ) {
    return {
      settingsTitle: "On this page",
      settingsPanel: <OnThisPageNav seedHeadings={seoHeadings} />,
      infoTitle: tool.category === "calc" ? "Related calculators" : "Related tools",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  if (tool.category === "type") {
    if (tool.slug === "typing-test") {
      return {
        settingsTitle: "Shortcuts",
        settingsPanel: (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <kbd className="rounded-md border border-border bg-card/80 px-2 py-1 font-mono text-xs text-foreground">
              Tab
            </kbd>
            <span>+</span>
            <kbd className="rounded-md border border-border bg-card/80 px-2 py-1 font-mono text-xs text-foreground">
              Enter
            </kbd>
            <span>to restart</span>
          </div>
        ),
        infoTitle: "Related tools",
        infoPanel: <RelatedToolLinkList tools={relatedTools} />,
      };
    }
    return {
      infoTitle: "Related tools",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  if (tool.category === "time") {
    return {
      infoTitle: "Related tools",
      infoPanel: <RelatedToolLinkList tools={relatedTools} />,
    };
  }

  return {
    settingsTitle: acceptedFormats.length > 0 ? "Supported input" : undefined,
    settingsPanel: acceptedFormats.length > 0 ? (
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
    ) : undefined,
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
  const isContained = tool.contained === true;
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
    // www, matching the canonical tag every page already sets — this was
    // previously bare-host, inconsistent with the rest of the site's host
    // canonicalization.
    url: `https://www.clevr.tools${tool.route}`,
    creator: {
      "@type": "Organization",
      name: "clevr.tools",
      url: "https://www.clevr.tools",
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.clevr.tools" },
      {
        "@type": "ListItem",
        position: 2,
        name: siteCategory.label,
        item: `https://www.clevr.tools${siteCategory.route}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://www.clevr.tools${tool.route}`,
      },
    ],
  };
  const contentWidth = fullWidth || !embeddedShell ? "max-w-7xl" : "max-w-7xl";
  const seoHeadings = !isContained && tool.seoContent ? extractHeadings(tool.seoContent) : [];
  const seoContentWithIds = !isContained && tool.seoContent
    ? injectHeadingIds(tool.seoContent, seoHeadings)
    : "";
  // A contained route is a repair/status surface, not an operational tool.
  // Do not show processing guidance or privacy badges that could be mistaken
  // for a currently supported capability contract.
  const sidebarContent = isContained
    ? { settingsPanel: undefined, infoPanel: undefined, settingsTitle: undefined, infoTitle: undefined }
    : getSidebarContent(tool, relatedTools, seoHeadings);
  const privacyContext = isContained ? undefined : getPrivacyContext(tool);

  return (
    <>
      {!isContained ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div>
            <div className={`mx-auto ${contentWidth} px-4 pb-12 sm:px-6 sm:pb-16`}>
              <nav
                aria-label="Breadcrumb"
                className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-[color:var(--ghost-border)] py-6 text-xs font-medium text-muted-foreground"
              >
                <Link
                  href="/"
                  className="rounded-sm py-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Home
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  href={siteCategory.route}
                  className="rounded-sm py-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {siteCategory.label}
                </Link>
                <span aria-hidden="true">/</span>
                <span className="min-w-0 break-words text-foreground" aria-current="page">
                  {tool.name}
                </span>
              </nav>

              <header className="relative mb-10 flex flex-col justify-between gap-7 border-b-2 border-foreground py-8 sm:flex-row sm:items-end sm:py-10">
                <div className="max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-[14px] w-[14px]" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {badgeLabel}
                  </span>
                </div>

                <h1 className="break-words font-display text-[clamp(3rem,7vw,6.25rem)] font-black uppercase leading-[0.84] tracking-[-0.075em]">
                  {tool.name}
                </h1>
                <p className="mt-5 max-w-2xl break-words text-base leading-7 text-muted-foreground">
                  {tool.shortDescription}
                </p>
                </div>
                {!isContained ? (
                  <span className="w-fit shrink-0 border border-primary px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    Ready to use
                  </span>
                ) : null}
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
                  privacyContext={privacyContext}
                >
                  {children}
                </ToolPageLayout>
              )}
            </div>
          </div>

          {seoContentWithIds ? (
            <div className="border-t border-border bg-background/70">
              <div className={`mx-auto ${contentWidth} px-4 py-10 sm:px-6`}>
                <div
                  data-toc-scope
                  className="prose prose-zinc prose-sm max-w-none overflow-x-auto overscroll-x-contain prose-headings:max-w-3xl prose-headings:break-words prose-p:max-w-3xl prose-p:break-words prose-ul:max-w-3xl prose-ol:max-w-3xl prose-blockquote:max-w-3xl prose-pre:max-w-3xl prose-a:break-words prose-table:min-w-[36rem] prose-table:max-w-5xl dark:prose-invert [&_h2]:scroll-mt-24"
                  dangerouslySetInnerHTML={{ __html: seoContentWithIds }}
                />
              </div>
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
