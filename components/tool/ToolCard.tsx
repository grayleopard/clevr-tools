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
  Flame,
  Apple,
  Baby,
  Heart,
  Moon,
  Footprints,
  Ruler,
  Thermometer,
  Weight,
  Clock,
  Gauge,
  Zap,
  Compass,
  Activity,
  Dumbbell,
  Beef,
  BookOpen,
  Flag,
  Code2,
  MousePointer2,
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
  Flame,
  Apple,
  Baby,
  Heart,
  Moon,
  Footprints,
  Ruler,
  Thermometer,
  Weight,
  Clock,
  Gauge,
  Zap,
  Compass,
  Activity,
  Dumbbell,
  Beef,
  BookOpen,
  Flag,
  Code2,
  MousePointer2,
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = iconMap[tool.icon] ?? ImageDown;

  return (
    <Link
      href={tool.route}
      className="group flex flex-col gap-4 rounded-xl border border-[color:var(--ghost-border)] bg-card p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-[var(--ambient-shadow)]"
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
