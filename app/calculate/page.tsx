import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import CategoryPageScaffold from "@/components/category/CategoryPageScaffold";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const category = siteCategories.find((c) => c.id === "calculate")!;
const commonConversions = [
  {
    name: "Data Size Converter",
    description: "Compare KB, MB, and GB with explicit SI and IEC binary units.",
    href: "/calc/convert/data",
  },
  {
    name: "Speed Converter",
    description: "Convert mph, km/h, m/s, knots, and feet per second.",
    href: "/calc/convert/speed",
  },
  {
    name: "Weight Converter",
    description: "Convert kg, pounds, ounces and stone with precise factors.",
    href: "/calc/convert/weight",
  },
  {
    name: "Angle Converter",
    description: "Move between degrees, radians, gradians, arcminutes, and arcseconds.",
    href: "/calc/convert/angle",
  },
] as const;
const commonConversionSlugs = new Set(["convert-data", "convert-speed", "convert-angle", "convert-weight"]);

export const metadata: Metadata = {
  title: "Calculators — Free Online Financial & Math Calculators | clevr.tools",
  description: category.description,
  alternates: { canonical: "https://www.clevr.tools/calculate" },
  openGraph: {
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Calculators — Free Online Financial & Math Calculators | clevr.tools",
    description: category.description,
    url: "https://www.clevr.tools/calculate",
    siteName: "clevr.tools",
  },
};

export default function CalculatePage() {
  const featuredTools = category.featuredSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((tool): tool is Tool => tool !== undefined && tool.live !== false);

  return (
    <CategoryPageScaffold
      categoryName={category.label}
      headerLabel="MONEY + LIFE"
      titleLineOne="Financial, Health, and Everyday"
      titleLineTwo="Calculators"
      description="Financial calculators, health tools, and everyday math. Precise results, no signup."
      Icon={Calculator}
      featuredTools={featuredTools}
      featuredTitle="Featured calculators"
      showSectionNavigation
      sections={[
        {
          title: "Common conversions",
          content: (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {commonConversions.map((conversion) => (
                <Link
                  key={conversion.href}
                  href={conversion.href}
                  className="group flex min-h-36 flex-col justify-between border border-[color:var(--ghost-border)] bg-card p-5 transition-colors hover:border-primary hover:bg-primary/[0.06]"
                >
                  <span>
                    <span className="block text-sm font-bold text-foreground group-hover:text-primary">
                      {conversion.name}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                      {conversion.description}
                    </span>
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    Open converter
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          ),
        },
        ...category.subcategories.map((sub) => ({
          title: sub.label,
          columnsClassName: "sm:grid-cols-2 xl:grid-cols-3",
          tools: sub.slugs
            .filter((slug) => !commonConversionSlugs.has(slug))
            .map((slug) => getToolBySlug(slug))
            .filter((tool): tool is Tool => tool !== undefined && tool.live !== false),
        })),
      ]}
    />
  );
}
