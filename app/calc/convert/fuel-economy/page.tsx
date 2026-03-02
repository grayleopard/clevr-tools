import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-fuel-economy")!;
const faqItems = getToolFaqs("convert-fuel-economy");

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
      <UnitConverterPage configKey="fuel-economy" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Understanding Fuel Economy Units</h2>
          <p>
            The US uses miles per gallon (mpg) &mdash; higher is better. Most other countries use liters
            per 100 kilometers (L/100km) &mdash; lower is better. These two metrics are inversely related:
          </p>
          <p className="mt-2 font-mono text-xs">
            mpg = 235.214 &divide; (L/100km)
          </p>
          <p className="mt-2">
            For example, a car rated at 30 mpg uses about 7.84 L/100km.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Fuel Economy Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Vehicle Type</th>
                  <th className="text-left p-2 font-medium">MPG</th>
                  <th className="text-left p-2 font-medium">L/100km</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Average US car", "~25", "~9.4"],
                  ["Hybrid", "~50", "~4.7"],
                  ["SUV", "~20", "~11.8"],
                  ["EV equivalent", "100+ MPGe", "N/A"],
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
            Fuel economy drops significantly at highway speeds above 55 mph. Each 5 mph increase over
            50 mph is roughly equivalent to paying an additional $0.15&ndash;$0.30 per gallon for gas,
            according to the US Department of Energy. Aggressive driving (rapid acceleration and braking)
            can reduce fuel economy by 15&ndash;30% at highway speeds.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
