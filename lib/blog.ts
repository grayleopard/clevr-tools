import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  relatedTools: string[];
  readTime: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    return {
      title: data.title ?? "",
      slug: data.slug ?? file.replace(/\.mdx$/, ""),
      description: data.description ?? "",
      date: data.date ?? "",
      author: data.author ?? "clevr.tools",
      tags: data.tags ?? [],
      relatedTools: data.relatedTools ?? [],
      readTime: estimateReadTime(content),
    } satisfies BlogPostMeta;
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const fileSlug = data.slug ?? file.replace(/\.mdx$/, "");

    if (fileSlug === slug) {
      return {
        title: data.title ?? "",
        slug: fileSlug,
        description: data.description ?? "",
        date: data.date ?? "",
        author: data.author ?? "clevr.tools",
        tags: data.tags ?? [],
        relatedTools: data.relatedTools ?? [],
        readTime: estimateReadTime(content),
        content,
      };
    }
  }

  return null;
}
