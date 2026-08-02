import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import ContainedToolNotice from "@/components/tool/ContainedToolNotice";
import { notFound } from "next/navigation";
import { hiddenToolRobots } from "@/lib/seo/robots";

const tool = getToolBySlug("heic-to-jpg")!;

export async function generateMetadata(): Promise<Metadata> {
  if (!tool) return {};
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    ...hiddenToolRobots(tool),
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

export default function HeicToJpgPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <ContainedToolNotice title="HEIC conversion is temporarily unavailable">
        <p>
          The current browser decoder can stall on supported HEIC files and
          does not provide a dependable cancellation path. Conversion is
          disabled until representative iPhone HEIC files complete within a
          bounded time and their JPEG signatures, dimensions, orientation, and
          decodability pass independent browser tests.
        </p>
      </ContainedToolNotice>
    </ToolLayout>
  );
}
