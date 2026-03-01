import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import CpsTest from "@/components/tools/CpsTest";
import { notFound } from "next/navigation";
import Link from "next/link";

const tool = getToolBySlug("cps-test")!;

export async function generateMetadata(): Promise<Metadata> {
  if (!tool) return {};
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
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
    alternates: {
      canonical: `https://clevr.tools${tool.route}`,
    },
  };
}

export default function CpsTestPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <CpsTest />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Average Clicks Per Second</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Rating</th>
                  <th className="text-left p-2 font-medium">CPS</th>
                  <th className="text-left p-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Beginner", "1\u20133", "Casual, relaxed clicking"],
                  ["Below Average", "3\u20135", "Normal mouse usage speed"],
                  ["Average", "5\u20137", "Standard for most people"],
                  ["Fast", "7\u20139", "Good for casual gaming"],
                  ["Very Fast", "9\u201311", "Competitive gaming level"],
                  ["Pro", "11\u201313", "Advanced techniques (jitter/butterfly clicking)"],
                  ["Extreme", "13\u201315", "Elite-level click speed"],
                  ["Inhuman", "15+", "Requires specialized techniques or hardware"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    {row.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Clicking Techniques</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Regular clicking</strong>: Standard index finger clicking. Most people max out at 6&ndash;8 CPS.</li>
            <li><strong className="text-foreground">Jitter clicking</strong>: Tensing your arm and vibrating your finger on the mouse button. Can reach 10&ndash;14 CPS. Strains your hand over time.</li>
            <li><strong className="text-foreground">Butterfly clicking</strong>: Alternating two fingers rapidly on the mouse button. Can reach 15&ndash;25 CPS. Some games consider this an unfair advantage.</li>
            <li><strong className="text-foreground">Drag clicking</strong>: Dragging your finger across the mouse button to register multiple clicks per swipe. Can register 30+ CPS but requires a mouse with a grippy surface.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Why CPS Matters for Gaming</h2>
          <p>Click speed affects performance in games like Minecraft PvP, competitive shooters (semi-auto weapons), and strategy games. A higher CPS means faster block placement, faster weapon fire rate, and quicker interactions. However, accuracy matters more than raw speed in most gaming scenarios.</p>
          <p className="mt-2">Test your overall typing speed with our <Link href="/type/wpm-test" className="text-primary underline hover:no-underline">WPM Test</Link> or check your reflexes with the <Link href="/type/reaction-time" className="text-primary underline hover:no-underline">Reaction Time Test</Link>.</p>
        </section>
      </div>
    </ToolLayout>
  );
}
