"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLockup from "@/components/brand/BrandLockup";

export default function NavbarLogo() {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className="group flex items-center gap-3 py-1 font-display text-[1.55rem] font-black tracking-[-0.075em] text-foreground transition-colors hover:text-primary"
      onClick={() => {
        if (pathname === "/") {
          window.dispatchEvent(new CustomEvent("clevr:reset-home"));
        }
      }}
    >
      <BrandLockup />
    </Link>
  );
}
