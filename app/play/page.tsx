import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DailyChallengeBanner from "@/components/numble/DailyChallengeBanner";

export const metadata: Metadata = {
  title: "Daily Games & Puzzles | clevr.tools",
  description:
    "Free daily games, brain puzzles, and creative tools. Numble daily number puzzle, Meme Generator, and more.",
};

export default function PlayPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Games & Creative Tools</h1>
          <p className="mb-8 text-muted-foreground">
            Daily brain puzzles, creative tools, and fun utilities.
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

            <Link
              href="/play/meme-generator"
              className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">😂</span>
                <h2 className="text-xl font-semibold text-foreground">Meme Generator</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Create memes from 30+ popular templates or your own image. Add text, choose styles, and download as PNG.
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
