import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import { notFound } from "next/navigation";

const ImageCropper = dynamic(() => import("@/components/tools/ImageCropper"), {
  loading: () => <div className="animate-pulse rounded-xl bg-muted/30 h-96" />,
});

const tool = getToolBySlug("image-cropper")!;

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

export default function ImageCropperPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <ImageCropper />
    </ToolLayout>
  );
}
