export default function AdSlot({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-xs text-muted-foreground ${className ?? ""}`}
      style={{ minHeight: 90 }}
      aria-label="Advertisement"
    >
      Advertisement
    </div>
  );
}
