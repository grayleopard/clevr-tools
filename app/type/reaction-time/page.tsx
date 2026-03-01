import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import ReactionTime from "@/components/tools/ReactionTime";
import { notFound } from "next/navigation";
import Link from "next/link";

const tool = getToolBySlug("reaction-time")!;

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

export default function ReactionTimePage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <ReactionTime />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Average Human Reaction Time</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Rating</th>
                  <th className="text-left p-2 font-medium">Time (ms)</th>
                  <th className="text-left p-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Incredible", "< 150", "Top-tier reflexes, elite gaming level"],
                  ["Excellent", "150\u2013200", "Very fast, competitive advantage"],
                  ["Fast", "200\u2013250", "Above average, good for gaming"],
                  ["Average", "250\u2013300", "Typical human visual reaction time"],
                  ["Below Average", "300\u2013350", "Room for improvement"],
                  ["Slow", "350\u2013450", "May be affected by fatigue or distractions"],
                  ["Sleepy", "450+", "Likely tired or not focused"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    {row.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">The average human visual reaction time is about 250 milliseconds. This can vary based on age, alertness, and the type of stimulus (auditory reactions are typically 20&ndash;40 ms faster than visual).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Factors That Affect Reaction Time</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Sleep</strong>: Sleep deprivation can slow reaction time by 20&ndash;30%. Getting 7&ndash;9 hours of quality sleep is one of the most effective ways to maintain fast reflexes.</li>
            <li><strong className="text-foreground">Caffeine</strong>: Moderate caffeine intake (100&ndash;200 mg) can improve reaction time by 5&ndash;10%. Effects peak about 30&ndash;60 minutes after consumption.</li>
            <li><strong className="text-foreground">Exercise</strong>: Regular physical activity improves neural processing speed. Even a brief warm-up can temporarily boost reaction time.</li>
            <li><strong className="text-foreground">Gaming</strong>: Studies show that regular gamers have 10&ndash;15% faster reaction times than non-gamers, likely due to improved hand-eye coordination.</li>
            <li><strong className="text-foreground">Hydration</strong>: Even mild dehydration (1&ndash;2% body weight) can impair cognitive performance and slow reactions.</li>
            <li><strong className="text-foreground">Time of day</strong>: Reaction times are typically fastest in late morning to early afternoon and slowest in the early morning and late evening.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Reaction Time in Sports and Gaming</h2>
          <p>Reaction time plays a critical role across many competitive domains:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-foreground">F1 drivers</strong>: Average reaction time of ~200 ms at race start. The best drivers react in under 150 ms.</li>
            <li><strong className="text-foreground">Baseball hitters</strong>: Must react to a pitch in ~150 ms to decide whether to swing. A 90 mph fastball reaches home plate in about 400 ms.</li>
            <li><strong className="text-foreground">Sprinters</strong>: A reaction time under 100 ms at the starting blocks is considered a false start. Most elite sprinters react in 120&ndash;160 ms.</li>
            <li><strong className="text-foreground">Competitive FPS gamers</strong>: Top players average 150&ndash;200 ms reaction times, with some pros consistently hitting under 150 ms.</li>
          </ul>
          <p className="mt-3">Test your click speed with our <Link href="/type/cps-test" className="text-primary underline hover:no-underline">CPS Test</Link>, measure your typing speed with the <Link href="/type/wpm-test" className="text-primary underline hover:no-underline">WPM Test</Link>, or check every key on your keyboard with the <Link href="/type/keyboard-tester" className="text-primary underline hover:no-underline">Keyboard Tester</Link>.</p>
        </section>
      </div>
    </ToolLayout>
  );
}
