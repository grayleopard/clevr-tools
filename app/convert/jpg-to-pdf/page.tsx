import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import ImagesToPdf from "@/components/tools/ImagesToPdf";
import { notFound } from "next/navigation";

const tool = getToolBySlug("jpg-to-pdf")!;

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

export default function JpgToPdfPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <ImagesToPdf
        accept=".jpg,.jpeg,.png,.webp"
        toolSlug="jpg-to-pdf"
        resetLabel="Convert more images"
      />
    </ToolLayout>
  );
}
