import Link from "next/link";
import type { ComponentType } from "react";
import { getToolBySlug } from "@/lib/tools";
import { siteCategories, getCategoryToolCount, playLinks } from "@/lib/site-structure";
import { generateDailyPuzzle, getUTCDateString } from "@/lib/numble";
import { getToolIcon, type IconComponent } from "@/lib/tool-icons";
import SmartConverterDeferred from "@/components/home/SmartConverterDeferred";
import CollapsibleToolList from "@/components/home/CollapsibleToolList";
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
  Hash,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "clevr.tools — Free Online File & Text Tools",
  description:
    "Free browser-based file and text tools: compress images, convert formats, generate QR codes, count words, convert case, and more. No signup.",
  alternates: {
    canonical: "https://www.clevr.tools",
  },
};

type HomeCardItem = {
  label: string;
  href: string;
  badge?: string;
  description?: string;
  Icon: ComponentType<{ className?: string }>;
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

const categoryPresentation: Record<
  string,
  Pick<HomeCardData, "title" | "eyebrow" | "className" | "itemGridClassName">
> = {
  files: {
    title: "Files & Assets",
    eyebrow: "Files & Workflow",
    className: "",
    itemGridClassName: "sm:grid-cols-2",
  },
  time: {
    title: "Time",
    eyebrow: "Focus & Time",
    className: "",
  },
  "text-code": {
    title: "Text & Code",
    eyebrow: "Write & Transform",
    className: "",
  },
  calculate: {
    title: "Calculate",
    eyebrow: "Money & Life",
    className: "",
  },
  type: {
    title: "Type",
    eyebrow: "Speed & Rhythm",
    className: "",
  },
  play: {
    title: "Play",
    eyebrow: "Daily & Play",
    className: "",
    itemGridClassName: "md:grid-cols-2",
  },
};

const playIconMap: Record<string, IconComponent> = {
  hash: Hash,
  image: ImageIcon,
};

/** Sort items so popular-badged tools come first, then new, then unbadged.
 *  // TODO: Replace badge-based sorting with pageview-based sorting once analytics data is available */
function sortByBadgePriority(items: HomeCardItem[]): HomeCardItem[] {
  const priority = (badge?: string) =>
    badge === "popular" ? 0 : badge === "new" ? 1 : 2;
  return [...items].sort((a, b) => priority(a.badge) - priority(b.badge));
}

function HomeToolCard({ item }: { item: HomeCardItem }) {
  const ItemIcon = item.Icon;

  return (
    <li className="min-w-0">
      <Link
        href={item.href}
        className="group/link grid h-full grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 border-b border-[color:var(--ghost-border)] py-4 transition-[background-color,color] duration-150 hover:bg-primary/[0.07]"
      >
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center border border-primary/35 bg-primary/10 text-primary">
          <ItemIcon className="h-4 w-4" />
        </div>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-bold text-foreground transition-colors group-hover/link:text-primary">
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
          {item.description ? (
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

function HomeCategoryCard({ card }: { card: HomeCardData }) {
  const Icon = card.Icon;

  return (
    <div
      className={`group flex h-full flex-col border-t-2 border-foreground bg-background/70 px-5 pb-5 pt-6 transition-colors duration-200 hover:bg-card/70 sm:px-6 ${card.className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>{card.eyebrow}</span>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.06em] text-foreground">
              {card.title}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {card.description}
            </p>
          </div>
        </div>
        <div className="grid size-11 place-items-center border border-primary/35 bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <ul className={`grid gap-3 ${card.itemGridClassName ?? ""}`}>
        <CollapsibleToolList previewCount={3}>
          {card.items.map((item) => (
            <HomeToolCard key={item.href} item={item} />
          ))}
        </CollapsibleToolList>
      </ul>

      <Link
        href={card.route}
        className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
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

      const items = category.featuredSlugs.flatMap((slug) => {
        const tool = getToolBySlug(slug);
        if (!tool || tool.live === false) return [];

        return [{
          label: tool.name,
          href: tool.route,
          badge: tool.badge,
          description: tool.shortDescription,
          Icon: getToolIcon(tool.icon),
        }];
      });

      return {
        id: category.id,
        title: presentation.title,
        eyebrow: presentation.eyebrow,
        description: category.description,
        route: category.route,
        itemCount: getCategoryToolCount(category),
        items: sortByBadgePriority(items),
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
      Icon: playIconMap[item.icon] ?? Hash,
    })),
    Icon: Gamepad2,
    className: categoryPresentation.play.className,
    itemGridClassName: categoryPresentation.play.itemGridClassName,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative grid gap-10 border-b border-[color:var(--ghost-border)] py-16 md:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] md:items-end md:py-24 lg:gap-20 lg:py-28">
            <span className="pointer-events-none absolute right-0 top-6 font-display text-[8rem] font-black leading-none tracking-[-0.1em] text-[color:var(--ghost-border)] sm:text-[11rem]" aria-hidden="true">
              01
            </span>
            <div className="relative">
              <p className="mb-5 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                116 focused utilities · no account required
              </p>
              <h1 className="max-w-4xl font-display text-[clamp(3.5rem,9vw,7.5rem)] font-black uppercase leading-[0.82] tracking-[-0.085em] text-foreground">
                Tools that get <span className="text-primary">out of your way.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Compress a file, convert a format, check a calculation, or clean up text. Start immediately, get a clear result, and move on.
              </p>
            </div>

            <aside className="relative border-l-4 border-primary bg-muted/75 p-6 shadow-[var(--shadow-md)]" aria-label="Recommended starting points">
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Proven starting points
              </p>
              <div className="border-t border-[color:var(--ghost-border)]">
                {[
                  ["Image Compressor", "/compress/image", "Browser-local"],
                  ["PDF to JPG", "/convert/pdf-to-jpg", "Browser-local"],
                  ["Merge PDF", "/tools/merge-pdf", "Browser-local"],
                ].map(([label, href, note]) => (
                  <Link key={href} href={href} className="group flex items-center justify-between gap-4 border-b border-[color:var(--ghost-border)] py-3.5">
                    <span className="font-bold text-foreground transition-colors group-hover:text-primary">{label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{note}</span>
                  </Link>
                ))}
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Privacy is a tool-by-tool contract. Each workflow tells you where processing happens before you begin.
              </p>
            </aside>
          </div>

          <div className="grid gap-8 border-b border-[color:var(--ghost-border)] py-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Start with a file</p>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-none tracking-[-0.055em] sm:text-4xl">One file. The right next step.</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Drop a supported file and choose from verified actions.</p>
            </div>
            <SmartConverterDeferred />
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-9 flex flex-col justify-between gap-5 border-b border-[color:var(--ghost-border)] pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tool index</p>
              <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-[-0.06em] sm:text-5xl">Browse by task</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">A compact index for the work you came to finish—files first, then time, text, calculations, typing, and play.</p>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {orderedCards.map((card) => (
              <HomeCategoryCard key={card.id} card={card} />
            ))}
            <HomeCategoryCard card={playCard} />
          </div>
        </section>

        {/* Daily challenge — after all categories */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
          <DailyChallengeBanner
            puzzleNumber={puzzle.puzzleNumber}
            target={puzzle.target}
            difficulty={puzzle.difficulty}
            todayDate={todayDate}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
