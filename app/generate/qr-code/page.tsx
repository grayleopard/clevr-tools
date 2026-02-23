import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/tool/ToolLayout";
import QrCodeGenerator from "@/components/tools/QrCodeGenerator";
import { notFound } from "next/navigation";

const tool = getToolBySlug("qr-code-generator")!;

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

export default function QrCodePage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <QrCodeGenerator />
    </ToolLayout>
  );
}
