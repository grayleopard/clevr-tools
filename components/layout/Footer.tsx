import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--ghost-border)]">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 font-display text-lg font-black tracking-[-0.075em] text-foreground">
                <span className="grid size-5 rotate-45 place-items-center border-2 border-primary">
                  <span className="size-1.5 bg-primary" />
                </span>
                <span>
                  <span className="text-primary">clevr</span>
                  <span className="text-muted-foreground/80">.tools</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} clevr.tools
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Each tool explains where processing happens before you begin. Browser-local tools keep your files on this device.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-muted-foreground" aria-label="Footer">
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
