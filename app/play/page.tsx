import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DailyChallengeBanner from "@/components/numble/DailyChallengeBanner";

export const metadata: Metadata = {
  title: "Daily Games & Puzzles | clevr.tools",
  description:
    "Free daily games and brain puzzles. Numble: combine numbers to reach the target. New puzzles every day.",
};

export default function PlayPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Daily Games</h1>
          <p className="mb-8 text-muted-foreground">
            Free daily brain puzzles with a visible countdown to the next reset.
          </p>

          <DailyChallengeBanner />

          <div className="space-y-4">
            <Link
              href="/play/numble"
              className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">🔢</span>
                <h2 className="text-xl font-semibold text-foreground">Numble</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Combine 6 numbers to reach the target using +, −, ×, ÷. Play the shared daily puzzle or practice on unlimited extra puzzles.
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
