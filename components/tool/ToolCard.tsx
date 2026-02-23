import Link from "next/link";
import {
  ImageDown,
  FileImage,
  QrCode,
  Layers,
  FileText,
  Link as LinkIcon,
  Code,
  Minimize2,
  ArrowLeftRight,
  Sparkles,
  Bot,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/tools";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ImageDown,
  FileImage,
  QrCode,
  Layers,
  FileText,
  Link: LinkIcon,
  Code,
  Minimize2,
  ArrowLeftRight,
  Sparkles,
  Bot,
  Smartphone,
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = iconMap[tool.icon] ?? ImageDown;

  return (
    <Link
      href={tool.route}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {tool.badge && (
          <Badge
            variant={tool.badge === "popular" ? "default" : "secondary"}
            className="text-xs capitalize"
          >
            {tool.badge}
          </Badge>
        )}
      </div>
      <div>
        <h3 className="font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>
    </Link>
  );
}
