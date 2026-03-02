import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-cooking")!;
const faqItems = getToolFaqs("convert-cooking");

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
      <UnitConverterPage configKey="cooking" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Kitchen Measurement Conversions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Measurement</th>
                  <th className="text-left p-2 font-medium">Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 cup", "16 tablespoons / 48 teaspoons / 236.6 ml"],
                  ["1 tablespoon", "3 teaspoons / 14.79 ml"],
                  ["1 stick of butter", "8 tablespoons / 1/2 cup / 113 g"],
                  ["1 quart", "4 cups / 946.4 ml"],
                  ["1 gallon", "16 cups / 3,785 ml"],
                  ["1 pound of flour", "approx. 3 1/2 cups"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Tips for Accurate Kitchen Measuring</h2>
          <p>
            Dry and liquid measuring cups serve different purposes. Liquid measuring cups have a pour
            spout and are read at eye level at the meniscus. Dry measuring cups are designed to be
            leveled off at the top with a straight edge.
          </p>
          <p className="mt-3">
            For flour: spoon it into the cup and level with a knife. Don&apos;t scoop directly from the
            bag &mdash; scooping packs the flour and you&apos;ll end up with 20&ndash;30% more than the
            recipe intended. This is the number one cause of dense, dry baked goods.
          </p>
          <p className="mt-3">
            For the best baking accuracy, weigh your ingredients in grams using a kitchen scale. A cup
            of flour can vary from 100&ndash;160 g depending on technique, but 120 g on a scale is
            always 120 g.
          </p>
          <p className="mt-3">
            For more general volume conversions, see our{" "}
            <Link href="/calc/convert/volume" className="text-primary underline hover:no-underline">Volume Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
