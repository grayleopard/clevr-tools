import type { Metadata } from "next";
import ToolLayout from "@/components/tool/ToolLayout";
import PokerCalculator from "@/components/tools/PokerCalculator";
import FaqSchema from "@/components/seo/FaqSchema";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("poker")!;

const faqItems = [
  {
    question: "What is the best hand in poker?",
    answer:
      "A Royal Flush — A, K, Q, J, 10 all of the same suit. It's the highest-ranking hand and cannot be beaten. The odds of being dealt a Royal Flush are approximately 1 in 649,740.",
  },
  {
    question: "What beats what in poker?",
    answer:
      "From highest to lowest: Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card. A higher-ranked hand always beats a lower-ranked hand.",
  },
  {
    question: "How do you calculate pot odds?",
    answer:
      'Divide the amount you need to call by the total pot size (including the bet). For example, if the pot is $100 and you need to call $25, your pot odds are $25 / ($100 + $25) = 20%. If your probability of winning exceeds 20%, calling is profitable in the long run.',
  },
  {
    question: 'What does "outs" mean in poker?',
    answer:
      "Outs are the number of unseen cards that would improve your hand to a likely winner. For example, if you have four cards to a flush, there are 9 remaining cards of that suit in the deck — giving you 9 outs.",
  },
  {
    question: "How many starting hands are there in Texas Hold'em?",
    answer:
      "There are 1,326 possible two-card combinations, but only 169 unique starting hands when you group by rank and suited/offsuit status.",
  },
];

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: `https://www.clevr.tools${tool.route}` },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: `https://www.clevr.tools${tool.route}`,
    siteName: "clevr.tools",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: tool.metaTitle, description: tool.metaDescription },
};

export default function Page() {
  return (
    <ToolLayout tool={tool} fullWidth embeddedShell>
      <PokerCalculator />
      <FaqSchema items={faqItems} />
    </ToolLayout>
  );
}
