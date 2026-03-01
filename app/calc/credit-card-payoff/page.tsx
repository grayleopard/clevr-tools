import ToolLayout from "@/components/tool/ToolLayout";
import CreditCardPayoffCalculator from "@/components/tools/CreditCardPayoffCalculator";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "credit-card-payoff")!;

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
      <CreditCardPayoffCalculator />
    </ToolLayout>
  );
}
