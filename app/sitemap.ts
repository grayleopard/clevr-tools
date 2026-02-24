import { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

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

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...toolEntries,
  ];
}
