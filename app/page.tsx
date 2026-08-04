import Link from "next/link";
import { getToolBySlug, tools } from "@/lib/tools";
import { siteCategories, getCategoryToolCount, playLinks } from "@/lib/site-structure";
import { generateDailyPuzzle, getUTCDateString } from "@/lib/numble";
import SmartConverterDeferred from "@/components/home/SmartConverterDeferred";
import CollapsibleToolList from "@/components/home/CollapsibleToolList";
import DailyChallengeBanner from "@/components/numble/DailyChallengeBanner";
import HeroSearchTrigger from "@/components/home/HeroSearchTrigger";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "clevr.tools — Free Online File & Text Tools",
  description:
    "Free online file and text tools: compress images, convert formats, generate QR codes, count words, convert case, and more. Local tools are clearly labeled and run in your browser.",
  alternates: {
    canonical: "https://www.clevr.tools",
  },
};

/** Tools promoted in the hero's "Most used this week" list. */
const MOST_USED_SLUGS = ["image-compressor", "pdf-to-jpg", "word-counter", "typing-test", "wpm-test"];

type HomeCardItem = {
  label: string;
  href: string;
  badge?: string;
  description?: string;
};

type HomeCardVariant = "rich" | "compact";

type HomeCardData = {
  id: string;
  title: string;
  description: string;
  route: string;
  itemCount: number;
  items: HomeCardItem[];
  className: string;
  itemGridClassName?: string;
  variant: HomeCardVariant;
  showItemDescriptions?: boolean;
};

const categoryPresentation: Record<
  string,
  Pick<HomeCardData, "title" | "className" | "itemGridClassName" | "variant" | "showItemDescriptions">
> = {
  files: {
    title: "Files & Assets",
    className: "sm:col-span-2",
    itemGridClassName: "sm:grid-cols-2",
    variant: "rich",
    showItemDescriptions: true,
  },
  time: {
    title: "Time",
    className: "",
    variant: "compact",
  },
  "text-code": {
    title: "Text & Code",
    className: "",
    variant: "compact",
  },
  calculate: {
    title: "Calculate",
    className: "",
    variant: "compact",
  },
  type: {
    title: "Type",
    className: "",
    variant: "compact",
  },
  play: {
    title: "Play",
    className: "sm:col-span-2 lg:col-span-3",
    itemGridClassName: "sm:grid-cols-2",
    variant: "compact",
    showItemDescriptions: true,
  },
};

/** Sort items so popular-badged tools come first, then new, then unbadged.
 *  // TODO: Replace badge-based sorting with pageview-based sorting once analytics data is available */
function sortByBadgePriority(items: HomeCardItem[]): HomeCardItem[] {
  const priority = (badge?: string) =>
    badge === "popular" ? 0 : badge === "new" ? 1 : 2;
  return [...items].sort((a, b) => priority(a.badge) - priority(b.badge));
}

