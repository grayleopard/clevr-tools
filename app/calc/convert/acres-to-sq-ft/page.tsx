import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "acres-to-sq-ft")!;

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
      <UnitConverterPage configKey="area" defaultFrom="ac" defaultTo="ft²" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Acres to Square Feet</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> square feet = acres &times; 43,560
          </p>
          <p className="mt-2">
            Conversely: acres = square feet &divide; 43,560. This is an exact conversion factor.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Acres</th>
                  <th className="text-left p-2 font-medium">Square Feet</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1/4", "10,890"], ["1/2", "21,780"], ["1", "43,560"],
                  ["2", "87,120"], ["3", "130,680"], ["4", "174,240"],
                  ["5", "217,800"], ["10", "435,600"], ["20", "871,200"],
                  ["50", "2,178,000"], ["100", "4,356,000"],
                ].map(([acres, sqft], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{acres} acres</td>
                    <td className="p-2">{sqft} sq ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Real estate:</strong> US property lot sizes are often listed in acres. A standard
            suburban lot is roughly 1/4 acre (10,890 sq ft). Knowing the square footage helps
            visualize the actual usable space.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Farming and land purchase:</strong> Agricultural land is sold in acres. For scale
            reference: 1 acre is approximately 90% of an American football field. Including the end
            zones, a football field is about 1.32 acres. A typical city block is 2&ndash;5 acres,
            depending on the city.
          </p>
          <p className="mt-3">
            For all area conversions, see our{" "}
            <Link href="/calc/convert/area" className="text-primary underline hover:no-underline">Area Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
