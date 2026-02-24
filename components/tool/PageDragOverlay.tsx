"use client";

import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";

interface PageDragOverlayProps {
  onFiles: (files: File[]) => void;
}

/**
 * Listens for document-level drag-and-drop events and shows a full-page
 * overlay when the user drags files over the browser window. On drop,
 * calls `onFiles` with the dropped files — same as if they'd used the
 * FileDropZone. Uses a ref-stable pattern so the listener is added once.
 */
export default function PageDragOverlay({ onFiles }: PageDragOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const counterRef = useRef(0);
  const onFilesRef = useRef(onFiles);
  onFilesRef.current = onFiles;

  useEffect(() => {
    const onEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      counterRef.current++;
      setIsDragging(true);
    };
    const onLeave = () => {
      counterRef.current = Math.max(0, counterRef.current - 1);
      if (counterRef.current === 0) setIsDragging(false);
    };
    const onOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      counterRef.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) onFilesRef.current(files);
    };

    document.addEventListener("dragenter", onEnter);
    document.addEventListener("dragleave", onLeave);
    document.addEventListener("dragover", onOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragenter", onEnter);
      document.removeEventListener("dragleave", onLeave);
      document.removeEventListener("dragover", onOver);
      document.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!isDragging) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-primary/5 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary bg-background/90 px-12 py-8 shadow-2xl">
        <Upload className="h-8 w-8 text-primary animate-bob" />
        <p className="text-base font-semibold text-primary">Drop your file anywhere</p>
      </div>
    </div>
  );
}
