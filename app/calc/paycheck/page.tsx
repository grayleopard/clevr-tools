import ToolLayout from "@/components/tool/ToolLayout";
import ContainedToolNotice from "@/components/tool/ContainedToolNotice";
import { tools } from "@/lib/tools";
import { hiddenToolRobots } from "@/lib/seo/robots";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "paycheck")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  ...hiddenToolRobots(tool),
  alternates: { canonical: `https://www.clevr.tools${tool.route}` },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: `https://www.clevr.tools${tool.route}`,
    siteName: "clevr.tools",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: tool.metaTitle, description: tool.metaDescription },
};

export default function Page() {
  return (
    <ToolLayout tool={tool}>
      <ContainedToolNotice title="Paycheck estimates are being rebuilt">
        <p>
          The previous model used stale payroll thresholds and incomplete
          Medicare and state assumptions. Calculation is disabled until its
          tax year, filing assumptions, deductions, and jurisdiction coverage
          are sourced and independently verified.
        </p>
      </ContainedToolNotice>
    </ToolLayout>
  );
}
