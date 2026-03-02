import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-weight")!;
const faqItems = getToolFaqs("convert-weight");

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
      <UnitConverterPage configKey="weight" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Weight Conversion Reference</h2>
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
                  ["1 pound (lb)", "0.4536 kg"],
                  ["1 kilogram (kg)", "2.205 lbs"],
                  ["1 ounce (oz)", "28.35 g"],
                  ["1 stone", "14 lbs / 6.35 kg"],
                  ["1 metric ton", "2,205 lbs / 1,000 kg"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Common Weight Conversion Uses</h2>
          <p>
            Weight conversions are essential in the kitchen &mdash; US recipes use ounces and pounds while
            international recipes use grams and kilograms. For best baking accuracy, weighing ingredients
            in grams beats measuring by volume every time.
          </p>
          <p className="mt-3">
            Body weight tracking often requires converting between pounds and kilograms, especially when
            using fitness apps or medical references that default to one system. International shipping
            carriers charge by kilogram, so knowing your package weight in kg is critical for estimating
            costs. At the gym, weight plates are labeled in either pounds or kilograms depending on the
            equipment manufacturer.
          </p>
          <p className="mt-3">
            For specific conversions, try:{" "}
            <Link href="/calc/convert/kg-to-lbs" className="text-primary underline hover:no-underline">KG to Pounds</Link>,{" "}
            <Link href="/calc/convert/oz-to-grams" className="text-primary underline hover:no-underline">Ounces to Grams</Link>, or{" "}
            <Link href="/calc/convert/lbs-to-kg" className="text-primary underline hover:no-underline">Pounds to KG</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
