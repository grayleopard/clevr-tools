import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { tools } from "@/lib/tools";

const SITE_URL = "https://www.clevr.tools";
const SITE_ORGANIZATION = {
  "@type": "Organization",
  name: "clevr.tools",
  url: SITE_URL,
} as const;

function getCanonicalUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const title = `${post.title} | clevr.tools`;
  const url = getCanonicalUrl(slug);

  return {
    title,
    description: post.description,
    authors: [{ name: "clevr.tools", url: SITE_URL }],
    alternates: { canonical: url },
    openGraph: {
      title,
      description: post.description,
      url,
      siteName: "clevr.tools",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
    },
  };
}

function formatDate(dateString: string): string {
  const timestamp = Date.parse(`${dateString}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(timestamp);
}

function getRelatedToolData(routes: string[]) {
  return routes
    .map((route) => {
      const tool = tools.find((t) => t.route === route && t.live !== false);
      return tool ? { name: tool.name, route: tool.route, description: tool.shortDescription } : null;
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedTools = getRelatedToolData(post.relatedTools);
  const canonicalUrl = getCanonicalUrl(post.slug);
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: SITE_ORGANIZATION,
    publisher: SITE_ORGANIZATION,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <main className="flex-1">
        <section className="bg-muted/20">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <nav className="mb-4 text-sm text-muted-foreground">
              <Link
                href="/blog"
                className="transition-colors hover:text-primary"
              >
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{post.title}</span>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {post.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>By clevr.tools</span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readTime} min read</span>
              {post.tags.length > 0 && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="prose prose-zinc max-w-none overflow-x-auto overscroll-x-contain prose-headings:max-w-3xl prose-headings:break-words prose-headings:tracking-tight prose-p:max-w-3xl prose-p:break-words prose-p:leading-[1.7] prose-ul:max-w-3xl prose-ol:max-w-3xl prose-blockquote:max-w-3xl prose-a:break-words prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:max-w-3xl prose-pre:rounded-lg prose-pre:bg-muted prose-pre:p-4 prose-table:min-w-[36rem] prose-table:max-w-4xl dark:prose-invert">
            <MDXRemote source={post.content} />
          </div>
        </article>

        {relatedTools.length > 0 && (
          <section className="border-t border-border bg-muted/20">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                Tools mentioned in this post
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.route}
                    href={tool.route}
                    className="rounded-2xl border border-[color:var(--ghost-border)] bg-card p-5 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--ambient-shadow)]"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {tool.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
