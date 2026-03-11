"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { XRayResponse, XRayResult } from "./types";

export type AnalysisState = "idle" | "analyzing" | "complete" | "error";

type PdfXRayContextValue = {
  // File — set by FileDropZone when a file is loaded
  file: File | null;
  setFile: (f: File | null) => void;
  // Analysis — driven by startAnalysis(), read by FileXRay / FileXRayTrigger
  analysisState: AnalysisState;
  result: XRayResponse | null;
  error: string | null;
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
};

const PdfXRayContext = createContext<PdfXRayContextValue | null>(null);

export function PdfXRayProvider({ children }: { children: React.ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const fileRef = useRef<File | null>(null);

  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<XRayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setFile = useCallback((f: File | null) => {
    fileRef.current = f;
    setFileState(f);
    // Reset analysis whenever the file changes
    setAnalysisState("idle");
    setResult(null);
    setError(null);
  }, []);

  const startAnalysis = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;

    setAnalysisState("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/xray", {
        method: "POST",
        body: formData,
      });

      const data: XRayResult = await response.json();

      if (data.success) {
        setResult(data);
        setAnalysisState("complete");
      } else {
        setError(data.error);
        setAnalysisState("error");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setAnalysisState("error");
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisState("idle");
    setResult(null);
    setError(null);
  }, []);

  return (
    <PdfXRayContext.Provider
      value={{ file, setFile, analysisState, result, error, startAnalysis, resetAnalysis }}
    >
      {children}
    </PdfXRayContext.Provider>
  );
}

/** Returns context value, or null when used outside a PdfXRayProvider. */
export function usePdfXRayContext() {
  return useContext(PdfXRayContext);
}
