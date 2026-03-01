import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-frequency")!;

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
      <UnitConverterPage configKey="frequency" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Frequency Units Explained</h2>
          <p>
            Hertz (Hz) measures cycles per second. It&apos;s the fundamental unit of frequency. Larger
            units are simply multiples: kHz = 1,000 Hz, MHz = 1,000,000 Hz, GHz = 1,000,000,000 Hz.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Frequency Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Source</th>
                  <th className="text-left p-2 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Human hearing range", "20 Hz - 20 kHz"],
                  ["Middle A (musical note)", "440 Hz"],
                  ["AM radio", "530 - 1,700 kHz"],
                  ["FM radio", "87.5 - 108 MHz"],
                  ["WiFi (2.4 GHz band)", "2.4 GHz"],
                  ["WiFi (5 GHz band)", "5 GHz"],
                  ["Microwave ovens", "2.45 GHz"],
                  ["Modern CPUs", "3 - 5 GHz"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Your WiFi router and microwave oven operate at nearly the same frequency (2.4&ndash;2.45
            GHz), which is why a running microwave can sometimes interfere with WiFi signals on the
            2.4 GHz band. The 5 GHz WiFi band avoids this interference but has shorter range.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
