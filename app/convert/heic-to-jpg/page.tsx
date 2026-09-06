import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import FaqSchema from "@/components/seo/FaqSchema";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import HeicToJpg from "@/components/tools/HeicToJpg";
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
      type: "website",
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
      <HeicToJpg />
      <FaqSchema items={getToolFaqs("heic-to-jpg")} />
    </ToolLayout>
  );
}
