import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight, Menu } from "lucide-react";

interface RelatedToolLink {
  name: string;
  href: string;
}

interface ToolPageLayoutProps {
  categoryName: string;
  categoryHref: string;
  relatedTools: RelatedToolLink[];
  children: ReactNode;
  settingsPanel?: ReactNode;
  infoPanel?: ReactNode;
  settingsTitle?: string;
  infoTitle?: string;
}

function SidebarLinks({
  categoryName,
  categoryHref,
  relatedTools,
}: Pick<ToolPageLayoutProps, "categoryName" | "categoryHref" | "relatedTools">) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Navigation
        </p>
        <div className="mt-4 space-y-2">
          <Link
            href={categoryHref}
            className="flex items-center gap-2 rounded-[1rem] bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            {categoryName}
          </Link>
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center justify-between rounded-[1rem] px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-card/70 hover:text-primary"
            >
              <span>{tool.name}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[1.25rem] bg-card/80 px-4 py-4 text-sm text-muted-foreground">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Private by default
        </p>
        <p className="mt-3 leading-7">
          Files stay in your browser. Nothing is uploaded unless a tool says otherwise.
        </p>
      </div>
    </div>
  );
}

export default function ToolPageLayout({
  categoryName,
  categoryHref,
  relatedTools,
  children,
  settingsPanel,
  infoPanel,
  settingsTitle = "Settings",
  infoTitle = "Tool notes",
}: ToolPageLayoutProps) {
  return (
    <div className="space-y-5">
      <details className="rounded-[1.4rem] bg-muted/55 p-3 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-[1rem] px-3 py-3 text-sm font-semibold text-foreground">
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-primary" />
            Navigation
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </summary>
        <div className="mt-3 rounded-[1.15rem] bg-card/80 p-3">
          <SidebarLinks
            categoryName={categoryName}
            categoryHref={categoryHref}
            relatedTools={relatedTools}
          />
        </div>
      </details>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[1.5rem] bg-muted/55 p-5">
            <SidebarLinks
              categoryName={categoryName}
              categoryHref={categoryHref}
              relatedTools={relatedTools}
            />
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-card/[0.96] p-6 shadow-[var(--shadow-sm)] lg:p-10">
            {children}
          </div>
          <div aria-hidden="true" className="hidden h-[90px] lg:block" />
        </div>

        <aside className="space-y-6 lg:pt-0">
          <div className="lg:sticky lg:top-24 lg:space-y-6">
            {settingsPanel ? (
              <div className="rounded-[1.5rem] bg-muted/55 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {settingsTitle}
                </p>
                <div className="mt-4">{settingsPanel}</div>
              </div>
            ) : null}

            <div aria-hidden="true" className="hidden min-h-[320px] lg:block" />

            {infoPanel ? (
              <div className="rounded-[1.5rem] bg-muted/55 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {infoTitle}
                </p>
                <div className="mt-4">{infoPanel}</div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
