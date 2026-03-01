import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-energy")!;

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
      <UnitConverterPage configKey="energy" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Energy Conversion Reference</h2>
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
                  ["1 kilowatt-hour (kWh)", "3,600,000 J / 3,412 BTU"],
                  ["1 calorie (cal)", "4.184 joules"],
                  ["1 food Calorie (kcal)", "4,184 J / 1,000 calories"],
                  ["1 BTU", "1,055 joules"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Calories vs Kilocalories</h2>
          <p>
            When food packaging says &quot;200 Calories,&quot; it actually means 200 kilocalories (kcal) &mdash;
            not the scientific calorie used in chemistry. The food Calorie (with a capital C) equals
            1 kcal, which equals 1,000 small calories. This naming convention causes endless confusion.
          </p>
          <p className="mt-3">
            In scientific contexts, use joules (J) or kilojoules (kJ) for energy to avoid ambiguity.
            A food Calorie is about 4.184 kJ. Your daily energy intake of 2,000 food Calories is
            roughly 8,368 kJ.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
