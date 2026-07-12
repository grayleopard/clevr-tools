import Link from "next/link";
import { Cloud } from "lucide-react";
import { getToolIcon } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";
import { getPrivacyContext, type Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool.icon);
  const usesServer = getPrivacyContext(tool) === "server";

  return (
    <Link
      href={tool.route}
      className="group flex flex-col gap-4 rounded-xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-[var(--ambient-shadow)]"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-center gap-1.5">
          {usesServer && (
            <Badge
              variant="outline"
              className="gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              title="Uses a server-side AI model for this one tool"
            >
              <Cloud className="h-3 w-3" />
              Server
            </Badge>
          )}
          {tool.badge && (
            <Badge
              variant={tool.badge === "popular" ? "default" : "secondary"}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] capitalize"
            >
              {tool.badge}
            </Badge>
          )}
        </div>
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
