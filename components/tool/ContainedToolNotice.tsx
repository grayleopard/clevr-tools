interface ContainedToolNoticeProps {
  title: string;
  children: React.ReactNode;
}

export default function ContainedToolNotice({
  title,
  children,
}: ContainedToolNoticeProps) {
  return (
    <section
      role="status"
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 max-w-2xl space-y-3 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
