"use client";

import { useMemo } from "react";
import { getRelatedTools, getToolBySlug } from "@/lib/tools";
import ToolCard from "@/components/tool/ToolCard";

interface RelatedToolsPanelProps {
  toolSlug: string;
}

export default function RelatedToolsPanel({ toolSlug }: RelatedToolsPanelProps) {
  const relatedTools = useMemo(() => {
    const tool = getToolBySlug(toolSlug);
    if (!tool) return [];
    return getRelatedTools(tool).slice(0, 3);
  }, [toolSlug]);

  if (relatedTools.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">You might also need:</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
