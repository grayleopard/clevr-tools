import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "liters-to-gallons")!;

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
      <UnitConverterPage configKey="volume" defaultFrom="l" defaultTo="gal" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Liters to Gallons</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> US gallons = liters &times; 0.26417
          </p>
          <p className="mt-2">
            Note: The US gallon (3.785 liters) is smaller than the Imperial gallon (4.546 liters) used
            in the UK. This converter uses US gallons.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Liters</th>
                  <th className="text-left p-2 font-medium">US Gallons</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, 0.26], [2, 0.53], [3, 0.79], [4, 1.06], [5, 1.32],
                  [10, 2.64], [15, 3.96], [20, 5.28], [25, 6.60], [30, 7.93],
                  [40, 10.57], [50, 13.21],
                ].map(([l, gal], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{l} L</td>
                    <td className="p-2">{gal.toFixed(2)} gal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Fuel:</strong> A typical car gas tank holds 50&ndash;70 liters (13&ndash;18 US gallons).
            Gas prices outside the US are listed per liter, so converting to gallons helps compare costs.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Beverages:</strong> A standard 2-liter bottle equals about 0.53 gallons (roughly half a gallon).
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Aquariums and pools:</strong> Tank sizes are often listed in liters internationally but
            gallons in the US. Pool chemical dosing instructions may reference either unit.
          </p>
          <p className="mt-3">
            For all volume conversions, see our{" "}
            <Link href="/calc/convert/volume" className="text-primary underline hover:no-underline">Volume Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
