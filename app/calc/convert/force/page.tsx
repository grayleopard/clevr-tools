import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-force")!;
const faqItems = getToolFaqs("convert-force");

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
      <UnitConverterPage configKey="force" />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Force Unit Reference</h2>
          <p>
            The newton (N) is the SI unit of force. It&apos;s defined as the force needed to accelerate
            1 kilogram at 1 meter per second squared.
          </p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">From</th>
                  <th className="text-left p-2 font-medium">To</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 kilogram-force (kgf)", "9.807 N"],
                  ["1 pound-force (lbf)", "4.448 N"],
                  ["1 kilonewton (kN)", "1,000 N / 224.8 lbf"],
                  ["1 dyne", "0.00001 N"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Common Forces in Everyday Life</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Scenario</th>
                  <th className="text-left p-2 font-medium">Force</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Gravity on 1 kg object", "9.81 N"],
                  ["Average handshake", "~90 - 100 N"],
                  ["Human bite force", "~700 N"],
                  ["Car weight (~1,500 kg)", "~14,700 N (14.7 kN)"],
                  ["Space Shuttle engines (total thrust)", "~30 million N"],
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
      </div>
    </ToolLayout>
  );
}
