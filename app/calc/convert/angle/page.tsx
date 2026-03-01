import ToolLayout from "@/components/tool/ToolLayout";
import UnitConverterPage from "@/components/tools/UnitConverterPage";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "convert-angle")!;

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
      <UnitConverterPage configKey="angle" />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Angle Unit Reference</h2>
          <p>
            <strong className="text-foreground">Degrees:</strong> 360&deg; in a full circle &mdash; the most familiar system.{" "}
            <strong className="text-foreground">Radians:</strong> 2&pi; in a full circle &mdash; used in math and programming.{" "}
            <strong className="text-foreground">Gradians:</strong> 400 in a full circle &mdash; used in surveying.
          </p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Degrees</th>
                  <th className="text-left p-2 font-medium">Radians</th>
                  <th className="text-left p-2 font-medium">Gradians</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["30°", "π/6", "33.33"],
                  ["45°", "π/4", "50"],
                  ["90°", "π/2", "100"],
                  ["180°", "π", "200"],
                  ["360°", "2π", "400"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                    <td className="p-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">When Radians Matter</h2>
          <p>
            Trigonometric functions in most programming languages &mdash; including JavaScript, Python,
            C, and Java &mdash; expect angles in radians, not degrees. If you pass degrees to{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">Math.sin()</code>, you&apos;ll get
            wrong results.
          </p>
          <p className="mt-3">
            To convert degrees to radians in code, multiply by &pi;/180:
          </p>
          <pre className="mt-2 bg-muted rounded-lg p-3 text-xs overflow-x-auto">
            <code>Math.sin(angle * Math.PI / 180)</code>
          </pre>
          <p className="mt-3">
            This is one of the most common bugs in geometry and physics calculations. Always check whether
            your library or language expects radians or degrees before plugging in values.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
