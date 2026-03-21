import Link from "next/link";
import type { ComponentType } from "react";
import { getToolBySlug } from "@/lib/tools";
import { siteCategories, getCategoryToolCount, playLinks } from "@/lib/site-structure";
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
  Gamepad2,
  Sparkles,
  Minimize2,
  Maximize2,
  FileImage,
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

type HomeCardItem = {
  label: string;
  href: string;
  badge?: string;
  description?: string;
  Icon?: ComponentType<{ className?: string }>;
};

type HomeCardData = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  route: string;
  itemCount: number;
  items: HomeCardItem[];
  Icon: ComponentType<{ className?: string }>;
  className: string;
  itemGridClassName?: string;
};

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  files: FolderOpen,
  "text-code": Code,
  calculate: Calculator,
  time: Clock,
  type: Keyboard,
};

const homeToolIcons: Record<string, ComponentType<{ className?: string }>> = {
  "image-compressor": Minimize2,
  "gif-compressor": Sparkles,
  "resize-image": Maximize2,
  "pdf-to-jpg": FileImage,
};

const categoryPresentation: Record<
  string,
  Pick<HomeCardData, "title" | "eyebrow" | "className" | "itemGridClassName">
> = {
  files: {
    title: "Files & Assets",
    eyebrow: "Core workflow",
    className: "xl:col-span-8",
    itemGridClassName: "sm:grid-cols-2",
  },
  time: {
    title: "Time",
    eyebrow: "Focus tools",
    className: "xl:col-span-4",
  },
  "text-code": {
    title: "Text & Code",
    eyebrow: "Write + transform",
    className: "xl:col-span-4",
  },
  calculate: {
    title: "Calculate",
    eyebrow: "Money + life",
    className: "xl:col-span-5",
  },
  type: {
    title: "Type",
    eyebrow: "Speed + rhythm",
    className: "xl:col-span-3",
  },
  play: {
    title: "Play",
    eyebrow: "Daily + creative",
    className: "xl:col-span-12",
    itemGridClassName: "md:grid-cols-2",
  },
};

function HomeCategoryCard({ card }: { card: HomeCardData }) {
  const Icon = card.Icon;
  const showFilesSubcards = card.id === "files";
  const filesPreviewItems = showFilesSubcards ? card.items.slice(0, 4) : [];

  return (
    <div
      className={`group flex h-full flex-col rounded-[1.75rem] bg-card/[0.94] p-8 shadow-[var(--shadow-sm)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:bg-card hover:shadow-[var(--ambient-shadow)] ${card.className}`}
    >
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>{card.eyebrow}</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-[2rem]">
              {card.title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {card.description}
            </p>
          </div>
        </div>
        <div className="rounded-[1.2rem] bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {showFilesSubcards ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filesPreviewItems.map((item) => {
            const ItemIcon = item.Icon ?? ArrowRight;

            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  className="group/link flex h-full flex-col rounded-[1rem] bg-muted/70 p-4 transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-full bg-primary/12 p-2 text-primary">
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    {item.badge ? (
                      <Badge
                        variant={item.badge === "popular" ? "default" : "secondary"}
                        className={
                          item.badge === "popular"
                            ? "text-[10px] capitalize"
                            : "border-transparent bg-secondary/[0.12] text-[10px] capitalize text-secondary"
                        }
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <span className="mt-5 text-base font-semibold text-foreground transition-colors group-hover/link:text-primary">
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className="mt-2 text-xs leading-6 text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className={`grid gap-3 ${card.itemGridClassName ?? ""}`}>
          {card.items.map((item) => (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className="group/link flex h-full flex-col justify-between rounded-[1.2rem] bg-muted/65 px-4 py-3 transition-[background-color,color] duration-150 hover:bg-muted/90"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge
                      variant={item.badge === "popular" ? "default" : "secondary"}
                      className={
                        item.badge === "popular"
                          ? "text-[10px] capitalize"
                          : "border-transparent bg-secondary/[0.12] text-[10px] capitalize text-secondary"
                      }
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </span>
                {item.description ? (
                  <span className="mt-2 text-xs leading-6 text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={card.route}
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        View all {card.itemCount} {card.itemCount === 1 ? "tool" : "tools"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const todayDate = getUTCDateString();
  const puzzle = generateDailyPuzzle(todayDate);
  const categoryMap = new Map(siteCategories.map((category) => [category.id, category]));

  const orderedCards = ["files", "time", "text-code", "calculate", "type"]
    .map((id) => categoryMap.get(id))
    .filter((category): category is (typeof siteCategories)[number] => category !== undefined)
    .map((category) => {
      const presentation = categoryPresentation[category.id];
      const Icon = categoryIcons[category.id] ?? FolderOpen;

      return {
        id: category.id,
        title: presentation.title,
        eyebrow: presentation.eyebrow,
        description: category.description,
        route: category.route,
        itemCount: getCategoryToolCount(category),
        items: category.featuredSlugs.flatMap((slug) => {
          const tool = getToolBySlug(slug);
          if (!tool || tool.live === false) return [];

          return [{
            label: tool.name,
            href: tool.route,
            badge: tool.badge,
            description: tool.shortDescription,
            Icon: homeToolIcons[tool.slug],
          }];
        }),
        Icon,
        className: presentation.className,
        itemGridClassName: presentation.itemGridClassName,
      } satisfies HomeCardData;
    });

  const playCard: HomeCardData = {
    id: "play",
    title: categoryPresentation.play.title,
    eyebrow: categoryPresentation.play.eyebrow,
    description: "Daily puzzles and creative tools that fit the same lightweight, browser-first philosophy as the rest of clevr.tools.",
    route: "/play",
    itemCount: playLinks.length,
    items: playLinks.map((item) => ({
      label: item.label,
      href: item.route,
      description: item.description,
    })),
    Icon: Gamepad2,
    className: categoryPresentation.play.className,
    itemGridClassName: categoryPresentation.play.itemGridClassName,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-24">
        {/* Hero */}
        <section className="px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,rgba(255,255,255,0.76),rgba(239,241,242,0.96))] px-5 py-8 shadow-[var(--ambient-shadow)] dark:bg-[linear-gradient(160deg,rgba(15,25,48,0.92),rgba(9,19,40,0.98))] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex flex-wrap justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="rounded-full bg-card/80 px-3 py-1.5">Free tools</span>
                  <span className="rounded-full bg-card/80 px-3 py-1.5">No signup</span>
                  <span className="rounded-full bg-card/80 px-3 py-1.5">Local browser processing</span>
                </div>

                <div className="mb-4 text-center">
                  <h1 className="text-5xl font-black tracking-[-0.04em] sm:text-6xl lg:text-[3.5rem]">
                    Free tools. No signup. <span className="text-primary">Zero</span> data collection.
                  </h1>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg sm:leading-8">
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
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Browse by category
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-[2.25rem]">
                Choose the workflow you need.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Files, text, calculators, timers, typing tools, and play links stay easy to scan with more hierarchy, clearer discovery, and room to move fast.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12">
            {orderedCards.map((card) => (
              <HomeCategoryCard key={card.id} card={card} />
            ))}
            <HomeCategoryCard card={playCard} />
          </div>

          <div aria-hidden="true" className="h-12 sm:h-16" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
