import Link from "next/link";
import { ArrowRight, Cloud } from "lucide-react";
import { defaultToolIcon, toolIconMap } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";
import { getPrivacyContext, type Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = toolIconMap[tool.icon] ?? defaultToolIcon;
  const usesServer = getPrivacyContext(tool) === "server";

  return (
    <Link
      href={tool.route}
      className="group grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_1.25rem] items-start gap-4 border-b border-[color:var(--ghost-border)] bg-transparent py-5 transition-[background-color,color] duration-200 hover:bg-primary/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
    >
      <div className="grid size-9 place-items-center border border-primary/35 bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="break-words text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {tool.name}
          </h3>
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
        <p className="mt-2 break-words text-xs leading-6 text-muted-foreground">
          {tool.shortDescription}
        </p>
      </div>
      <ArrowRight className="mt-2 size-4 text-primary transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
    </Link>
  );
}
