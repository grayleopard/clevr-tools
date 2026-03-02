import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-time")!;
const faqItems = getToolFaqs("convert-time");

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: `https://clevr.tools${tool.route}` },
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
};

export default function Page() {
  return (
    <ToolLayout tool={tool}>
      <UnitConverterPage configKey="time" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Time Conversion Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Unit</th>
                  <th className="text-left p-2 font-medium">Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 minute", "60 seconds"],
                  ["1 hour", "3,600 seconds"],
                  ["1 day", "86,400 seconds / 24 hours"],
                  ["1 week", "604,800 seconds / 168 hours"],
                  ["1 year", "8,760 hours / 525,600 minutes / 31,536,000 seconds"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Fun Time Facts</h2>
          <p>
            A billion seconds is about 31.7 years. A million seconds is about 11.6 days. That
            difference illustrates just how much larger a billion is compared to a million &mdash; it&apos;s
            not even close.
          </p>
          <p className="mt-3">
            Light takes 8 minutes and 20 seconds to travel from the Sun to Earth. The universe is about
            13.8 billion years old &mdash; roughly 4.35 &times; 10&sup1;&sup7; seconds. And the famous
            song lyric is accurate: there really are 525,600 minutes in a year (assuming a non-leap year
            of exactly 365 days).
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
