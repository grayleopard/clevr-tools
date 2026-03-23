import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="px-4 pb-8 sm:px-6 sm:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[1.75rem] border border-[color:var(--ghost-border)] bg-card px-6 py-8 shadow-[var(--shadow-sm)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-black tracking-[-0.08em] text-foreground">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="text-primary">clevr</span>
                  <span className="text-muted-foreground/80">.tools</span>
                </span>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                © {new Date().getFullYear()} clevr.tools. Built for precision.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                All file processing happens in your browser. Your files never leave your device.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground" aria-label="Footer">
              <Link href="/about" className="transition-colors hover:text-primary">
                About
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-primary">
                Privacy
              </Link>
              <Link href="/blog" className="transition-colors hover:text-primary">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
