import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-pressure")!;
const faqItems = getToolFaqs("convert-pressure");

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
      <UnitConverterPage configKey="pressure" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Pressure Unit Reference</h2>
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
                  ["1 atmosphere (atm)", "101.325 kPa / 14.696 psi / 760 mmHg / 1.01325 bar"],
                  ["1 bar", "100 kPa / 14.504 psi"],
                  ["1 psi", "6.895 kPa / 0.06895 bar"],
                  ["1 kPa", "0.145 psi / 0.01 bar"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Where Each Pressure Unit Is Used</h2>
          <p>
            <strong className="text-foreground">Tire pressure:</strong> PSI in the US, bar in Europe and most other countries. A typical
            car tire runs at 32&ndash;35 psi (2.2&ndash;2.4 bar).
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Weather:</strong> Barometric pressure is measured in millibars (mb) or hectopascals (hPa) &mdash;
            these are numerically identical. Standard atmospheric pressure is 1,013.25 mb.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Medical:</strong> Blood pressure is measured in mmHg (millimeters of mercury). Normal is
            around 120/80 mmHg.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Industrial:</strong> Systems use kPa, bar, or PSI depending on the region and industry
            standards.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
