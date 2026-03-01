import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-length")!;

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
      <UnitConverterPage configKey="length" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Length Conversion Reference</h2>
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
                  ["1 inch", "2.54 cm"],
                  ["1 foot", "30.48 cm"],
                  ["1 yard", "91.44 cm"],
                  ["1 mile", "1.609 km"],
                  ["1 meter", "3.281 feet"],
                  ["1 kilometer", "0.621 miles"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need Length Conversions</h2>
          <p>
            Length conversions come up constantly in daily life. International travel means switching
            between miles and kilometers for driving distances and speed limits. Construction and DIY
            home improvement projects often require converting between metric and imperial measurements,
            especially when following plans or tutorials from different countries.
          </p>
          <p className="mt-3">
            Shipping carriers typically require package dimensions in centimeters, even in the US.
            Clothing sizes vary internationally &mdash; European sizes use centimeters while US sizes
            use inches. Whether you&apos;re measuring a room, sizing furniture, or comparing heights,
            having quick access to accurate length conversions saves time and prevents costly mistakes.
          </p>
          <p className="mt-3">
            For specific conversions, try our dedicated tools:{" "}
            <Link href="/calc/convert/cm-to-inches" className="text-primary underline hover:no-underline">CM to Inches</Link>,{" "}
            <Link href="/calc/convert/feet-to-meters" className="text-primary underline hover:no-underline">Feet to Meters</Link>, or{" "}
            <Link href="/calc/convert/miles-to-km" className="text-primary underline hover:no-underline">Miles to Kilometers</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
