import FaqSection, { type FaqItem } from "@/components/seo/FaqSection";

export type { FaqItem } from "@/components/seo/FaqSection";

interface FaqSchemaProps {
  items: FaqItem[];
}

export default function FaqSchema({ items }: FaqSchemaProps) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <FaqSection items={items} />
    </>
  );
}
