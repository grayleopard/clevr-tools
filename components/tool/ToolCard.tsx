import Link from "next/link";
import {
  ImageDown,
  FileImage,
  QrCode,
  Layers,
  FileText,
  Link as LinkIcon,
  Link2,
  Code,
  Minimize2,
  ArrowLeftRight,
  Sparkles,
  Bot,
  Smartphone,
  GitMerge,
  Scissors,
  RotateCw,
  Scaling,
  FileOutput,
  FileStack,
  Hash,
  CaseSensitive,
  AlignLeft,
  Eraser,
  Type,
  Braces,
  Replace,
  ArrowUpDown,
  Binary,
  KeyRound,
  Dices,
  Pipette,
  Percent,
  Calculator,
  Timer,
  Watch,
  Brain,
  Cake,
  CalendarDays,
  Fingerprint,
  Scale,
  Home,
  Receipt,
  Tag,
  TrendingUp,
  GraduationCap,
  Keyboard,
  Maximize2,
  Crop,
  DollarSign,
  Wallet,
  Landmark,
  Car,
  CreditCard,
  PiggyBank,
  BarChart3,
  CalendarCheck,
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
  Link2,
  Code,
  Minimize2,
  ArrowLeftRight,
  Sparkles,
  Bot,
  Smartphone,
  GitMerge,
  Scissors,
  RotateCw,
  Scaling,
  FileOutput,
  FileStack,
  Hash,
  CaseSensitive,
  AlignLeft,
  Eraser,
  Type,
  Braces,
  Replace,
  ArrowUpDown,
  Binary,
  KeyRound,
  Dices,
  Pipette,
  Percent,
  Calculator,
  Timer,
  Watch,
  Brain,
  Cake,
  CalendarDays,
  Fingerprint,
  Scale,
  Home,
  Receipt,
  Tag,
  TrendingUp,
  GraduationCap,
  Keyboard,
  Maximize2,
  Crop,
  DollarSign,
  Wallet,
  Landmark,
  Car,
  CreditCard,
  PiggyBank,
  BarChart3,
  CalendarCheck,
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = iconMap[tool.icon] ?? ImageDown;

  return (
    <Link
      href={tool.route}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:hover:border-emerald-500/40 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {tool.badge && (
          <Badge
            variant={tool.badge === "popular" ? "default" : "secondary"}
            className="text-xs capitalize dark:bg-emerald-500/10 dark:text-emerald-400"
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
