import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import RelatedToolsCluster from "@/components/seo/RelatedToolsCluster";
import ToolLayout from "@/components/tool/ToolLayout";
import QrCodeGenerator from "@/components/tools/QrCodeGenerator";
import { notFound } from "next/navigation";

const tool = getToolBySlug("qr-code-generator")!;
const faqItems = getToolFaqs("qr-code-generator");

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

export default function QrCodePage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <QrCodeGenerator />
      <FaqSchema items={faqItems} />
      <RelatedToolsCluster category="utility" currentPath={tool.route} />
    </ToolLayout>
  );
}
