import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getAllPosts, type BlogPostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Practical Guides for Files, Text & Typing | clevr.tools",
  description:
    "Clear, task-focused guides for compressing and converting files, cleaning text, and improving typing.",
  alternates: { canonical: "https://www.clevr.tools/blog" },
  openGraph: {
    title: "Practical Guides for Files, Text & Typing | clevr.tools",
    description:
      "Clear, task-focused guides for compressing and converting files, cleaning text, and improving typing.",
    url: "https://www.clevr.tools/blog",
    siteName: "clevr.tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "Practical Guides for Files, Text & Typing | clevr.tools",
    description:
      "Clear, task-focused guides for compressing and converting files, cleaning text, and improving typing.",
  },
};

interface GuideCollection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  categoryHref: string;
  categoryLabel: string;
  slugs: string[];
}

const GUIDE_COLLECTIONS: GuideCollection[] = [
  {
    id: "images",
    eyebrow: "Images",
    title: "Image size and formats",
    description:
      "Choose the right dimensions, format, and compression settings for the way an image will be used.",
    categoryHref: "/files",
    categoryLabel: "Browse file tools",
    slugs: [
      "compress-images",
      "reduce-image-file-size",
      "png-vs-jpg-vs-webp",
      "remove-image-background",
    ],
  },
  {
    id: "pdf",
    eyebrow: "Documents",
    title: "PDF workflows",
    description:
      "Move between PDFs and images while keeping page order, orientation, and output size in view.",
    categoryHref: "/files",
    categoryLabel: "Browse PDF tools",
    slugs: ["convert-pdf-to-jpg", "convert-png-to-pdf"],
  },
  {
    id: "text-code",
    eyebrow: "Text + code",
    title: "Clean and inspect content",
    description:
      "Fix copied text or make structured data easier to read before it goes into the next workflow.",
    categoryHref: "/text-code",
    categoryLabel: "Browse text and code tools",
    slugs: ["remove-line-breaks"],
  },
  {
    id: "typing",
    eyebrow: "Typing",
    title: "Measure, then practice",
    description:
      "Get a useful speed baseline and move from testing into a practice mode that matches your goal.",
    categoryHref: "/type",
    categoryLabel: "Browse typing tools",
    slugs: ["typing-test"],
  },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function GuideRow({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group -mx-3 grid gap-3 rounded-xl px-3 py-5 transition-colors hover:bg-primary/[0.06] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
          {post.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readTime} min read
          </span>
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary sm:pl-6">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function BlogIndexPage() {
  const allPosts = getAllPosts();
  const visiblePosts = allPosts;
  const postsBySlug = new Map(visiblePosts.map((post) => [post.slug, post]));
  const groupedSlugs = new Set(GUIDE_COLLECTIONS.flatMap((collection) => collection.slugs));
  const ungroupedPosts = visiblePosts.filter((post) => !groupedSlugs.has(post.slug));
  const collections = GUIDE_COLLECTIONS.map((collection) => ({
    ...collection,
    posts: collection.slugs
      .map((slug) => postsBySlug.get(slug))
      .filter((post): post is BlogPostMeta => post !== undefined),
  })).filter((collection) => collection.posts.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <span>Guides</span>
            </nav>

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-primary">
                <BookOpen className="h-[14px] w-[14px]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Practical guides
                </span>
              </div>
              <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-6xl">
                Understand the workflow.
                <br />
                <span className="text-primary">Finish the task.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Clear walkthroughs for common file, text, and typing tasks—with the right tool
                linked where it is useful.
              </p>
            </div>
          </div>
        </section>

        {collections.length === 0 && ungroupedPosts.length === 0 ? (
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <p className="rounded-2xl border border-[color:var(--ghost-border)] bg-card p-6 text-sm text-muted-foreground">
              Posts coming soon.
            </p>
          </section>
        ) : (
          <>
            <nav
              aria-label="Guide topics"
              className="border-y border-[color:var(--ghost-border)] bg-background"
            >
              <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 [scrollbar-width:thin]">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`#${collection.id}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color:var(--ghost-border)] bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    {collection.eyebrow}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {collection.posts.length}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>

            <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
              {collections.map((collection) => (
                <section
                  key={collection.id}
                  id={collection.id}
                  className="grid scroll-mt-24 gap-8 border-b border-[color:var(--ghost-border)] py-12 last:border-b-0 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.8fr)] lg:gap-16"
                >
                  <header>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {collection.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      {collection.title}
                    </h2>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                      {collection.description}
                    </p>
                    <Link
                      href={collection.categoryHref}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      {collection.categoryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </header>

                  <div className="divide-y divide-[color:var(--ghost-border)]">
                    {collection.posts.map((post) => (
                      <GuideRow key={post.slug} post={post} />
                    ))}
                  </div>
                </section>
              ))}

              {ungroupedPosts.length > 0 ? (
                <section className="grid gap-8 py-12 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.8fr)] lg:gap-16">
                  <header>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      More
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      More practical guides
                    </h2>
                  </header>
                  <div className="divide-y divide-[color:var(--ghost-border)]">
                    {ungroupedPosts.map((post) => (
                      <GuideRow key={post.slug} post={post} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
