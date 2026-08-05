import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import ContainedToolNotice from "@/components/tool/ContainedToolNotice";
import { notFound } from "next/navigation";
import { hiddenToolRobots } from "@/lib/seo/robots";

const tool = getToolBySlug("pdf-to-fillable")!;

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

export default function PdfToFillablePdfPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <ContainedToolNotice title="PDF form editing is under verification">
        <p>
          This tool is temporarily unavailable while keyboard and touch operation,
          rotated-page placement, exported field behavior, and compatibility across
          common PDF readers are independently verified.
        </p>
        <p>
          The route will remain out of search results until those checks pass and the
          privacy and accessibility claims can be supported consistently.
        </p>
      </ContainedToolNotice>
    </ToolLayout>
  );
}
