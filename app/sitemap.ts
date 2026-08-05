import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { siteCategories } from "@/lib/site-structure";
import { tools } from "@/lib/tools";

const SITE_URL = "https://www.clevr.tools";

function createEntry(route: string): MetadataRoute.Sitemap[number] {
  return { url: `${SITE_URL}${route}` };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const blogEntries = posts.map((post) => createEntry(`/blog/${post.slug}`));

  return [
    createEntry(""),
    createEntry("/about"),
    createEntry("/privacy"),
    createEntry("/play"),
    createEntry("/play/numble"),
    createEntry("/play/meme-generator"),
    ...siteCategories.map((category) => createEntry(category.route)),
    ...tools
      .filter((tool) => tool.live !== false && tool.indexable !== false)
      .map((tool) => createEntry(tool.route)),
    createEntry("/blog"),
    ...blogEntries,
  ];
}
