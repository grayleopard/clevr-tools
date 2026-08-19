import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-data")!;
const faqItems = getToolFaqs("convert-data");

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: `https://www.clevr.tools${tool.route}` },
  openGraph: {
    type: "website",
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: `https://www.clevr.tools${tool.route}`,
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
      <UnitConverterPage configKey="data" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Practical File Size Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">File Type</th>
                  <th className="text-left p-2 font-medium">Typical Size</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Photo (JPEG)", "3 - 5 MB"],
                  ["Song (MP3)", "3 - 5 MB"],
                  ["Ebook", "1 - 5 MB"],
                  ["HD movie (1080p)", "4 - 5 GB"],
                  ["4K movie", "20 - 100 GB"],
                  ["1 hour of 4K video recording", "40 - 60 GB"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            For internet speed conversions, try our{" "}
            <Link href="/calc/convert/mbps-to-gbps" className="text-primary underline hover:no-underline">Mbps to Gbps converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
