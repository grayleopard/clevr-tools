import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import { convertDataSize, formatExactDataSizeValue } from "@/lib/data-size";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-data")!;
const faqItems = getToolFaqs("convert-data");
const commonConversions = [
  { amount: 4.7, from: "GB", to: "MB" },
  { amount: 4000, from: "MB", to: "GB" },
  { amount: 1, from: "GiB", to: "GB" },
] as const;

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
          <h2 className="text-lg font-semibold text-foreground mb-3">Common MB and GB conversions</h2>
          <p className="mb-4">
            These answers use decimal units for MB and GB. GiB is a binary unit,
            so its value in GB is different.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">From</th>
                  <th className="text-left p-2 font-medium">Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {commonConversions.map(({ amount, from, to }) => (
                  <tr key={`${amount}-${from}-${to}`} className="even:bg-muted/30">
                    <td className="p-2">{formatExactDataSizeValue(amount)} {from}</td>
                    <td className="p-2 font-semibold text-foreground">
                      {formatExactDataSizeValue(convertDataSize(amount, from, to))} {to}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            For internet speed conversions, try our{" "}
            <Link href="/calc/convert/mbps-to-gbps" className="text-primary underline hover:no-underline">Mbps to Gbps converter</Link>.
          </p>
          <p className="mt-3">
            Converting MB to GB changes how a size is expressed; it does not make
            the file smaller. To meet an upload limit, follow the{" "}
            <Link href="/blog/reduce-image-file-size" className="text-primary underline hover:no-underline">image file-size budget workflow</Link>{" "}
            or use the{" "}
            <Link href="/compress/image" className="text-primary underline hover:no-underline">Image Compressor</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
