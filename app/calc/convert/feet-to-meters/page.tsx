import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "feet-to-meters")!;
const faqItems = getToolFaqs("feet-to-meters");

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
      <UnitConverterPage configKey="length" defaultFrom="ft" defaultTo="m" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Feet to Meters</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> meters = feet &times; 0.3048
          </p>
          <p className="mt-2">
            The conversion factor is exact: 1 foot = 0.3048 meters by definition. So 6 feet &times;
            0.3048 = 1.8288 meters.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Feet</th>
                  <th className="text-left p-2 font-medium">Meters</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, 0.30], [2, 0.61], [3, 0.91], [4, 1.22], [5, 1.52],
                  [6, 1.83], [7, 2.13], [8, 2.44], [9, 2.74], [10, 3.05],
                  [11, 3.35], [12, 3.66], [13, 3.96], [14, 4.27], [15, 4.57],
                  [16, 4.88], [17, 5.18], [18, 5.49], [19, 5.79], [20, 6.10],
                  [25, 7.62], [30, 9.14], [40, 12.19], [50, 15.24],
                ].map(([ft, m], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{ft} ft</td>
                    <td className="p-2">{m.toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Room dimensions:</strong> Standard US ceiling height is 8 feet (2.44 m). When buying
            furniture internationally or following metric building plans, knowing the conversion is essential.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Height:</strong> 6 feet = 1.83 meters. International forms, passports, and medical records
            often require height in meters or centimeters.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Swimming pools:</strong> A standard pool is 25 meters (82 feet), while an Olympic pool is
            50 meters (164 feet).
          </p>
          <p className="mt-3">
            For the reverse conversion, see{" "}
            <Link href="/calc/convert/meters-to-feet" className="text-primary underline hover:no-underline">Meters to Feet</Link>. For
            all length conversions, visit our{" "}
            <Link href="/calc/convert/length" className="text-primary underline hover:no-underline">Length Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
