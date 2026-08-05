import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { generateDailyPuzzle, getUTCDateString } from "@/lib/numble";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import DailyChallengeBanner from "@/components/numble/DailyChallengeBanner";

const title = "Daily Games & Puzzles | clevr.tools";
const description =
  "Free daily browser-based number puzzles. Play Numble, build a valid equation, and track your streak without signing up.";
const canonicalUrl = "https://www.clevr.tools/play";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: "clevr.tools",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function PlayPage() {
  const todayDate = getUTCDateString();
  const puzzle = generateDailyPuzzle(todayDate);

  return (
    <CategoryPageScaffold
      categoryName="Play"
      headerLabel="DAILY PUZZLE"
      titleLineOne="A Daily Number"
      titleLineTwo="Challenge"
      description="A focused browser-based puzzle with one target, six numbers, and a fresh challenge every day."
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
      ]}
    />
  );
}
