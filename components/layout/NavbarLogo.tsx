"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export default function NavbarLogo() {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold"
      onClick={() => {
        if (pathname === "/") {
          window.dispatchEvent(new CustomEvent("clevr:reset-home"));
        }
      }}
    >
      <Zap className="h-5 w-5 text-primary" />
      <span>
        <span className="text-primary">clevr</span>
        <span className="text-muted-foreground">.tools</span>
      </span>
    </Link>
  );
}
