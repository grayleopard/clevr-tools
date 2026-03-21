import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { tools } from "@/lib/tools";

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
  const url = `https://www.clevr.tools/blog/${slug}`;

  return {
    title,
    description: post.description,
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
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  return (
    <div className="flex min-h-screen flex-col">
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
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
          <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:tracking-tight prose-p:leading-[1.7] prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:rounded-lg prose-pre:bg-muted prose-pre:p-4">
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
