import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import TypingRace from "@/components/tools/TypingRace";
import { notFound } from "next/navigation";
import Link from "next/link";

const tool = getToolBySlug("race")!;

export async function generateMetadata(): Promise<Metadata> {
  if (!tool) return {};
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `https://clevr.tools${tool.route}`,
      siteName: "clevr.tools",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    alternates: {
      canonical: `https://clevr.tools${tool.route}`,
    },
  };
}

export default function TypingRacePage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <TypingRace />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Ghost Difficulty Levels
          </h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Level</th>
                  <th className="text-left p-2 font-medium">Ghost WPM</th>
                  <th className="text-left p-2 font-medium">Equivalent To</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Casual", "40", "Average adult typist"],
                  ["Average", "60", "Regular computer user"],
                  ["Fast", "80", "Experienced typist"],
                  ["Pro", "100", "Professional typist"],
                  ["Expert", "120", "Competitive typist"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                    <td className="p-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            How the Race Works
          </h2>
          <p>
            You and the ghost start at the same time. The ghost types at a
            constant speed based on the selected difficulty level. Your goal is
            to finish the passage before the ghost does. Focus on accuracy
            &mdash; correcting mistakes costs valuable time.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Improve Your Race Performance
          </h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Start with a difficulty close to your current WPM and work up
            </li>
            <li>Focus on accuracy first &mdash; backspacing wastes time</li>
            <li>Keep your eyes on the upcoming text, not what you just typed</li>
            <li>Maintain a steady rhythm rather than bursting and pausing</li>
            <li>
              Practice with our{" "}
              <Link
                href="/type/wpm-test"
                className="text-primary underline hover:no-underline"
              >
                WPM Test
              </Link>{" "}
              to establish your baseline speed
            </li>
          </ol>
        </section>
      </div>
    </ToolLayout>
  );
}
