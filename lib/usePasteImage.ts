"use client";

import { useEffect, useRef } from "react";
import { addToast } from "@/lib/toast";

/**
 * Listens for document-level paste events and extracts the first image item
 * from the clipboard. Calls `onPaste` with the File and fires a toast via
 * the global toast system.
 *
 * The listener is stable — `onPaste` is stored in a ref so the caller does
 * not need to memoize it.
 */
export function usePasteImage(onPaste: (file: File) => void): void {
  const onPasteRef = useRef(onPaste);
  // Keep the ref up-to-date without re-adding the event listener
  onPasteRef.current = onPaste;

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((i) => i.type.startsWith("image/"));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (!file) return;
      onPasteRef.current(file);
      addToast("Image pasted from clipboard", "info");
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, []); // add listener once; ref keeps onPaste current
}
