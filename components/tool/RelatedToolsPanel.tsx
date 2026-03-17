import { getRelatedTools, getToolBySlug } from "@/lib/tools";
import ToolCard from "@/components/tool/ToolCard";

interface RelatedToolsPanelProps {
  toolSlug: string;
}

export default function RelatedToolsPanel({ toolSlug }: RelatedToolsPanelProps) {
  const tool = getToolBySlug(toolSlug);
  if (!tool) return null;

  const relatedTools = getRelatedTools(tool).slice(0, 3);
  if (relatedTools.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">You might also need:</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedTools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </div>
  );
}
