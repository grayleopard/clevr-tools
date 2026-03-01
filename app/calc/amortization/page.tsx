import ToolLayout from "@/components/tool/ToolLayout";
import AmortizationCalculator from "@/components/tools/AmortizationCalculator";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "amortization")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: `https://clevr.tools${tool.route}` },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: `https://clevr.tools${tool.route}`,
    siteName: "clevr.tools",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return (
    <ToolLayout tool={tool}>
      <AmortizationCalculator />
    </ToolLayout>
  );
}
