import Link from "next/link";
import { getToolBySlug } from "@/lib/tools";
import { siteCategories, getCategoryToolCount } from "@/lib/site-structure";
import { generateDailyPuzzle, getUTCDateString } from "@/lib/numble";
import SmartConverterDeferred from "@/components/home/SmartConverterDeferred";
import DailyChallengeBanner from "@/components/numble/DailyChallengeBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Code,
  Calculator,
  Clock,
  Keyboard,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "clevr.tools — Free Online File & Text Tools",
  description:
    "Free browser-based file and text tools: compress images, convert formats, generate QR codes, count words, convert case, and more. No signup. Nothing ever leaves your device.",
  alternates: {
    canonical: "https://www.clevr.tools",
  },
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  files: FolderOpen,
  "text-code": Code,
  calculate: Calculator,
  time: Clock,
  type: Keyboard,
};

export default function HomePage() {
  const todayDate = getUTCDateString();
  const puzzle = generateDailyPuzzle(todayDate);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-24">
        {/* Hero */}
        <section className="px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,rgba(255,255,255,0.76),rgba(239,241,242,0.96))] px-5 py-12 shadow-[var(--ambient-shadow)] dark:bg-[linear-gradient(160deg,rgba(15,25,48,0.92),rgba(9,19,40,0.98))] sm:px-8 sm:py-16 lg:px-12 lg:py-20">
              <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex flex-wrap justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="rounded-full bg-card/80 px-3 py-1.5">Free tools</span>
                  <span className="rounded-full bg-card/80 px-3 py-1.5">No signup</span>
                  <span className="rounded-full bg-card/80 px-3 py-1.5">Local browser processing</span>
                </div>

                <div className="mb-10 text-center">
                  <h1 className="text-5xl font-black tracking-[-0.04em] sm:text-6xl lg:text-[3.5rem]">
                    Free tools. No signup. <span className="text-primary">Zero</span> data collection.
                  </h1>
                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                    File converters, calculators, typing tests, and developer tools. Everything runs in your browser — nothing leaves your device.
                  </p>
                </div>

                {/* Smart converter */}
                <SmartConverterDeferred />
              </div>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <DailyChallengeBanner
            puzzleNumber={puzzle.puzzleNumber}
            target={puzzle.target}
            difficulty={puzzle.difficulty}
            todayDate={todayDate}
          />
          <p className="mb-6 text-sm text-muted-foreground">
            Browse by category:
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {siteCategories.map((cat) => {
              const Icon = categoryIcons[cat.id] ?? FolderOpen;
              const toolCount = getCategoryToolCount(cat);

              return (
                <div
                  key={cat.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
                >
                  {/* Category header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {cat.label}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Featured tools */}
                  <ul className="mb-4 flex-1 space-y-1">
                    {cat.featuredSlugs.map((slug) => {
                      const tool = getToolBySlug(slug);
                      if (!tool || tool.live === false) return null;
                      return (
                        <li key={slug}>
                          <Link
                            href={tool.route}
                            className="group/link flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                          >
                            <span className="text-foreground group-hover/link:text-primary transition-colors">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <Badge
                                variant={
                                  tool.badge === "popular"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] capitalize"
                              >
                                {tool.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* View all */}
                  <Link
                    href={cat.route}
                    className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    View all {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
