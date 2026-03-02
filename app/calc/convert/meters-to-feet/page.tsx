import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "meters-to-feet")!;
const faqItems = getToolFaqs("meters-to-feet");

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
      <UnitConverterPage configKey="length" defaultFrom="m" defaultTo="ft" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Meters to Feet</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> feet = meters &times; 3.28084
          </p>
          <p className="mt-2">
            For a quick mental shortcut, multiply by 3.3. So 10 meters &times; 3.3 = about 33 feet.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Meters</th>
                  <th className="text-left p-2 font-medium">Feet</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, 3.28], [2, 6.56], [3, 9.84], [4, 13.12], [5, 16.40],
                  [6, 19.69], [7, 22.97], [8, 26.25], [9, 29.53], [10, 32.81],
                  [11, 36.09], [12, 39.37], [13, 42.65], [14, 45.93], [15, 49.21],
                  [16, 52.49], [17, 55.77], [18, 59.06], [19, 62.34], [20, 65.62],
                  [21, 68.90], [22, 72.18], [23, 75.46], [24, 78.74], [25, 82.02],
                  [26, 85.30], [27, 88.58], [28, 91.86], [29, 95.14], [30, 98.43],
                ].map(([m, ft], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{m} m</td>
                    <td className="p-2">{ft.toFixed(2)} ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">International real estate:</strong> An apartment listed at 85 m&sup2; is about 915 sq ft.
            Understanding the meters-to-feet relationship helps evaluate property sizes across countries.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Sports:</strong> The 100-meter sprint is 328 feet. A soccer field is 105 meters
            (344 feet) long. Swimming pools are 25 or 50 meters.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Building heights and diving:</strong> Elevation, building floors, and scuba diving
            depths are frequently given in meters internationally.
          </p>
          <p className="mt-3">
            For the reverse conversion, see{" "}
            <Link href="/calc/convert/feet-to-meters" className="text-primary underline hover:no-underline">Feet to Meters</Link>. For
            all length conversions, visit our{" "}
            <Link href="/calc/convert/length" className="text-primary underline hover:no-underline">Length Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
