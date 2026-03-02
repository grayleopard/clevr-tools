import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "lbs-to-kg")!;
const faqItems = getToolFaqs("lbs-to-kg");

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
      <UnitConverterPage configKey="weight" defaultFrom="lb" defaultTo="kg" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Pounds to Kilograms</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> kg = lbs &times; 0.453592
          </p>
          <p className="mt-2">
            For a quick estimate, divide by 2.2. So 150 lbs &divide; 2.2 = about 68 kg.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Pounds</th>
                  <th className="text-left p-2 font-medium">Kilograms</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [10, 4.54], [20, 9.07], [30, 13.61], [40, 18.14], [50, 22.68],
                  [60, 27.22], [70, 31.75], [80, 36.29], [90, 40.82], [100, 45.36],
                  [110, 49.90], [120, 54.43], [130, 58.97], [140, 63.50], [150, 68.04],
                  [160, 72.57], [170, 77.11], [180, 81.65], [190, 86.18], [200, 90.72],
                ].map(([lbs, kg], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{lbs} lbs</td>
                    <td className="p-2">{kg.toFixed(2)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Body weight:</strong> 150 lbs = 68 kg, 200 lbs = 91 kg. International medical records,
            fitness apps, and BMI charts often use kilograms.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Gym plates:</strong> A standard 45 lb plate equals about 20.4 kg. In gyms with metric
            equipment, the standard plate is 20 kg (44 lbs) &mdash; close but not identical.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Airline luggage:</strong> Most airlines set a 50 lb (22.7 kg) limit for checked bags.
            International carriers typically advertise this as 23 kg.
          </p>
          <p className="mt-3">
            For the reverse conversion, see{" "}
            <Link href="/calc/convert/kg-to-lbs" className="text-primary underline hover:no-underline">KG to Pounds</Link>. For
            all weight conversions, visit our{" "}
            <Link href="/calc/convert/weight" className="text-primary underline hover:no-underline">Weight Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
