import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-area")!;

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
      <UnitConverterPage configKey="area" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Area Conversion Reference</h2>
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
                  ["1 acre", "43,560 sq ft / 4,047 sq m"],
                  ["1 hectare", "2.471 acres / 10,000 sq m"],
                  ["1 sq mile", "640 acres / 259 hectares"],
                  ["1 sq kilometer", "100 hectares / 247.1 acres"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Common Area Measurement Uses</h2>
          <p>
            In real estate, the US uses square feet for property listings while most other countries
            use square meters. If you&apos;re browsing international property listings, knowing how to
            convert between the two is essential for comparing sizes.
          </p>
          <p className="mt-3">
            Farming and agriculture use acres in the US and hectares internationally. For a sense of
            scale: 1 acre is approximately the size of an American football field minus the end zones.
            City planning and zoning often deal in square miles or square kilometers.
          </p>
          <p className="mt-3">
            For land measurements, try our{" "}
            <Link href="/calc/convert/acres-to-sq-ft" className="text-primary underline hover:no-underline">Acres to Square Feet converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
