import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "oz-to-grams")!;

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
      <UnitConverterPage configKey="weight" defaultFrom="oz" defaultTo="g" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Ounces to Grams</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> grams = ounces &times; 28.3495
          </p>
          <p className="mt-2">
            Note: this is the avoirdupois ounce used for everyday weights. The troy ounce (used for
            precious metals like gold and silver) is different: 1 troy oz = 31.1035 g.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Ounces</th>
                  <th className="text-left p-2 font-medium">Grams</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, 28.35], [2, 56.70], [3, 85.05], [4, 113.40], [5, 141.75],
                  [6, 170.10], [7, 198.45], [8, 226.80], [9, 255.15], [10, 283.50],
                  [11, 311.84], [12, 340.19], [13, 368.54], [14, 396.89], [15, 425.24],
                  [16, 453.59], [20, 566.99], [24, 680.39], [32, 907.18],
                ].map(([oz, g], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{oz} oz</td>
                    <td className="p-2">{g.toFixed(2)} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs">16 oz = 1 pound (453.59 g).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Cooking and baking:</strong> US recipes use ounces while international recipes use grams.
            Converting accurately matters especially in baking, where precision affects the outcome.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Postal and shipping:</strong> USPS pricing for letters and small packages is based on
            ounces. International shipping uses grams and kilograms.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Precious metals:</strong> When buying gold or silver, remember that prices are quoted per
            troy ounce (31.1 g), not the standard ounce (28.35 g).
          </p>
          <p className="mt-3">
            For all weight conversions, see our{" "}
            <Link href="/calc/convert/weight" className="text-primary underline hover:no-underline">Weight Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
