import type { Metadata } from "next";
import NumbleGame from "@/components/numble/NumbleGame";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Numble \u2014 Daily Number Puzzle | clevr.tools",
  description:
    "Free daily number puzzle. Combine 6 numbers to reach the target using +, \u2212, \u00d7, \u00f7. One puzzle per day, same for everyone. Track your streak.",
  alternates: { canonical: "https://clevr.tools/play/numble" },
  openGraph: {
    title: "Numble \u2014 Daily Number Puzzle",
    description:
      "Free daily number puzzle. Combine 6 numbers to reach the target.",
    url: "https://clevr.tools/play/numble",
  },
};

export default function NumblePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <NumbleGame />

        {/* SEO content — below the fold */}
        <div className="bg-background py-12">
          <div className="max-w-2xl mx-auto px-4 space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                How to Play Numble
              </h2>
              <p>
                Numble is a free daily number puzzle. Each day, you&apos;re given 6
                numbers and a target. Use addition, subtraction, multiplication,
                and division to reach the target. You don&apos;t have to use all 6
                numbers, and each number can only be used once in your solution.
              </p>
              <p className="mt-2">
                Every day at midnight UTC, a new puzzle becomes available — and
                it&apos;s the same puzzle for everyone worldwide. Solve it, track your
                streak, and share your results.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Scoring
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="text-left p-2 font-medium">Stars</th>
                      <th className="text-left p-2 font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "\u2b50\u2b50\u2b50",
                        "Solved with the fewest possible steps (optimal solution)",
                      ],
                      [
                        "\u2b50\u2b50",
                        "Solved within one step of the optimal solution",
                      ],
                      [
                        "\u2b50",
                        "Solved, or got within 10 of the target",
                      ],
                    ].map((row, i) => (
                      <tr key={i} className="even:bg-muted/30">
                        <td className="p-2">{row[0]}</td>
                        <td className="p-2">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Tips and Strategies
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">
                    Start with the big numbers.
                  </strong>{" "}
                  Multiplication with large numbers (25, 50, 75, 100) gets you
                  close to the target quickly. Then use small numbers to
                  fine-tune.
                </li>
                <li>
                  <strong className="text-foreground">
                    Factor the target.
                  </strong>{" "}
                  If the target is 750, notice that 75 &times; 10 = 750.
                  Breaking the target into factors reveals paths.
                </li>
                <li>
                  <strong className="text-foreground">
                    Work backwards.
                  </strong>{" "}
                  Think about what simple operation would reach the target from a
                  nearby number.
                </li>
                <li>
                  <strong className="text-foreground">
                    Don&apos;t use all the numbers.
                  </strong>{" "}
                  Often the most elegant solution uses only 3-4 of the 6
                  numbers.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                About Numble
              </h2>
              <p>
                Numble is inspired by the Numbers Round from the TV show
                Countdown and the discontinued NYT Digits game. It&apos;s part of{" "}
                <Link
                  href="/"
                  className="text-primary underline hover:no-underline"
                >
                  clevr.tools
                </Link>
                , a collection of free online tools.
              </p>
              <p className="mt-2">
                A new puzzle is released every day. Your progress, streaks, and
                stats are saved locally in your browser — we never collect or
                store your data.
              </p>
              <p className="mt-2">
                Try our other daily challenges:{" "}
                <Link
                  href="/type/wpm-test"
                  className="text-primary underline hover:no-underline"
                >
                  WPM Test
                </Link>
                ,{" "}
                <Link
                  href="/type/reaction-time"
                  className="text-primary underline hover:no-underline"
                >
                  Reaction Time Test
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
