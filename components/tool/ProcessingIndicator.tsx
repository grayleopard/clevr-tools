export default function ProcessingIndicator({ label = "Processing…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative h-12 w-12">
        {/* Expanding pulse ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
        {/* Static track */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
        {/* Spinning indicator */}
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}
