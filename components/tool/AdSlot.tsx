"use client";

import { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  className?: string;
}

/**
 * Renders a Google AdSense responsive display ad.
 * Only initialises on the client to avoid SSR/hydration issues.
 */
export default function AdSlot({ className }: AdSlotProps) {
  // Defer rendering the <ins> element to the client so SSR never emits it,
  // preventing hydration mismatches if AdSense modifies the node.
  const [mounted, setMounted] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch {
      // Ad blocker or script not yet loaded — safe to ignore
    }
  }, [mounted]);

  if (!mounted) {
    // Server-side / pre-mount placeholder keeps layout stable
    return (
      <div
        className={`rounded-lg ${className ?? ""}`}
        style={{ minHeight: 90 }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3368800894893070"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
