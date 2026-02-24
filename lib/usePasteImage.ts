"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Listens for document-level paste events and extracts the first image item
 * from the clipboard. Calls `onPaste` with the File and briefly surfaces a
 * toast flag so callers can show feedback to the user.
 *
 * The listener is stable — `onPaste` is stored in a ref so the caller does
 * not need to memoize it.
 */
export function usePasteImage(onPaste: (file: File) => void): {
  pasteToast: boolean;
} {
  const [pasteToast, setPasteToast] = useState(false);
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
      setPasteToast(true);
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, []); // add listener once; ref keeps onPaste current

  useEffect(() => {
    if (!pasteToast) return;
    const id = setTimeout(() => setPasteToast(false), 2200);
    return () => clearTimeout(id);
  }, [pasteToast]);

  return { pasteToast };
}
