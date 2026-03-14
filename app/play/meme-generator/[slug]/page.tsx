import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import FaqSchema, { type FaqItem } from "@/components/seo/FaqSchema";
import MemeEditor from "@/components/meme/MemeEditor";
import { memeTemplates } from "@/lib/memes/templates";

function getTemplate(slug: string) {
  return memeTemplates.find((t) => t.id === slug);
}

export function generateStaticParams() {
  return memeTemplates.map((t) => ({ slug: t.id }));
}

const templateDescriptions: Record<string, string> = {
  "drake":
    "The Drake Hotline Bling meme uses two panels to compare something you reject (top) with something you prefer (bottom). One of the most versatile and widely-shared meme formats since 2015.",
  "distracted-boyfriend":
    "The Distracted Boyfriend meme labels three people to show someone being drawn to a new option while ignoring their current one. Perfect for comparing priorities or highlighting ironic choices.",
  "two-buttons":
    "The Two Buttons meme shows a character sweating over a difficult choice between two equally tempting or absurd options. Great for illustrating impossible decisions.",
  "change-my-mind":
    "The Change My Mind meme features Steven Crowder sitting behind a table with a sign displaying a bold opinion. Ideal for hot takes and controversial statements you stand by.",
  "expanding-brain":
    "The Expanding Brain meme uses four panels of increasing brain illumination to rank ideas from mundane to absurd or genius. Perfect for satirical tier lists.",
  "woman-yelling-cat":
    "The Woman Yelling at Cat meme pairs an upset woman from Real Housewives with a confused cat at a dinner table. One of the most iconic two-panel reaction memes.",
  "one-does-not-simply":
    "The One Does Not Simply meme features Boromir from Lord of the Rings explaining why something is harder than it sounds. A classic for understatement humor.",
  "success-kid":
    "The Success Kid meme shows a toddler with a triumphant fist-pump expression. Use it to celebrate small wins and satisfying moments.",
  "is-this-a-pigeon":
    "The Is This a Pigeon meme shows someone misidentifying an obvious thing. Label the butterfly, the person, and the question to highlight absurd confusion.",
  "left-exit-12-off-ramp":
    "The Left Exit 12 Off Ramp meme shows a car swerving to take an exit at the last second, choosing an impulsive option over the sensible path.",
  "running-away-balloon":
    "The Running Away Balloon meme shows a figure reaching for a balloon while being held back. Label the balloon, person, and obstacle to illustrate losing something you want.",
  "roll-safe":
    "The Roll Safe meme features a man tapping his temple with a sly grin, implying a clever (but usually flawed) logic. Perfect for bad-advice-that-sounds-smart jokes.",
  "disaster-girl":
    "The Disaster Girl meme shows a young girl smiling mischievously in front of a burning house. Use it for dark humor about causing chaos.",
  "batman-slapping-robin":
    "The Batman Slapping Robin meme shows Batman interrupting Robin mid-sentence with a slap. Fill in the speech bubbles to shut down a bad take.",
  "gru-plan":
    "Gru's Plan meme uses four panels where Gru presents a great plan, then realizes a flaw in step 3 that he repeats in disbelief. Perfect for plans that backfire.",
  "surprised-pikachu":
    "The Surprised Pikachu meme shows Pikachu with a shocked expression. Use it when an obvious outcome surprises someone who should have seen it coming.",
  "ancient-aliens":
    "The Ancient Aliens meme features Giorgio Tsoukalos with wild hair, captioned to blame everything on aliens. The go-to format for absurd explanations.",
  "mocking-spongebob":
    "The Mocking SpongeBob meme uses alternating caps to mock something someone said. The chicken-like pose conveys maximum sarcasm.",
  "boardroom-meeting":
    "The Boardroom Meeting meme shows a boss asking for suggestions and throwing someone out the window for giving the best answer. Classic corporate humor.",
  "blank-nut-button":
    "The Blank Nut Button meme shows a hand slamming an irresistible blue button. Label the button with whatever temptation you can't resist.",
  "waiting-skeleton":
    "The Waiting Skeleton meme shows a skeleton that has been waiting so long it decomposed. Use it for things that take forever.",
  "epic-handshake":
    "The Epic Handshake meme labels two muscular arms clasping to show what two different groups have in common. The ultimate agreement format.",
  "x-everywhere":
    "The X, X Everywhere meme features Buzz Lightyear showing Woody a vast landscape. Use it to point out something that's absolutely everywhere.",
  "this-is-fine":
    "The This Is Fine meme shows a dog sitting in a burning room, calmly sipping coffee. The definitive format for ignoring everything falling apart.",
  "uno-draw-25":
    "The UNO Draw 25 meme shows a player choosing to draw 25 cards rather than do something written on the card. Label the card with a task someone refuses to do.",
  "bike-fall":
    "The Bike Fall meme shows someone sticking a stick in their own bike wheel and blaming something else. A three-panel format for self-inflicted problems.",
  "hide-the-pain-harold":
    "The Hide the Pain Harold meme shows a man forcing a smile despite visible pain in his eyes. Use it for relatable moments of hidden suffering.",
  "doge":
    "The Doge meme features the iconic Shiba Inu with colorful Comic Sans text scattered around. A timeless format with phrases like 'much wow' and 'very amaze'.",
  "cheems":
    "The Buff Doge vs Cheems meme contrasts a strong muscular doge with a small, wimpy one. Perfect for comparing how things used to be versus how they are now.",
  "always-has-been":
    "The Always Has Been meme shows two astronauts in space, with one realizing a truth and the other confirming it was always that way, often with a gun.",
};

