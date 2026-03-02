import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import WordBlitz from "@/components/tools/WordBlitz";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { notFound } from "next/navigation";
import Link from "next/link";

const tool = getToolBySlug("word-blitz")!;
const faqItems = getToolFaqs("word-blitz");

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

export default function WordBlitzPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <WordBlitz />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Scoring System
          </h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Streak</th>
                  <th className="text-left p-2 font-medium">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0\u20134 words", "1x"],
                  ["5\u20139 words", "2x"],
                  ["10\u201319 words", "3x"],
                  ["20\u201329 words", "4x"],
                  ["30+ words", "5x"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Each word scores its character count multiplied by your current
            streak multiplier. Build long streaks without mistakes for the
            highest scores.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Tips for High Scores
          </h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Accuracy is more important than raw speed &mdash; broken streaks
              reset your multiplier
            </li>
            <li>
              Start with easy mode to build confidence and learn the rhythm
            </li>
            <li>
              Words auto-submit when typed correctly &mdash; no need to press
              Enter or Space
            </li>
            <li>
              Keep your eyes on the word, not the input field &mdash; trust your
              typing
            </li>
            <li>
              Practice with our{" "}
              <Link
                href="/type/wpm-test"
                className="text-primary underline hover:no-underline"
              >
                WPM Test
              </Link>{" "}
              to build raw speed
            </li>
          </ol>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Difficulty Levels
          </h2>
          <p>
            <strong>Easy</strong> uses common 4&ndash;5 letter words that most
            people type frequently. <strong>Medium</strong> uses 6&ndash;8
            letter words that require more precise typing.{" "}
            <strong>Hard</strong> uses 8&ndash;12 letter words including
            technical vocabulary that tests both speed and word familiarity.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
