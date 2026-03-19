"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export default function NavbarLogo() {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-base font-black tracking-[-0.08em] text-foreground transition-colors hover:text-primary"
      onClick={() => {
        if (pathname === "/") {
          window.dispatchEvent(new CustomEvent("clevr:reset-home"));
        }
      }}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Zap className="h-[18px] w-[18px]" />
      </span>
      <span>
        <span className="text-primary">clevr</span>
        <span className="text-muted-foreground/80">.tools</span>
      </span>
    </Link>
  );
}
