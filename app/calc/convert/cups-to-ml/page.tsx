import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "cups-to-ml")!;
const faqItems = getToolFaqs("cups-to-ml");

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
};

export default function Page() {
  return (
    <ToolLayout tool={tool}>
      <UnitConverterPage configKey="cooking" defaultFrom="cup" defaultTo="ml" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Cups to Milliliters</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> ml = cups &times; 236.588
          </p>
          <p className="mt-2">
            Important: The US cup (236.588 ml) and the UK/Australian metric cup (250 ml) are different.
            When following international recipes, check which cup standard is being used &mdash; the
            difference can matter in baking.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Cups (US)</th>
                  <th className="text-left p-2 font-medium">Milliliters</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1/8 cup", "29.6"],
                  ["1/4 cup", "59.1"],
                  ["1/3 cup", "78.9"],
                  ["1/2 cup", "118.3"],
                  ["2/3 cup", "157.7"],
                  ["3/4 cup", "177.4"],
                  ["1 cup", "236.6"],
                  ["1 1/4 cups", "295.7"],
                  ["1 1/2 cups", "354.9"],
                  ["2 cups", "473.2"],
                  ["3 cups", "709.8"],
                  ["4 cups (1 quart)", "946.4"],
                ].map(([cups, ml], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{cups}</td>
                    <td className="p-2">{ml} ml</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Baking:</strong> US recipes use cups while most international recipes use milliliters or
            grams. For dry ingredients, measuring by weight (grams) is more accurate than by volume,
            but for liquids, ml works perfectly.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Coffee makers:</strong> Many coffee machines are rated in cups, but the &quot;cup&quot;
            measurement on a coffee maker is often only 5&ndash;6 oz (148&ndash;177 ml), not a standard
            8 oz (237 ml) US cup. Check your machine&apos;s manual.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Cocktails:</strong> Bar recipes may use either cups or ml depending on the source.
          </p>
          <p className="mt-3">
            For more kitchen conversions, see our{" "}
            <Link href="/calc/convert/cooking" className="text-primary underline hover:no-underline">Cooking Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
