import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "mbps-to-gbps")!;
const faqItems = getToolFaqs("mbps-to-gbps");

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
      <UnitConverterPage configKey="data" defaultFrom="Mbit" defaultTo="Gbit" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Mbps to Gbps</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> Gbps = Mbps &divide; 1,000
          </p>
          <p className="mt-2">
            1 Gbps = 1,000 Mbps. Network speeds use decimal (base-10) prefixes, unlike data storage
            which uses binary (base-2).
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Mbps</th>
                  <th className="text-left p-2 font-medium">Gbps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, "0.001"], [5, "0.005"], [10, "0.01"], [25, "0.025"], [50, "0.05"],
                  [100, "0.1"], [200, "0.2"], [300, "0.3"], [400, "0.4"], [500, "0.5"],
                  [600, "0.6"], [700, "0.7"], [800, "0.8"], [900, "0.9"],
                  [1000, "1 Gbps"], [2000, "2 Gbps"], [2500, "2.5 Gbps"],
                  [5000, "5 Gbps"], [10000, "10 Gbps"],
                ].map(([mbps, gbps], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{typeof mbps === "number" ? mbps.toLocaleString() : mbps} Mbps</td>
                    <td className="p-2">{gbps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Internet plans:</strong> Basic broadband starts at 25 Mbps. The average US home connection
            is around 100 Mbps. Gigabit fiber delivers 1,000 Mbps (1 Gbps). ISPs market speeds in
            Mbps or Gbps depending on what sounds more impressive.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Streaming requirements:</strong> 4K Netflix needs about 25 Mbps. 8K streaming requires
            roughly 100 Mbps. Multiple simultaneous streams multiply these requirements.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Network infrastructure:</strong> Data center links operate at 10&ndash;100 Gbps.
            Enterprise switches commonly support 1 Gbps, 10 Gbps, or 25 Gbps per port.
          </p>
          <p className="mt-3">
            For all data unit conversions, see our{" "}
            <Link href="/calc/convert/data" className="text-primary underline hover:no-underline">Data Storage Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
