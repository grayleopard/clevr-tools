import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import Link from "next/link";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "mm-to-inches")!;
const faqItems = getToolFaqs("mm-to-inches");

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
      <UnitConverterPage configKey="length" defaultFrom="mm" defaultTo="in" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Millimeters to Inches</h2>
          <p>
            <strong className="text-foreground">Formula:</strong> inches = mm &times; 0.03937 (or mm &divide; 25.4)
          </p>
          <p className="mt-2">
            Since 1 inch = 25.4 mm exactly, dividing by 25.4 gives the precise conversion.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Millimeters</th>
                  <th className="text-left p-2 font-medium">Inches (decimal)</th>
                  <th className="text-left p-2 font-medium">Approx. Fraction</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, "0.039", "~1/25"], [2, "0.079", "~5/64"], [3, "0.118", "~1/8"],
                  [4, "0.157", "~5/32"], [5, "0.197", "~13/64"], [6, "0.236", "~15/64"],
                  [7, "0.276", "~9/32"], [8, "0.315", "~5/16"], [9, "0.354", "~23/64"],
                  [10, "0.394", "~25/64"], [11, "0.433", "~7/16"], [12, "0.472", "~15/32"],
                  [13, "0.512", "~1/2"], [14, "0.551", "~35/64"], [15, "0.591", "~19/32"],
                  [16, "0.630", "~5/8"], [17, "0.669", "~43/64"], [18, "0.709", "~45/64"],
                  [19, "0.748", "~3/4"], [20, "0.787", "~25/32"], [21, "0.827", "~53/64"],
                  [22, "0.866", "~7/8"], [23, "0.906", "~29/32"], [24, "0.945", "~15/16"],
                  [25, "0.984", "~1"], [30, "1.181", "~1 3/16"], [40, "1.575", "~1 37/64"],
                  [50, "1.969", "~2"], [75, "2.953", "~3"], [100, "3.937", "~4"],
                ].map(([mm, dec, frac], i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{mm} mm</td>
                    <td className="p-2">{dec}&quot;</td>
                    <td className="p-2">{frac}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When You Need This Conversion</h2>
          <p>
            <strong className="text-foreground">Engineering and machining:</strong> Technical drawings often specify tolerances in
            millimeters. Converting to inches is necessary when using imperial measurement tools.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Jewelry:</strong> Ring band widths and gemstone sizes are typically specified in
            millimeters. A 6mm ring band is about 1/4 inch wide.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">3D printing:</strong> Layer heights and nozzle diameters are in millimeters (0.2 mm layer
            height = 0.008 inches). Wrench and socket sizes also frequently cross between mm and inches.
          </p>
          <p className="mt-3">
            For all length conversions, see our{" "}
            <Link href="/calc/convert/length" className="text-primary underline hover:no-underline">Length Converter</Link>.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
