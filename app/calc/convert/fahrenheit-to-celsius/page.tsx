import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "fahrenheit-to-celsius")!;

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
      <UnitConverterPage configKey="temperature" defaultFrom="°F" defaultTo="°C" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Fahrenheit to Celsius</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> °C = (°F &minus; 32) &times; 5/9
          </p>
          <p className="mt-2">
            For example: 72°F &minus; 32 = 40, then 40 &times; 5/9 = 22.2°C.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">°F</th>
                  <th className="text-left p-2 font-medium">°C</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [-40, -40], [-30, -34.4], [-20, -28.9], [-10, -23.3], [0, -17.8],
                  [10, -12.2], [20, -6.7], [32, 0], [40, 4.4], [50, 10],
                  [60, 15.6], [70, 21.1], [80, 26.7], [90, 32.2], [98.6, 37],
                  [100, 37.8], [110, 43.3], [120, 48.9], [130, 54.4], [140, 60],
                  [150, 65.6], [160, 71.1], [170, 76.7], [180, 82.2], [190, 87.8],
                  [200, 93.3], [212, 100],
                ].map(([f, c], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{f}°F</td>
                    <td className="p-2">{typeof c === "number" && c % 1 !== 0 ? c.toFixed(1) : c}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Weather:</strong> 32°F is freezing (0°C). Most countries outside the US report
            temperatures in Celsius, so travelers need this conversion constantly.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Health:</strong> Normal body temperature is 98.6°F (37°C). A fever is generally
            considered anything above 100.4°F (38°C).
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Cooking:</strong> Oven temperatures in international recipes use Celsius. 350°F = 177°C
            (a common baking temperature), 425°F = 218°C (for roasting).
          </p>
          <p className="mt-3">
            For all temperature conversions, see our{" "}
            <Link href="/calc/convert/temperature" className="text-primary underline hover:no-underline">Temperature Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
