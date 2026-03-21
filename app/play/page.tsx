import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, Hash, ImageIcon } from "lucide-react";
import { generateDailyPuzzle, getUTCDateString } from "@/lib/numble";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import DailyChallengeBanner from "@/components/numble/DailyChallengeBanner";

export const metadata: Metadata = {
  title: "Daily Games & Puzzles | clevr.tools",
  description:
    "Free daily games, brain puzzles, and creative tools. Numble daily number puzzle, Meme Generator, and more.",
};

export default function PlayPage() {
  const todayDate = getUTCDateString();
  const puzzle = generateDailyPuzzle(todayDate);

  return (
    <CategoryPageScaffold
      categoryName="Play"
      headerLabel="DAILY + CREATIVE"
      titleLineOne="Daily Puzzles and"
      titleLineTwo="Creative Tools"
      description="Brain games and creative utilities that fit the same lightweight, browser-first philosophy."
      Icon={Gamepad2}
      sections={[
        {
          title: "Daily Challenge",
          content: (
            <DailyChallengeBanner
              puzzleNumber={puzzle.puzzleNumber}
              target={puzzle.target}
              difficulty={puzzle.difficulty}
              todayDate={todayDate}
            />
          ),
        },
        {
          title: "Creative Tools",
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/play/numble"
                className="group rounded-xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--ambient-shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Hash className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Daily
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  Numble
                </h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  A daily number puzzle with one target, six numbers, and a clean browser-first streak tracker.
                </p>
              </Link>
              <Link
                href="/play/meme-generator"
                className="group rounded-xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--ambient-shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Create
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  Meme Generator
                </h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  Create memes from templates or your own image, edit live on canvas, and export a PNG locally.
                </p>
              </Link>
            </div>
          ),
        },
      ]}
    />
  );
}
