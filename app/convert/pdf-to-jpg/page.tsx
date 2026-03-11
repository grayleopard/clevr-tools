import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import ToolLayout from "@/components/tool/ToolLayout";
import PdfToJpg from "@/components/tools/PdfToJpg";
import FileXRay from "@/components/xray/FileXRay";
import { PdfXRayProvider } from "@/lib/xray/pdf-xray-context";
import { notFound } from "next/navigation";

const tool = getToolBySlug("pdf-to-jpg")!;
const faqItems = getToolFaqs("pdf-to-jpg");

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

export default function PdfToJpgPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <PdfXRayProvider>
        <PdfToJpg />
        <FileXRay showTrigger={false} />
      </PdfXRayProvider>
      <FaqSchema items={faqItems} />
    </ToolLayout>
  );
}
