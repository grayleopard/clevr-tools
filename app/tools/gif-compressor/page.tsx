import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FaqSchema from "@/components/seo/FaqSchema";
import ToolLayout from "@/components/tool/ToolLayout";
import GifCompressor from "@/components/tools/GifCompressor";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("gif-compressor")!;
const faqItems = getToolFaqs("gif-compressor");

export async function generateMetadata(): Promise<Metadata> {
  if (!tool) return {};
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `https://www.clevr.tools${tool.route}`,
      siteName: "clevr.tools",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    alternates: {
      canonical: `https://www.clevr.tools${tool.route}`,
    },
  };
}

export default function GifCompressorPage() {
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool} fullWidth embeddedShell>
      <GifCompressor />
      <FaqSchema items={faqItems} />
    </ToolLayout>
  );
}
