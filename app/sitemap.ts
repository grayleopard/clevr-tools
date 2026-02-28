import { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { siteCategories } from "@/lib/site-structure";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://clevr.tools";

  const toolEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.live !== false)
    .map((tool) => ({
      url: `${base}${tool.route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const categoryEntries: MetadataRoute.Sitemap = siteCategories.map((cat) => ({
    url: `${base}${cat.route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...categoryEntries,
    ...toolEntries,
  ];
}
