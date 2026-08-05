"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <span className="grid size-6 rotate-45 place-items-center border-2 border-primary transition-transform duration-200 group-hover:rotate-[135deg] motion-reduce:transition-none">
        <span className="size-2 bg-primary" />
      </span>
      <span>
        <span>clevr</span>
        <span className="text-primary">.tools</span>
      </span>
    </Link>
  );
}
