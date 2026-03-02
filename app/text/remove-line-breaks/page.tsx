import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import ToolLayout from "@/components/tool/ToolLayout";
import RemoveLineBreaks from "@/components/tools/RemoveLineBreaks";
import { notFound } from "next/navigation";

const tool = getToolBySlug("remove-line-breaks")!;
const faqItems = getToolFaqs("remove-line-breaks");

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

export default function RemoveLineBreaksPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <RemoveLineBreaks />
      <FaqSchema items={faqItems} />
    </ToolLayout>
  );
}
