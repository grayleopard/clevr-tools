import Link from "next/link";
import { getToolIcon } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool.icon);

  return (
    <Link
      href={tool.route}
      className="group flex flex-col gap-4 rounded-xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-[var(--ambient-shadow)]"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {tool.badge && (
          <Badge
            variant={tool.badge === "popular" ? "default" : "secondary"}
            className="text-[10px] font-semibold uppercase tracking-[0.18em] capitalize"
          >
            {tool.badge}
          </Badge>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {tool.name}
        </h3>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          {tool.shortDescription}
        </p>
      </div>
    </Link>
  );
}
