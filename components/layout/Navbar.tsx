import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function CategoryMenu({
  category,
  closeOnClick = false,
}: {
  category: (typeof siteCategories)[number];
  closeOnClick?: boolean;
}) {
  return (
    <>
      {category.subcategories.map((sub) => (
        <div key={sub.label}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sub.label}
          </h4>
          <ul className={`space-y-0.5 ${sub.seeAllRoute ? "grid grid-cols-2 gap-x-4 gap-y-0.5 space-y-0" : ""}`}>
            {sub.slugs.map((slug) => {
              const tool = getToolBySlug(slug);
              if (!tool || tool.live === false) return null;
              return (
                <li key={slug}>
                  <Link
                    href={tool.route}
                    className="block rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                    data-close={closeOnClick ? "true" : undefined}
                  >
                    {tool.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          {sub.seeAllRoute && (
            <Link
              href={sub.seeAllRoute}
              className="mt-2 flex items-center gap-1 px-2 py-1 text-xs text-primary transition-colors hover:text-primary/80"
              data-close={closeOnClick ? "true" : undefined}
            >
              {sub.seeAllLabel ?? "See all"}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      ))}
    </>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          <span>
            <span className="text-primary">clevr</span>
            <span className="text-muted-foreground">.tools</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary navigation">
          {siteCategories.map((cat) => (
            <div key={cat.id} className="group relative">
              <Link
                href={cat.route}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {cat.label}
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-max -translate-x-1/2 pt-1 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                <div
                  className={`rounded-xl border border-border bg-popover p-5 shadow-xl ${
                    cat.subcategories.length === 1
                      ? "min-w-[220px]"
                      : cat.subcategories.length === 2
                      ? "min-w-[400px]"
                      : "min-w-[560px]"
                  }`}
                >
                  <div
                    className={`grid gap-6 ${
                      cat.subcategories.length === 1
                        ? "grid-cols-1"
                        : cat.subcategories.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    <CategoryMenu category={cat} />
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <Link
                      href={cat.route}
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      View all {cat.label} tools
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link
            href="/play/numble"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <span>{"\ud83d\udd22"}</span>
            Numble
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <details className="group relative md:hidden">
            <summary className="list-none rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer">
              <span className="sr-only">Toggle menu</span>
              <Menu className="h-5 w-5 group-open:hidden" />
              <X className="hidden h-5 w-5 group-open:block" />
            </summary>

            <div className="absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-h-[70dvh] overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-xl">
              <nav className="space-y-1" aria-label="Mobile navigation">
                <Link
                  href="/play/numble"
                  className="flex items-center gap-2 rounded-md px-2 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <span>{"\ud83d\udd22"}</span>
                  Numble — Daily Puzzle
                </Link>
                <div className="border-t border-border my-1" />
                {siteCategories.map((cat) => (
                  <details key={cat.id} className="group/category rounded-md border border-transparent open:border-border">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                      {cat.label}
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open/category:rotate-180" />
                    </summary>
                    <div className="ml-2 mb-1 border-l border-border pl-3">
                      <CategoryMenu category={cat} closeOnClick />
                      <Link
                        href={cat.route}
                        className="mt-2 flex items-center gap-1 px-2 py-2 text-sm text-primary transition-colors hover:text-primary/80"
                      >
                        View all {cat.label} tools
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </details>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