function getRelatedTemplates(slug: string) {
  const current = memeTemplates.findIndex((t) => t.id === slug);
  if (current === -1) return [];
  const related: typeof memeTemplates = [];
  for (let i = 1; related.length < 6 && i < memeTemplates.length; i++) {
    const idx = (current + i) % memeTemplates.length;
    related.push(memeTemplates[idx]);
  }
  return related;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) return {};

  const title = `${template.name} Meme Generator — Free, No Signup | clevr.tools`;
  const description =
    templateDescriptions[slug]?.slice(0, 155) ??
    `Create ${template.name} memes instantly. Add text, preview live, download PNG.`;
  const url = `https://www.clevr.tools/play/meme-generator/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "clevr.tools",
      images: [{ url: template.src, width: template.width, height: template.height }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function getFaqItems(name: string): FaqItem[] {
  return [
    {
      question: `How do I make a ${name} meme?`,
      answer: `Pick the ${name} template on clevr.tools, type your text into each field, preview it live on the canvas, and download the finished PNG. No signup required.`,
    },
    {
      question: `Is the ${name} meme generator free?`,
      answer:
        "Yes. The meme generator is completely free with no signup, no ads, and no watermarks on your content. Rendering happens locally in your browser.",
    },
    {
      question: "Can I customize the text style?",
      answer:
        "You can switch between classic (white Impact text with outline) and modern styles, adjust font size with the scale slider, and change the text color.",
    },
  ];
}

export default async function MemeTemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) notFound();

  const description = templateDescriptions[slug] ?? "";
  const faqItems = getFaqItems(template.name);
  const related = getRelatedTemplates(slug);

  return (
    <>
      <FaqSchema items={faqItems} />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <section className="border-b border-border bg-muted/20">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="max-w-3xl space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Meme Generator
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {template.name} Meme Maker
                </h1>
                {description && (
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <MemeEditor initialTemplate={template} />
          </section>

          {related.length > 0 && (
            <section className="border-t border-border bg-muted/20">
              <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
                  More meme templates
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {related.map((t) => (
                    <Link
                      key={t.id}
                      href={`/play/meme-generator/${t.id}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={t.src}
                          alt={t.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-white">
                          <p className="text-sm font-semibold leading-tight">
                            {t.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
