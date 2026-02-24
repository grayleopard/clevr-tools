import { tools, toolCategories } from "@/lib/tools";
import ToolCard from "@/components/tool/ToolCard";
import SmartConverter from "@/components/home/SmartConverter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "clevr.tools — Free Online File Utilities",
  description:
    "Free browser-based tools: compress images, convert formats, generate QR codes, and more. No signup. Your files never leave your device.",
  alternates: {
    canonical: "https://clevr.tools",
  },
};

export default function HomePage() {
  const liveTools = tools.filter((t) => t.live !== false);
  const categories = toolCategories.filter((cat) =>
    liveTools.some((t) => t.category === cat.id)
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero — Smart Converter */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            {/* Headline */}
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <span>100% Free · No Signup · Files stay in your browser</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Drop any file.{" "}
                <span className="text-primary">We&apos;ll handle the rest.</span>
              </h1>
              <p className="mt-3 text-muted-foreground sm:text-lg">
                Free file tools powered by your browser. No upload. No signup. No BS.
              </p>
            </div>

            {/* Smart converter */}
            <SmartConverter />
          </div>
        </section>

        {/* Tools grid — browsing + SEO */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Or browse all tools:
          </p>
          {categories.map((cat) => {
            const catTools = liveTools.filter((t) => t.category === cat.id);
            if (catTools.length === 0) return null;
            return (
              <div key={cat.id} className="mb-12">
                <h2 className="mb-5 text-lg font-semibold capitalize tracking-tight text-foreground">
                  {cat.label}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {catTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}
