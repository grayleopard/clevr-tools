"use client";

import { useEffect, useRef } from "react";
import { takePendingFile } from "./file-handoff";

/**
 * On component mount, checks for a file handed off by the SmartConverter
 * (via setPendingFile) and passes it to the provided callback.
 *
 * Uses a ref so the callback is always the latest version, avoiding
 * stale-closure issues without needing it in the effect's dep array.
 *
 * Usage in any tool component:
 *   useAutoLoadFile(handleFiles);   // or addFiles, etc.
 */
export function useAutoLoadFile(onFile: (files: File[]) => void): void {
  const onFileRef = useRef(onFile);
  onFileRef.current = onFile;

  useEffect(() => {
    const file = takePendingFile();
    if (file) onFileRef.current([file]);
  }, []); // intentionally empty — runs once on mount
}
