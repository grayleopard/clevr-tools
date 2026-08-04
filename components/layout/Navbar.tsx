import Link from "next/link";
import { ArrowRight, ChevronDown, Hash, ImageIcon } from "lucide-react";
import {
  navigationCategories,
  playLinks,
  type NavigationCategory,
  type PlayLink,
} from "@/lib/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import NavbarLogo from "@/components/layout/NavbarLogo";
import MobileNavigation from "@/components/layout/MobileNavigation";
import CommandPalette from "@/components/search/CommandPalette";

function CategoryMenu({ category }: { category: NavigationCategory }) {
  const useTwoColumns = category.featured.length > 4;

  return (
    <div
      className={`border border-[color:var(--ghost-border)] bg-card/95 p-5 shadow-[var(--ambient-shadow-strong)] backdrop-blur-2xl ${
        useTwoColumns ? "w-[min(36rem,calc(100vw-2rem))]" : "w-72"
      }`}
    >
      <div className="px-2 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Featured tools
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      </div>

      <ul className={`grid gap-1 ${useTwoColumns ? "grid-cols-2" : "grid-cols-1"}`}>
        {category.featured.map((tool) => (
          <li key={tool.route}>
            <Link
              href={tool.route}
              className="block rounded-xl px-3 py-2.5 text-sm text-foreground transition-[background-color,color,transform] duration-150 hover:bg-muted/70 hover:text-primary"
            >
              {tool.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl bg-muted/60 px-4 py-3">
        <Link
          href={category.route}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          View all {category.label} tools
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function PlayLinkIcon({
  icon,
  className,
}: {
  icon: PlayLink["icon"];
  className?: string;
}) {
  if (icon === "image") {
    return <ImageIcon className={className} />;
  }

  return <Hash className={className} />;
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--ghost-border)] bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <NavbarLogo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navigationCategories.map((category) => (
              <div key={category.id} className="group relative">
                <Link
                  href={category.route}
                  className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-primary"
                  aria-haspopup="true"
                >
                  {category.label}
                  <ChevronDown
                    className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                    aria-hidden="true"
                  />
                </Link>

                <div
                  className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-max -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                  aria-label={`${category.label} tools`}
                >
                  <CategoryMenu category={category} />
                </div>
              </div>
            ))}

            <div className="group relative">
              <Link
                href="/play"
                className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-primary"
                aria-haspopup="true"
              >
                Play
                <ChevronDown
                  className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                  aria-hidden="true"
                />
              </Link>

              <div
                className="pointer-events-none invisible absolute right-0 top-full z-50 w-max pt-3 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 xl:left-1/2 xl:right-auto xl:-translate-x-1/2"
                aria-label="Play tools"
              >
                <div className="min-w-[360px] border border-[color:var(--ghost-border)] bg-card/95 p-4 shadow-[var(--ambient-shadow-strong)] backdrop-blur-2xl">
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
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/blog"
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-primary"
            >
              Blog
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <CommandPalette />
            <ThemeToggle />
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}
