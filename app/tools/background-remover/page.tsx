import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolLayout from "@/components/tool/ToolLayout";
import ContainedToolNotice from "@/components/tool/ContainedToolNotice";
import { getToolBySlug } from "@/lib/tools";
import { hiddenToolRobots } from "@/lib/seo/robots";

const tool = getToolBySlug("background-remover")!;

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

export default function BackgroundRemoverPage() {
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ContainedToolNotice title="Background removal is currently unavailable">
        <p>
          This experimental workflow requires an external image-processing
          service whose retention, deletion, processor, and security terms have
          not been verified. Image submission is disabled while that review is
          incomplete.
        </p>
        <p>Please do not submit sensitive or personal images to this route.</p>
      </ContainedToolNotice>
    </ToolLayout>
  );
}
