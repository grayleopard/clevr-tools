import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "kg-to-lbs")!;

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
      <UnitConverterPage configKey="weight" defaultFrom="kg" defaultTo="lb" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert KG to Pounds</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> lbs = kg &times; 2.2046
          </p>
          <p className="mt-2">
            For a quick mental estimate, multiply by 2.2. So 70 kg &times; 2.2 = 154 lbs.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Kilograms</th>
                  <th className="text-left p-2 font-medium">Pounds</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [5, 11.02], [10, 22.05], [15, 33.07], [20, 44.09], [25, 55.12],
                  [30, 66.14], [35, 77.16], [40, 88.18], [45, 99.21], [50, 110.23],
                  [55, 121.25], [60, 132.28], [65, 143.30], [70, 154.32], [75, 165.35],
                  [80, 176.37], [85, 187.39], [90, 198.42], [95, 209.44], [100, 220.46],
                  [110, 242.51], [120, 264.55], [150, 330.69],
                ].map(([kg, lbs], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{kg} kg</td>
                    <td className="p-2">{lbs.toFixed(2)} lbs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Body weight:</strong> 50 kg = 110 lbs, 70 kg = 154 lbs, 100 kg = 220 lbs. Medical
            references and international fitness apps often default to kilograms.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Shipping and luggage:</strong> Typical airline checked bag limit is 23 kg (about 50 lbs).
            Overweight fees kick in above that, making this conversion essential for travelers.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Gym weights:</strong> A standard 20 kg plate equals about 44 lbs. If you train at gyms
            with metric equipment, knowing the conversion helps you track progress accurately.
          </p>
          <p className="mt-3">
            For the reverse conversion, see{" "}
            <Link href="/calc/convert/lbs-to-kg" className="text-primary underline hover:no-underline">Pounds to KG</Link>. For
            all weight conversions, visit our{" "}
            <Link href="/calc/convert/weight" className="text-primary underline hover:no-underline">Weight Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
