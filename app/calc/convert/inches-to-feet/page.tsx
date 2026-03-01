import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "inches-to-feet")!;

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
      <UnitConverterPage configKey="length" defaultFrom="in" defaultTo="ft" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Inches to Feet</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> feet = inches &divide; 12
          </p>
          <p className="mt-2">
            1 foot = 12 inches exactly. So 68 inches &divide; 12 = 5 feet 8 inches (5&apos;8&quot;).
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Inches</th>
                  <th className="text-left p-2 font-medium">Feet</th>
                  <th className="text-left p-2 font-medium">Feet &amp; Inches</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [12, "1.00", "1' 0\""], [18, "1.50", "1' 6\""], [24, "2.00", "2' 0\""],
                  [30, "2.50", "2' 6\""], [36, "3.00", "3' 0\""], [42, "3.50", "3' 6\""],
                  [48, "4.00", "4' 0\""], [54, "4.50", "4' 6\""], [60, "5.00", "5' 0\""],
                  [62, "5.17", "5' 2\""], [64, "5.33", "5' 4\""], [66, "5.50", "5' 6\""],
                  [68, "5.67", "5' 8\""], [70, "5.83", "5' 10\""], [72, "6.00", "6' 0\""],
                ].map(([inches, feet, display], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{inches} in</td>
                    <td className="p-2">{feet} ft</td>
                    <td className="p-2">{display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Height:</strong> This is the most common use in the US. Medical records and driver&apos;s
            licenses list height in feet and inches, but many measurement tools give results in total
            inches. 68 inches = 5&apos;8&quot;, one of the most common heights.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">TV and monitor sizes:</strong> Screen sizes are given in diagonal inches. Knowing the
            conversion helps when comparing to room dimensions measured in feet.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Lumber and construction:</strong> Board lengths are often specified in feet, but detailed
            measurements use inches. Window and door openings are typically given in inches.
          </p>
          <p className="mt-3">
            For all length conversions, see our{" "}
            <Link href="/calc/convert/length" className="text-primary underline hover:no-underline">Length Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
