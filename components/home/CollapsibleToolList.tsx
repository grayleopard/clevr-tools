interface CollapsibleToolListProps {
  previewCount?: number;
  children: React.ReactNode[];
}

export default function CollapsibleToolList({
  previewCount = 3,
  children,
}: CollapsibleToolListProps) {
  return (
    <>
      {children.map((child, i) => (
        <div
          key={i}
          className={i >= previewCount ? "sr-only md:not-sr-only" : undefined}
        >
          {child}
        </div>
      ))}
    </>
  );
}
