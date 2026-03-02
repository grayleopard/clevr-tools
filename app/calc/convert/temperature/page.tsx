import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-temperature")!;
const faqItems = getToolFaqs("convert-temperature");

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
      <UnitConverterPage configKey="temperature" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Temperature Conversion Formulas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Conversion</th>
                  <th className="text-left p-2 font-medium">Formula</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Fahrenheit to Celsius", "(°F − 32) × 5/9"],
                  ["Celsius to Fahrenheit", "(°C × 9/5) + 32"],
                  ["Celsius to Kelvin", "°C + 273.15"],
                  ["Kelvin to Celsius", "K − 273.15"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2 font-mono text-xs">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Temperature Quick Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-left p-2 font-medium">Celsius</th>
                  <th className="text-left p-2 font-medium">Fahrenheit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Freezing point of water", "0°C", "32°F"],
                  ["Refrigerator", "4°C", "39°F"],
                  ["Room temperature", "~21°C", "~70°F"],
                  ["Normal body temperature", "37°C", "98.6°F"],
                  ["Fever threshold", "38°C", "100.4°F"],
                  ["Boiling point of water", "100°C", "212°F"],
                  ["Oven (moderate)", "180°C", "356°F"],
                  ["The crossover point", "−40°C", "−40°F"],
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
          <p className="mt-3">
            A fun fact: &minus;40° is the unique crossover point where Fahrenheit and Celsius are
            exactly the same value. Below that, Fahrenheit readings are actually lower than Celsius.
          </p>
          <p className="mt-3">
            Need to convert Fahrenheit to Celsius specifically? Try our{" "}
            <Link href="/calc/convert/fahrenheit-to-celsius" className="text-primary underline hover:no-underline">Fahrenheit to Celsius converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
