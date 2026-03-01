import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-data")!;

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
      <UnitConverterPage configKey="data" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Data Storage Units Explained</h2>
          <p>
            The bit is the smallest unit of digital data. Eight bits make one byte. From there, each
            step up is a factor of 1,024 in binary (the way computers actually count), though storage
            manufacturers often use factors of 1,000 for marketing.
          </p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Unit</th>
                  <th className="text-left p-2 font-medium">Binary (IEC)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 Kilobyte (KB)", "1,024 bytes"],
                  ["1 Megabyte (MB)", "1,024 KB"],
                  ["1 Gigabyte (GB)", "1,024 MB"],
                  ["1 Terabyte (TB)", "1,024 GB"],
                  ["1 Petabyte (PB)", "1,024 TB"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs">
            Hard drive manufacturers use decimal (1,000-based) units, which is why a &quot;1 TB&quot; drive shows
            up as about 931 GB in your operating system (which uses binary 1,024-based units).
          </p>
        </section>
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
