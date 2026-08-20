import Link from "next/link";
import BrandLockup from "@/components/brand/BrandLockup";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--ghost-border)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 py-1 font-display text-[1.4rem] font-black tracking-[-0.075em] text-foreground transition-colors hover:text-primary"
              aria-label="clevr.tools home"
            >
              <BrandLockup markClassName="size-7" />
            </Link>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} clevr.tools
            </p>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Each tool states where processing happens before you begin. Browser-local tools keep your files on this device.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-muted-foreground" aria-label="Footer">
            <Link href="/about" className="transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/methodology" className="transition-colors hover:text-primary">
              Methodology
            </Link>
            <Link href="/blog" className="transition-colors hover:text-primary">
              Blog
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
