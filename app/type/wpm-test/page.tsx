import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import ToolLayout from "@/components/tool/ToolLayout";
import WpmTest from "@/components/tools/WpmTest";
import { notFound } from "next/navigation";
import Link from "next/link";

const tool = getToolBySlug("wpm-test")!;
const faqItems = getToolFaqs("wpm-test");

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

export default function WpmTestPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <WpmTest />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Average Typing Speed
          </h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Group</th>
                  <th className="text-left p-2 font-medium">Average WPM</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["General population", "40"],
                  ["Office workers", "50\u201360"],
                  ["Experienced typists", "65\u201375"],
                  ["Programmers", "60\u201380"],
                  ["Professional transcriptionists", "80\u2013100"],
                  ["Competitive typists", "120\u2013200+"],
                  ["World record (English)", "216"],
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
            How WPM Is Calculated
          </h2>
          <p>
            Industry standard: 1 word = 5 characters (including spaces). Gross
            WPM = (total characters typed &divide; 5) &divide; minutes elapsed.
            Net WPM = Gross WPM &minus; (errors &divide; minutes). This test
            uses Net WPM, which accounts for mistakes &mdash; a more accurate
            measure of effective typing speed.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Tips to Improve Your Typing Speed
          </h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Learn touch typing &mdash; home row (ASDF JKL;) and correct finger
              placement
            </li>
            <li>Focus on accuracy first; speed follows naturally</li>
            <li>
              Practice daily &mdash; even 10&ndash;15 minutes makes a measurable
              difference
            </li>
            <li>
              Use proper posture: feet flat, wrists level, elbows at 90&deg;
            </li>
            <li>
              Don&apos;t look at the keyboard &mdash; trust muscle memory
            </li>
          </ol>
          <p className="mt-3">
            Use our{" "}
            <Link
              href="/type/typing-practice"
              className="text-primary underline hover:no-underline"
            >
              Typing Practice
            </Link>{" "}
            tool for structured improvement with weak-key tracking.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
