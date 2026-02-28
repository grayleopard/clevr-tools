import Link from "next/link";
import { getToolBySlug } from "@/lib/tools";
import { siteCategories, getCategoryToolCount } from "@/lib/site-structure";
import SmartConverterDeferred from "@/components/home/SmartConverterDeferred";
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
    canonical: "https://clevr.tools",
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
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <span>100% Free &middot; No Signup &middot; Files stay in your browser</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Fast, free, private tools for everyday tasks.
              </h1>
              <p className="mt-3 text-muted-foreground sm:text-lg">
                All processing happens in your browser. Your files never leave your device.
              </p>
            </div>

            {/* Smart converter */}
            <SmartConverterDeferred />
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
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
                  className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
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
