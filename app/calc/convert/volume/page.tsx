import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-volume")!;

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
      <UnitConverterPage configKey="volume" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Volume Conversion Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">From</th>
                  <th className="text-left p-2 font-medium">To</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 US gallon", "3.785 liters"],
                  ["1 cup", "236.6 ml"],
                  ["1 fluid ounce", "29.57 ml"],
                  ["1 quart", "946.4 ml"],
                  ["1 pint", "473.2 ml"],
                  ["1 tablespoon", "14.79 ml"],
                  ["1 teaspoon", "4.929 ml"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">US Customary vs Metric Volume</h2>
          <p>
            US recipes typically use cups, tablespoons, and teaspoons for volume measurements, while
            metric recipes use milliliters and liters. This difference is the most common source of
            recipe conversion headaches.
          </p>
          <p className="mt-3">
            International recipes often use weight (grams) for dry ingredients rather than volume
            measurements &mdash; this is significantly more accurate for baking. A cup of flour can vary
            by 20&ndash;30% in weight depending on how it&apos;s scooped, but 120 grams of flour is always
            120 grams.
          </p>
          <p className="mt-3">
            For kitchen-specific conversions, try our{" "}
            <Link href="/calc/convert/liters-to-gallons" className="text-primary underline hover:no-underline">Liters to Gallons</Link>,{" "}
            <Link href="/calc/convert/cups-to-ml" className="text-primary underline hover:no-underline">Cups to ML</Link>, or{" "}
            <Link href="/calc/convert/cooking" className="text-primary underline hover:no-underline">Cooking Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
