export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

export default function FaqSection({ items }: FaqSectionProps) {
  if (!items.length) return null;

  return (
    <section
      aria-labelledby="frequently-asked-questions"
      className="mt-10 border-t border-border pt-8"
    >
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Helpful answers
        </p>
        <h2
          id="frequently-asked-questions"
          className="mt-2 text-xl font-semibold tracking-tight text-foreground"
        >
          Frequently asked questions
        </h2>
      </div>

      <dl className="mt-6 grid gap-4">
        {items.map((item) => (
          <div
            key={item.question}
            className="rounded-2xl bg-muted/55 p-5 sm:p-6"
          >
            <dt className="text-sm font-semibold leading-6 text-foreground">
              {item.question}
            </dt>
            <dd className="mt-2 text-sm leading-7 text-muted-foreground">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
