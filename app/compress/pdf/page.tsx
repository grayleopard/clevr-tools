import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import PdfCompressor from "@/components/tools/PdfCompressor";
import { notFound } from "next/navigation";

const tool = getToolBySlug("pdf-compressor")!;

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
      images: ["/og-default.png"],
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

export default function PdfCompressorPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <PdfCompressor />
    </ToolLayout>
  );
}
