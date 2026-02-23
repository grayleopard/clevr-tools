import { tools, toolCategories } from "@/lib/tools";
import ToolCard from "@/components/tool/ToolCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Zap } from "lucide-react";
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
  const categories = toolCategories.filter((cat) =>
    tools.some((t) => t.category === cat.id)
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              100% Free · No Signup · Files stay in your browser
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Smart tools for{" "}
              <span className="text-primary">everyday files</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              Compress, convert, and generate. All processing happens locally in your browser —
              your files never touch our servers.
            </p>
          </div>
        </section>

        {/* Tools grid */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {categories.map((cat) => {
            const catTools = tools.filter((t) => t.category === cat.id);
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
