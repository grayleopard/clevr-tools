import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "miles-to-km")!;
const faqItems = getToolFaqs("miles-to-km");

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
      <UnitConverterPage configKey="length" defaultFrom="mi" defaultTo="km" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Miles to Kilometers</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> km = miles &times; 1.60934
          </p>
          <p className="mt-2">
            For a quick estimate, multiply by 1.6. So 10 miles &times; 1.6 = 16 km.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Miles</th>
                  <th className="text-left p-2 font-medium">Kilometers</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, 1.61], [2, 3.22], [3, 4.83], [5, 8.05], [10, 16.09],
                  [15, 24.14], [20, 32.19], [25, 40.23], [26.2, 42.16], [30, 48.28],
                  [40, 64.37], [50, 80.47], [60, 96.56], [70, 112.65], [80, 128.75],
                  [90, 144.84], [100, 160.93],
                ].map(([mi, km], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{mi} mi</td>
                    <td className="p-2">{km.toFixed(2)} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Running races:</strong> 5K = 3.1 miles, 10K = 6.21 miles, half marathon = 13.1 miles
            (21.1 km), marathon = 26.2 miles (42.2 km). The 26.2-mile marathon distance is highlighted
            in the table above.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">International driving:</strong> Speed limit signs outside the US are in km/h. If you see a
            100 km/h sign, that&apos;s about 62 mph. GPS devices may display distance in either unit
            depending on region settings.
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
