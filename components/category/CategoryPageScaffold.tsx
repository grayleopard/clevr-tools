import Link from "next/link";
import type { ReactNode, ComponentType } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import { defaultToolIcon, toolIconMap } from "@/lib/tool-icons";
import type { Tool } from "@/lib/tools";

interface CategorySection {
  title: string;
  tools?: Tool[];
  columnsClassName?: string;
  content?: ReactNode;
}

interface CategoryPageScaffoldProps {
  categoryName: string;
  headerLabel: string;
  titleLineOne: string;
  titleLineTwo: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  sections: CategorySection[];
  featuredTools?: Tool[];
  featuredTitle?: string;
  showSectionNavigation?: boolean;
}

interface CategoryGuide {
  title: string;
  description: string;
  href: string;
}

const CATEGORY_GUIDES: Record<string, CategoryGuide[]> = {
  Files: [
    {
      title: "Compress images and check the result",
      description: "Choose settings for JPG, PNG, and WebP files, then compare the result.",
      href: "/blog/compress-images",
    },
    {
      title: "Reduce an image file size step by step",
      description: "Resize first, choose the right format, and compress for the final use.",
      href: "/blog/reduce-image-file-size",
    },
    {
      title: "Choose between PNG, JPG, and WebP",
      description: "Match the format to photos, screenshots, transparency, and compatibility.",
      href: "/blog/png-vs-jpg-vs-webp",
    },
    {
      title: "Turn PDF pages into JPG images",
      description: "Pick pages and output quality for presentations, email, or the web.",
      href: "/blog/convert-pdf-to-jpg",
    },
  ],
  "Text & Code": [
    {
      title: "Clean line breaks from copied text",
      description: "Fix text pasted from PDFs, email, or fixed-width documents.",
      href: "/blog/remove-line-breaks",
    },
  ],
  Type: [
    {
      title: "Take a useful typing-speed test",
      description: "Measure WPM and accuracy, then choose a focused practice mode.",
      href: "/blog/typing-test",
    },
  ],
};

function getSectionId(title: string): string {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export default function CategoryPageScaffold({
  categoryName,
  headerLabel,
  titleLineOne,
  titleLineTwo,
  description,
  Icon,
  sections,
  featuredTools = [],
  featuredTitle,
  showSectionNavigation = false,
}: CategoryPageScaffoldProps) {
  const visibleSections = sections.filter(
    (section) => (section.tools?.length ?? 0) > 0 || section.content !== undefined
  );
  const guides = CATEGORY_GUIDES[categoryName] ?? [];
  const [primaryFeaturedTool, ...secondaryFeaturedTools] = featuredTools;
  const PrimaryFeaturedIcon = primaryFeaturedTool
    ? toolIconMap[primaryFeaturedTool.icon] ?? defaultToolIcon
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div id="category-overview" className="mb-12 max-w-3xl scroll-mt-24 sm:mb-14">
            <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <span>{categoryName}</span>
            </nav>

            <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-primary">
              <Icon className="h-[14px] w-[14px]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {headerLabel}
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-6xl">
              {titleLineOne}
              <br />
              <span className="text-primary">{titleLineTwo}</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {primaryFeaturedTool ? (
            <section aria-labelledby="featured-tools-heading" className="mb-12 sm:mb-14">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Start here
                  </p>
                  <h2
                    id="featured-tools-heading"
                    className="mt-2 text-2xl font-bold tracking-tight text-foreground"
                  >
                    {featuredTitle ?? `Featured ${categoryName.toLowerCase()} tools`}
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  Useful starting points for the most common tasks in this section.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <Link
                  href={primaryFeaturedTool.route}
                  className="group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.75rem] bg-primary p-7 text-primary-foreground shadow-[var(--ambient-shadow)] transition-transform duration-200 hover:-translate-y-0.5 lg:col-span-5"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-foreground/10" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="rounded-xl bg-primary-foreground/15 p-3">
                      {PrimaryFeaturedIcon ? <PrimaryFeaturedIcon className="h-6 w-6" /> : null}
                    </div>
                    <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                      Featured
                    </span>
                  </div>
                  <div className="relative mt-12">
                    <h3 className="text-2xl font-bold tracking-tight">
                      {primaryFeaturedTool.name}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/80">
                      {primaryFeaturedTool.shortDescription}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                      Open tool
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                  {secondaryFeaturedTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {showSectionNavigation && visibleSections.length > 1 ? (
            <nav
              aria-label={`${categoryName} sections`}
              className="mb-10 border-y border-[color:var(--ghost-border)] py-4"
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Jump to a section
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {visibleSections.map((section) => (
                  <Link
                    key={section.title}
                    href={`#${getSectionId(section.title)}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color:var(--ghost-border)] bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    {section.title}
                    {section.tools ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {section.tools.length}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}

          <div className="space-y-12">
            {visibleSections.map((section) => {
              const hasTools = (section.tools?.length ?? 0) > 0;
              return (
                <section
                  key={section.title}
                  id={getSectionId(section.title)}
                  className="scroll-mt-24"
                >
                  <div className="mb-6 mt-12 flex items-baseline gap-3 border-b border-[color:var(--ghost-border)] pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      {section.title}
                    </h2>
                    {section.tools ? (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {section.tools.length} {section.tools.length === 1 ? "tool" : "tools"}
                      </span>
                    ) : null}
                  </div>
                  {hasTools ? (
                    <div className={`grid gap-4 ${section.columnsClassName ?? "lg:grid-cols-3"}`}>
                      {section.tools?.map((tool) => (
                        <ToolCard key={tool.slug} tool={tool} />
                      ))}
                    </div>
                  ) : section.content}
                </section>
              );
            })}
          </div>

          {guides.length > 0 ? (
            <section
              aria-labelledby="category-guides-heading"
              className="mt-16 border-t border-[color:var(--ghost-border)] pt-10 sm:mt-20"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Practical guides
                  </p>
                  <h2
                    id="category-guides-heading"
                    className="mt-1 text-2xl font-bold tracking-tight text-foreground"
                  >
                    Choose the right workflow
                  </h2>
                </div>
              </div>
              <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {guides.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="group flex items-start justify-between gap-4 border-b border-[color:var(--ghost-border)] py-4"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                        {guide.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {guide.description}
                      </span>
                    </span>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
