import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Daily Games
          </h1>
          <p className="text-muted-foreground mb-8">
            Free daily brain puzzles. New challenges every day at midnight UTC.
          </p>
          <div className="space-y-4">
            <Link
              href="/play/numble"
              className="block rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{"\ud83d\udd22"}</span>
                <h2 className="text-xl font-semibold text-foreground">
                  Numble
                </h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Combine 6 numbers to reach today&apos;s target using +,
                &minus;, &times;, &divide;. One puzzle per day, same for
                everyone.
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
