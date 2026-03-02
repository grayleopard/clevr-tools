import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "cm-to-inches")!;
const faqItems = getToolFaqs("cm-to-inches");

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
      <UnitConverterPage configKey="length" defaultFrom="cm" defaultTo="in" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert CM to Inches</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> inches = cm &divide; 2.54
          </p>
          <p className="mt-2">
            The relationship is exact by international standard (defined since 1959): 1 inch = 2.54
            centimeters, precisely. So 10 cm &divide; 2.54 = 3.937 inches.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Centimeters</th>
                  <th className="text-left p-2 font-medium">Inches</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [5, 1.97], [10, 3.94], [15, 5.91], [20, 7.87], [25, 9.84],
                  [30, 11.81], [35, 13.78], [40, 15.75], [45, 17.72], [50, 19.69],
                  [55, 21.65], [60, 23.62], [65, 25.59], [70, 27.56], [75, 29.53],
                  [80, 31.50], [85, 33.46], [90, 35.43], [95, 37.40], [100, 39.37],
                  [110, 43.31], [120, 47.24], [150, 59.06], [180, 70.87], [200, 78.74],
                ].map(([cm, inches], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{cm} cm</td>
                    <td className="p-2">{inches.toFixed(2)} in</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            Monitor and TV screen sizes are measured diagonally in inches worldwide, but product
            specifications often list dimensions in centimeters. Height conversion is another common
            use &mdash; 183 cm = 72 inches = 6&apos;0&quot;.
          </p>
          <p className="mt-3">
            International clothing sizes frequently use centimeters for measurements like waist, chest,
            and inseam, while US sizes reference inches. When shopping online from international
            retailers, converting between cm and inches helps ensure the right fit.
          </p>
          <p className="mt-3">
            For more length conversions, see our{" "}
            <Link href="/calc/convert/length" className="text-primary underline hover:no-underline">Length Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
