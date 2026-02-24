"use client";

import { ClipboardCheck } from "lucide-react";

interface PasteToastProps {
  show: boolean;
}

/**
 * Fixed-position toast that appears briefly when the user pastes an image
 * via Ctrl/Cmd+V. Relies on the parent to control `show` (typically driven
 * by the `pasteToast` flag from `usePasteImage`).
 */
export function PasteToast({ show }: PasteToastProps) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-xl">
        <ClipboardCheck className="h-4 w-4 shrink-0" />
        Image pasted!
      </div>
    </div>
  );
}
