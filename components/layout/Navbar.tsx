import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Hash,
  ImageIcon,
  Menu,
  X,
} from "lucide-react";
import { playLinks, siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import NavbarLogo from "@/components/layout/NavbarLogo";

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
        <div key={sub.label} className="space-y-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {sub.label}
          </h4>
          <ul className={`space-y-1 ${sub.seeAllRoute ? "grid grid-cols-2 gap-x-4 gap-y-1 space-y-0" : ""}`}>
            {sub.slugs.map((slug) => {
              const tool = getToolBySlug(slug);
              if (!tool || tool.live === false) return null;
              return (
                <li key={slug}>
                  <Link
                    href={tool.route}
                    className="block rounded-xl px-3 py-2 text-sm text-foreground transition-[background-color,color,transform] duration-150 hover:bg-muted/70 hover:text-primary"
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
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80"
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

function PlayLinkIcon({
  icon,
  className,
}: {
  icon: (typeof playLinks)[number]["icon"];
  className?: string;
}) {
  if (icon === "image") {
    return <ImageIcon className={className} />;
  }

  return <Hash className={className} />;
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between rounded-[1.35rem] border border-[color:var(--ghost-border)] bg-card/70 px-3 shadow-[var(--ambient-shadow)] backdrop-blur-xl">
          <NavbarLogo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {siteCategories.map((cat) => (
              <div key={cat.id} className="group relative">
                <Link
                  href={cat.route}
                  className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-primary"
                  aria-haspopup="true"
                >
                  {cat.label}
                  <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
                </Link>

                <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-max -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100" role="menu" aria-label={`${cat.label} tools`}>
                  <div
                    className={`rounded-[1.35rem] border border-[color:var(--ghost-border)] bg-card/95 p-6 shadow-[var(--ambient-shadow-strong)] backdrop-blur-2xl max-w-[calc(100vw-2rem)] ${
                      cat.subcategories.length === 1
                        ? "min-w-[260px]"
                        : cat.subcategories.length === 2
                        ? "min-w-[440px]"
                        : "min-w-[620px]"
                    }`}
                  >
                    <div
                      className={`grid gap-8 ${
                        cat.subcategories.length === 1
                          ? "grid-cols-1"
                          : cat.subcategories.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3"
                      }`}
                    >
                      <CategoryMenu category={cat} />
                    </div>

                    <div className="mt-5 rounded-2xl bg-muted/60 px-4 py-3">
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
            <div className="group relative">
              <Link
                href="/play"
                className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-primary"
                aria-haspopup="true"
              >
                Play
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
              </Link>

              <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-max -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100" role="menu" aria-label="Play tools">
                <div className="min-w-[360px] rounded-[1.35rem] border border-[color:var(--ghost-border)] bg-card/95 p-4 shadow-[var(--ambient-shadow-strong)] backdrop-blur-2xl">
                  <div className="space-y-1.5">
                    {playLinks.map((item) => (
                      <Link
                        key={item.route}
                        href={item.route}
                        className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/70"
                      >
                        <span className="rounded-xl bg-primary/10 p-2 text-primary">
                          <PlayLinkIcon icon={item.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {item.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-muted/60 px-4 py-3">
                    <Link
                      href="/play"
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      View all Play tools
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/blog"
              className="rounded-xl px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-primary"
            >
              Blog
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <details className="group relative md:hidden">
              <summary className="cursor-pointer list-none rounded-xl border border-[color:var(--ghost-border)] bg-muted/70 p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary">
                <span className="sr-only">Toggle menu</span>
                <Menu className="h-5 w-5 group-open:hidden" />
                <X className="hidden h-5 w-5 group-open:block" />
              </summary>

              <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-h-[70dvh] overflow-y-auto rounded-[1.35rem] border border-[color:var(--ghost-border)] bg-card/95 p-3 shadow-[var(--ambient-shadow-strong)] backdrop-blur-2xl">
                <nav className="space-y-2" aria-label="Mobile navigation">
                  <details className="group/category rounded-2xl bg-muted/55 p-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary/10">
                      Play
                      <ChevronDown className="h-4 w-4 text-primary transition-transform group-open/category:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-1 rounded-2xl bg-card/80 p-2">
                      {playLinks.map((item) => (
                        <Link
                          key={item.route}
                          href={item.route}
                          className="flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/70"
                        >
                          <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                            <PlayLinkIcon icon={item.icon} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold">{item.label}</span>
                            <span className="block text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/play"
                        className="mt-1 flex items-center gap-1 rounded-xl px-3 py-3 text-sm text-primary transition-colors hover:bg-primary/[0.08] hover:text-primary/80"
                      >
                        View all Play tools
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </details>
                  {siteCategories.map((cat) => (
                    <details key={cat.id} className="group/category rounded-2xl bg-muted/55 p-2">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted/80 hover:text-primary">
                        {cat.label}
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open/category:rotate-180" />
                      </summary>
                      <div className="mt-2 space-y-4 rounded-2xl bg-card/80 p-3">
                        <CategoryMenu category={cat} closeOnClick />
                        <Link
                          href={cat.route}
                          className="flex items-center gap-1 rounded-xl px-3 py-3 text-sm text-primary transition-colors hover:bg-primary/[0.08] hover:text-primary/80"
                        >
                          View all {cat.label} tools
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </details>
                  ))}
                  <Link
                    href="/blog"
                    className="block rounded-2xl bg-muted/55 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-primary"
                  >
                    Blog
                  </Link>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