function HomeToolRow({ item, showDescription }: { item: HomeCardItem; showDescription?: boolean }) {
  return (
    <li className="min-w-0 border-b border-[color:var(--ghost-border)]">
      <Link href={item.href} className="group/link block py-3">
        <span className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">
            {item.label}
          </span>
          {item.badge ? (
            <Badge
              variant={item.badge === "popular" ? "default" : "secondary"}
              className={
                item.badge === "popular"
                  ? "shrink-0 text-[10px] capitalize"
                  : "shrink-0 border-transparent bg-secondary/[0.12] text-[10px] capitalize text-secondary"
              }
            >
              {item.badge}
            </Badge>
          ) : null}
        </span>
        {showDescription && item.description ? (
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {item.description}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function HomeCategoryCard({ card }: { card: HomeCardData }) {
  const compact = card.variant === "compact";

  return (
    <div className={`flex h-full flex-col border-t-2 border-foreground pt-5 ${card.className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.015em] text-foreground sm:text-[1.65rem]">
          {card.title}
        </h2>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {card.itemCount} {card.itemCount === 1 ? "tool" : "tools"}
        </span>
      </div>

      {!compact ? (
        <p className="mb-4 max-w-md text-sm leading-6 text-muted-foreground">{card.description}</p>
      ) : null}

      <ul className={`grid gap-x-8 ${card.itemGridClassName ?? ""}`}>
        <CollapsibleToolList previewCount={3}>
          {card.items.map((item) => (
            <HomeToolRow key={item.href} item={item} showDescription={card.showItemDescriptions} />
          ))}
        </CollapsibleToolList>
      </ul>

      <Link
        href={card.route}
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
      >
        View all {card.itemCount} {card.itemCount === 1 ? "tool" : "tools"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const todayDate = getUTCDateString();
  const puzzle = generateDailyPuzzle(todayDate);
  const categoryMap = new Map(siteCategories.map((category) => [category.id, category]));
  const totalToolCount = tools.filter((tool) => tool.live !== false).length;

  const mostUsedTools = MOST_USED_SLUGS.flatMap((slug) => {
    const tool = getToolBySlug(slug);
    return tool && tool.live !== false ? [tool] : [];
  });

  const orderedCards = ["files", "time", "text-code", "calculate", "type"]
    .map((id) => categoryMap.get(id))
    .filter((category): category is (typeof siteCategories)[number] => category !== undefined)
    .map((category) => {
      const presentation = categoryPresentation[category.id];

      const items = category.featuredSlugs.flatMap((slug) => {
        const tool = getToolBySlug(slug);
        if (!tool || tool.live === false) return [];

        return [{
          label: tool.name,
          href: tool.route,
          badge: tool.badge,
          description: tool.shortDescription,
        }];
      });

      return {
        id: category.id,
        title: presentation.title,
        description: category.description,
        route: category.route,
        itemCount: getCategoryToolCount(category),
        items: sortByBadgePriority(items),
        className: presentation.className,
        itemGridClassName: presentation.itemGridClassName,
        variant: presentation.variant,
        showItemDescriptions: presentation.showItemDescriptions,
      } satisfies HomeCardData;
    });

  const playPresentation = categoryPresentation.play;
  const playCard: HomeCardData = {
    id: "play",
    title: playPresentation.title,
    description:
      "Daily puzzles and creative tools that fit the same lightweight, browser-first philosophy as the rest of clevr.tools.",
    route: "/play",
    itemCount: playLinks.length,
    items: playLinks.map((item) => ({
      label: item.label,
      href: item.route,
      description: item.description,
    })),
    className: playPresentation.className,
    itemGridClassName: playPresentation.itemGridClassName,
    variant: playPresentation.variant,
    showItemDescriptions: playPresentation.showItemDescriptions,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero — search and the file drop zone are two equal entry points, both above the fold */}
        <section className="border-b border-[color:var(--ghost-border)] px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl sm:mb-10">
              <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl">
                Free tools. No signup.
                <br />
                <span className="text-primary">Clear</span> processing boundaries.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                File converters, calculators, typing tests, and developer tools. Search for one or
                drop a supported file below. Local workflows run in your browser, and every tool
                states where processing happens before you start.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="min-w-0">
                <HeroSearchTrigger toolCount={totalToolCount} />

                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Common starting points
                  </p>
                  <ul className="mt-2">
                    {mostUsedTools.map((tool) => (
                      <li key={tool.slug} className="min-w-0 border-b border-[color:var(--ghost-border)]">
                        <Link
                          href={tool.route}
                          className="group/link flex items-center justify-between gap-4 py-3 text-sm"
                        >
                          <span className="truncate font-semibold text-foreground transition-colors group-hover/link:text-primary">
                            {tool.name}
                          </span>
                          {tool.badge ? (
                            <Badge
                              variant={tool.badge === "popular" ? "default" : "secondary"}
                              className="shrink-0 text-[10px] capitalize"
                            >
                              {tool.badge}
                            </Badge>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="min-w-0">
                <SmartConverterDeferred />
              </div>
            </div>
          </div>
        </section>

        {/* Daily challenge — promoted above the tool index, brought into the site grammar */}
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12">
          <DailyChallengeBanner
            puzzleNumber={puzzle.puzzleNumber}
            target={puzzle.target}
            difficulty={puzzle.difficulty}
            todayDate={todayDate}
          />
        </section>

        {/* Tool index — weighted: Files gets the rich treatment, the rest are compact ruled lists */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--ghost-border)] pb-5 sm:mb-10">
            <h2 className="font-display text-3xl font-extrabold uppercase leading-none tracking-[-0.02em] text-foreground sm:text-4xl">
              Browse by task
            </h2>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {totalToolCount} tools · 6 groups
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {orderedCards.map((card) => (
              <HomeCategoryCard key={card.id} card={card} />
            ))}
            <HomeCategoryCard card={playCard} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
