import ToolLayout from "@/components/tool/ToolLayout";
import ContainedToolNotice from "@/components/tool/ContainedToolNotice";
import { tools } from "@/lib/tools";
import { hiddenToolRobots } from "@/lib/seo/robots";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "take-home-pay")!;

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
      <ContainedToolNotice title="Take-home pay estimates are being rebuilt">
        <p>
          The previous model used stale federal and Social Security thresholds
          and did not fully implement Additional Medicare Tax or verified
          state-level rules. Calculation is disabled until a versioned tax-year
          model with authoritative jurisdiction sources is available.
        </p>
      </ContainedToolNotice>
    </ToolLayout>
  );
}
