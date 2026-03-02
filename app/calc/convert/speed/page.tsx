import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-speed")!;
const faqItems = getToolFaqs("convert-speed");

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
      <UnitConverterPage configKey="speed" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Speed Conversion Reference</h2>
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
                  ["1 mph", "1.609 km/h"],
                  ["1 km/h", "0.621 mph"],
                  ["1 knot", "1.151 mph / 1.852 km/h"],
                  ["1 m/s", "2.237 mph / 3.6 km/h"],
                  ["Speed of light", "299,792 km/s"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Speed in Everyday Context</h2>
          <p>
            Walking speed is roughly 3 mph (5 km/h). A casual cyclist moves at about 15 mph (24 km/h).
            Highway driving in the US is typically 60&ndash;70 mph (97&ndash;113 km/h). The speed of
            sound is 767 mph (1,235 km/h) &mdash; that&apos;s Mach 1.
          </p>
          <p className="mt-3">
            Runners often track their pace in minutes per mile or minutes per kilometer rather than
            speed. For race pacing and training calculations, use our{" "}
            <Link href="/calc/pace" className="text-primary underline hover:no-underline">Pace Calculator</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
