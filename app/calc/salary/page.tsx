import ToolLayout from "@/components/tool/ToolLayout";
import SalaryCalculator from "@/components/tools/SalaryCalculator";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import { tools } from "@/lib/tools";
import type { Metadata } from "next";

const tool = tools.find((t) => t.slug === "salary")!;
const faqItems = getToolFaqs("salary");

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: `https://www.clevr.tools${tool.route}` },
  openGraph: {
    type: "website",
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
      <SalaryCalculator />
      <section
        aria-labelledby="salary-conversion-overview"
        className="mt-8 rounded-xl bg-card p-5 sm:p-6"
      >
        <h2
          id="salary-conversion-overview"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Convert hourly pay and annual salary
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Compare gross pay in either direction using your expected hours per week and weeks per
          year. The calculation is hourly rate x hours per week x weeks per year, then shows the
          corresponding gross-pay amounts. Daily pay assumes five working days per week;
          biweekly pay covers two working weeks. Monthly and semi-monthly figures average
          annual pay over 12 and 24 periods respectively, rather than predicting a specific paycheck.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="text-sm font-medium text-foreground">Full-time example</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              $25 per hour at 40 hours a week for 52 weeks is $52,000 per year.
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="text-sm font-medium text-foreground">Part-time example</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              At the same $25 hourly rate, 20 hours a week for 52 weeks is $26,000 per year.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          This is a gross-pay conversion, not a take-home pay or tax estimate. It does not account
          for taxes, withholding, benefits, deductions, bonuses, overtime, paid leave, or local
          pay rules.
        </p>
      </section>
      <FaqSchema items={faqItems} />
    </ToolLayout>
  );
}
