import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | clevr.tools",
  description:
    "Guides, tutorials, and tips for working with images, files, and web tools.",
  alternates: { canonical: "https://www.clevr.tools/blog" },
  openGraph: {
    title: "Blog | clevr.tools",
    description:
      "Guides, tutorials, and tips for working with images, files, and web tools.",
    url: "https://www.clevr.tools/blog",
    siteName: "clevr.tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | clevr.tools",
    description:
      "Guides, tutorials, and tips for working with images, files, and web tools.",
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-muted/20">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Blog
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Guides, tutorials, and tips for images, files, and the web.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--ghost-border)] bg-card p-6 text-sm text-muted-foreground">
              Posts coming soon.
            </p>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--ambient-shadow)]"
                >
                  <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
