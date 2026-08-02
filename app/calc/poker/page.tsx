import type { Metadata } from "next";
import ToolLayout from "@/components/tool/ToolLayout";
import ContainedToolNotice from "@/components/tool/ContainedToolNotice";
import { getToolBySlug } from "@/lib/tools";
import { hiddenToolRobots } from "@/lib/seo/robots";

const tool = getToolBySlug("poker")!;

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
    <ToolLayout tool={tool} fullWidth embeddedShell>
      <ContainedToolNotice title="Poker equity calculator is under review">
        <p>
          The previous starting-hand percentages were not produced by a
          defensible enumeration or simulation model and could materially
          misstate equity. The calculator is disabled until a versioned,
          independently verified dataset or implementation is available.
        </p>
      </ContainedToolNotice>
    </ToolLayout>
  );
}
