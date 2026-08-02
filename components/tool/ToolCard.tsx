import Link from "next/link";
import { Cloud } from "lucide-react";
import { defaultToolIcon, toolIconMap } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";
import { getPrivacyContext, type Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = toolIconMap[tool.icon] ?? defaultToolIcon;
  const usesServer = getPrivacyContext(tool) === "server";

  return (
    <Link
      href={tool.route}
      className="group flex min-w-0 flex-col gap-4 rounded-xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-[var(--ambient-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-1.5">
          {usesServer && (
            <Badge
              variant="outline"
              className="gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              title="Uses a server-side AI model for this one tool"
            >
              <Cloud className="h-3 w-3" aria-hidden="true" />
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
      <div className="min-w-0">
        <h3 className="break-words text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {tool.name}
        </h3>
        <p className="mt-2 break-words text-xs leading-6 text-muted-foreground">
          {tool.shortDescription}
        </p>
      </div>
    </Link>
  );
}
