import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import FaqSchema, { type FaqItem } from "@/components/seo/FaqSchema";
import MemeEditor from "@/components/meme/MemeEditor";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Meme Generator — Free, No Signup | clevr.tools",
  description: "Create memes instantly. Pick a template, add text, download.",
  alternates: {
    canonical: "https://www.clevr.tools/play/meme-generator",
  },
  openGraph: {
    title: "Meme Generator — Free, No Signup | clevr.tools",
    description: "Create memes instantly. Pick a template, add text, download.",
    url: "https://www.clevr.tools/play/meme-generator",
    siteName: "clevr.tools",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meme Generator — Free, No Signup | clevr.tools",
    description: "Create memes instantly. Pick a template, add text, download.",
  },
};

const faqItems: FaqItem[] = [
  {
    question: "Do I need to sign up to use the meme generator?",
    answer:
      "No. The meme generator is free to use with no signup, and rendering happens locally in your browser.",
  },
  {
    question: "Can I upload my own image and turn it into a meme?",
    answer:
      "Yes. You can upload an image, add top and bottom text, preview it live on canvas, and download the finished PNG.",
  },
  {
    question: "Does the meme generator upload my image to a server?",
    answer:
      "No. This version runs client-side only, so your image stays on your device while you edit and export it.",
  },
  {
    question: "What file format does the download use?",
    answer:
      "Downloads are exported as PNG files at the original template resolution with the clevr.tools watermark included.",
  },
];

export default async function MemeGeneratorPage({
  searchParams,
}: {
  searchParams: Promise<{ memeDebug?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const showDebugRegions = resolvedSearchParams.memeDebug === "1";

  return (
    <>
      <FaqSchema items={faqItems} />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
              <header className="mb-8 max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-primary">
                  <Zap className="h-[14px] w-[14px]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    PLAY
                  </span>
                </div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Meme Generator
                </h1>
                <p className="text-base text-muted-foreground">
                  Create memes instantly with built-in templates or your own image. Edit text
                  live on a canvas preview and download a PNG without leaving the browser.
                </p>
              </header>

              <ToolPageLayout
                categoryName="Play"
                categoryHref="/play"
                relatedTools={[
                  { name: "Numble", href: "/play/numble" },
                  { name: "Browse templates", href: "/play/meme-generator" },
                ]}
                settingsTitle="Export"
                settingsPanel={
                  <div className="text-sm leading-7 text-muted-foreground">
                    <p>Memes download as PNG files directly from the browser.</p>
                  </div>
                }
                infoTitle="Processing"
                infoPanel={
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>Rendering happens locally in your browser. Uploaded images stay on your device while you edit.</p>
                  </div>
                }
              >
                <MemeEditor showDebugRegions={showDebugRegions} />
              </ToolPageLayout>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
