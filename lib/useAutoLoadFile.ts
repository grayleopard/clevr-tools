"use client";

import { useEffect, useRef } from "react";
import { takePendingFile } from "./file-handoff";

/**
 * On component mount, checks for a file handed off by the SmartConverter
 * (via setPendingFile) and passes it to the provided callback. Targeted
 * Smart Converter envelopes are revalidated against the mounted pathname
 * before they can bypass a destination's normal picker.
 *
 * Uses a ref so the callback is always the latest version, avoiding
 * stale-closure issues without needing it in the effect's dep array.
 *
 * Usage in any tool component:
 *   useAutoLoadFile(handleFiles);   // or addFiles, etc.
 */
export function useAutoLoadFile(onFile: (files: File[]) => void): void {
  const onFileRef = useRef(onFile);

  useEffect(() => {
    onFileRef.current = onFile;
  }, [onFile]);

  useEffect(() => {
    const targetRoute = typeof window === "undefined" ? undefined : window.location.pathname;
    const file = takePendingFile({ targetRoute });
    if (file) onFileRef.current([file]);
  }, []); // intentionally empty — runs once on mount
}
