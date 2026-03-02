import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import CodeChallenge from "@/components/tools/CodeChallenge";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { notFound } from "next/navigation";
import Link from "next/link";

const tool = getToolBySlug("code-challenge")!;
const faqItems = getToolFaqs("code-challenge");

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

export default function CodeChallengePage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <CodeChallenge />
      <FaqSchema items={faqItems} />
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Supported Languages
          </h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Language</th>
                  <th className="text-left p-2 font-medium">Levels</th>
                  <th className="text-left p-2 font-medium">Focus Areas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["JavaScript", "3", "Functions, async/await, classes"],
                  ["Python", "3", "Decorators, generators, dataclasses"],
                  ["TypeScript", "3", "Interfaces, generics, mapped types"],
                  ["HTML/CSS", "2", "Markup, flexbox, media queries"],
                  ["SQL", "3", "Queries, joins, window functions"],
                  ["Go", "2", "Goroutines, channels, structs"],
                  ["Rust", "2", "Ownership, iterators, traits"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Special Characters in Code
          </h2>
          <p>
            Code uses far more special characters than regular text: brackets,
            semicolons, operators, and template literals all require precise
            finger placement. Your special character accuracy score isolates
            this metric so you can track improvement separately from overall
            accuracy.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Keyboard Shortcuts
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Tab</strong> inserts the correct number of spaces for the
              selected language (2 for JS/TS/HTML/SQL, 4 for Python/Go/Rust)
            </li>
            <li>
              <strong>Enter</strong> inserts a newline to match the code
              structure
            </li>
            <li>
              <strong>Backspace</strong> deletes the last typed character
            </li>
          </ul>
          <p className="mt-3">
            Build general typing speed with our{" "}
            <Link
              href="/type/typing-practice"
              className="text-primary underline hover:no-underline"
            >
              Typing Practice
            </Link>{" "}
            tool for structured improvement.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
