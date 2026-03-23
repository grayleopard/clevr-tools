// components/xray/FileXRay.tsx
//
// Two exports:
//   default FileXRay      — full panel (trigger + analyzing + results)
//                           Used on most PDF pages directly below the tool.
//   FileXRayTrigger       — just the ✦ button; import this into tools that
//                           need the button inline (e.g. next to "Convert to JPG").
//                           When used, pass showTrigger={false} to <FileXRay />.

"use client";

import React from "react";
import { usePdfXRayContext } from "@/lib/xray/pdf-xray-context";
import { TipJar } from "@/components/tool/TipJar";
import type { XRayResponse, Finding } from "@/lib/xray/types";

// Tool slug → route mapping
const TOOL_ROUTES: Record<string, string> = {
  "compress-pdf": "/compress/pdf",
  "split-pdf": "/tools/split-pdf",
  "merge-pdf": "/tools/merge-pdf",
  "rotate-pdf": "/tools/rotate-pdf",
  "pdf-to-jpg": "/convert/pdf-to-jpg",
  "pdf-to-fillable": "/tools/pdf-to-fillable",
};

function isPDFFile(file: File | null): boolean {
  if (!file) return false;
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

// ─── STANDALONE TRIGGER (for inline placement in tools) ──────
export function FileXRayTrigger() {
  const ctx = usePdfXRayContext();
  if (!ctx || !isPDFFile(ctx.file) || ctx.analysisState !== "idle") return null;

  return (
    <button
      onClick={() => ctx.startAnalysis()}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--clr-accent)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--clr-accent)] hover:bg-[var(--clr-accent-muted)] transition-all"
    >
      <span className="text-base leading-none">✦</span>
      <span>X-Ray this file</span>
    </button>
  );
}

// ─── MAIN PANEL ──────────────────────────────────────────────
interface FileXRayProps {
  /** Set false when <FileXRayTrigger> is already rendered inline in the tool. */
  showTrigger?: boolean;
}

export default function FileXRay({ showTrigger = true }: FileXRayProps) {
  const ctx = usePdfXRayContext();

  if (!ctx || !isPDFFile(ctx.file)) return null;

  const { analysisState, result, error, startAnalysis, resetAnalysis } = ctx;

  // Nothing to show: no file loaded, or idle with trigger handled elsewhere
  if (analysisState === "idle" && !showTrigger) return null;

  return (
    <div className="w-full mt-6">
      {analysisState === "idle" && showTrigger && ctx.file && (
        <XRayTrigger fileName={ctx.file.name} onTrigger={startAnalysis} />
      )}

      {analysisState === "analyzing" && <XRayAnalyzing />}

      {analysisState === "complete" && result && (
        <XRayResults result={result} onReset={resetAnalysis} />
      )}

      {analysisState === "error" && (
        <XRayErrorDisplay
          error={error || "An error occurred"}
          onRetry={startAnalysis}
          onDismiss={resetAnalysis}
        />
      )}
    </div>
  );
}

// ─── TRIGGER SECTION ─────────────────────────────────────────
function XRayTrigger({
  fileName,
  onTrigger,
}: {
  fileName: string;
  onTrigger: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--clr-accent)]/30 bg-[var(--clr-accent-muted)]/50 p-5 flex flex-col items-center gap-3">
      <button
        onClick={onTrigger}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--clr-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--clr-accent-hover)] hover:-translate-y-px transition-all"
      >
        <span className="text-base leading-none">✦</span>
        <span>X-Ray this file</span>
      </button>
      <p className="text-xs text-[var(--text-tertiary)] text-center max-w-sm leading-relaxed">
        AI-powered insights for{" "}
        <span className="font-medium text-[var(--text-secondary)]">{fileName}</span>.
        Nothing is stored — your file is analyzed in memory only.
      </p>
    </div>
  );
}

// ─── ANALYZING ANIMATION ─────────────────────────────────────
function XRayAnalyzing() {
  return (
    <div className="flex flex-col items-center gap-5 py-12 px-8">
      {/* Document silhouette */}
      <div
        className="relative w-[120px] h-[160px] rounded-lg overflow-hidden border border-[var(--border-default)]"
        style={{ background: "var(--doc-bg)" }}
      >
        {/* Faux text lines */}
        {[70, 90, 55, 80, 45, 85, 65, 75, 40, 90, 60, 70].map((w, i) => (
          <div
            key={i}
            className="absolute left-[10px] h-[2px] rounded-full"
            style={{
              top: `${10 + i * 12}px`,
              width: `calc(${w}% - 20px)`,
              background: "var(--doc-line)",
            }}
          />
        ))}
        {/* Scan beam */}
        <div
          className="absolute left-0 right-0 h-[3px] animate-[xray-scan_2.2s_ease-in-out_infinite] will-change-[top,opacity]"
          style={{
            background: "var(--scan-line)",
            boxShadow: "0 0 12px 4px var(--scan-line), 0 0 40px 8px var(--scan-glow)",
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Scanning your document<span className="animate-pulse">...</span>
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Your file is analyzed in memory only
        </p>
      </div>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────
function XRayResults({
  result,
  onReset,
}: {
  result: XRayResponse;
  onReset: () => void;
}) {
  const { fileFacts, analysis, processingTime } = result;

  const facts = [
    { value: String(fileFacts.pageCount), label: "PAGES" },
    { value: fileFacts.fileSize, label: "FILE SIZE" },
    { value: fileFacts.estimatedReadTime, label: "READ TIME" },
    ...(fileFacts.createdDate ? [{ value: fileFacts.createdDate, label: "CREATED" }] : []),
    ...(fileFacts.imageCount > 0 ? [{ value: String(fileFacts.imageCount), label: "IMAGES" }] : []),
  ];

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--clr-accent)]">✦</span>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">X-Ray Analysis</h3>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--clr-accent-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--clr-accent)]">
          {analysis.documentType}
        </span>
      </div>

      {/* 2. File Facts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden border border-[var(--border-default)] bg-[var(--border-default)]">
        {facts.map((fact, i) => (
          <div key={i} className="flex flex-col gap-0.5 px-3 py-2.5 bg-[var(--bg-elevated)]">
            <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{fact.value}</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">{fact.label}</span>
          </div>
        ))}
      </div>

      {/* 3. Summary */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {analysis.oneLinerSummary}
      </p>

      {/* 4. Key Findings */}
      {analysis.keyFindings.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Key Findings
          </h4>
          <div className="flex flex-col gap-2">
            {analysis.keyFindings.map((f, i) => (
              <FindingCard key={i} finding={f} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Deep Analysis (blurred premium) */}
      {analysis.deepAnalysis.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Deep Analysis
            </h4>
            <span className="text-[11px] font-semibold text-[var(--clr-accent)] bg-[var(--clr-accent-muted)] px-2 py-0.5 rounded-full">
              ✦ Premium
            </span>
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <div className="blur-sm select-none pointer-events-none flex flex-col gap-2">
              {analysis.deepAnalysis.map((f, i) => (
                <FindingCard key={i} finding={f} />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] text-center max-w-xs leading-relaxed">
                Unlock deeper insights including metadata analysis and structural comparisons.
              </p>
              <button className="px-5 py-2 rounded-lg border border-[var(--clr-accent)]/40 text-[var(--clr-accent)] text-sm font-medium hover:bg-[var(--clr-accent)] hover:text-white transition-colors">
                Unlock with clevr Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Suggested Actions — horizontal chips */}
      {analysis.suggestedActions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            What would you like to do?
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  const route = TOOL_ROUTES[action.toolSlug];
                  if (route) window.open(route, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--clr-accent)]/30 bg-[var(--clr-accent-muted)] px-3 py-1.5 text-xs font-medium text-[var(--clr-accent)] hover:bg-[var(--clr-accent)] hover:text-white transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-[var(--border-default)]">
        <p className="text-[11px] text-[var(--text-tertiary)]">
          These insights are for informational purposes. Verify important details independently.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            Analyzed with Claude <span className="text-amber-500">✦</span>
          </span>
          <span className="text-[11px] text-[var(--border-strong)]">
            {(processingTime / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
      <button onClick={onReset} className="self-center text-xs text-[var(--clr-accent)] hover:underline">
        Run X-Ray again
      </button>

      <TipJar />
    </div>
  );
}

// ─── FINDING CARD ────────────────────────────────────────────
function FindingCard({ finding }: { finding: Finding }) {
  const icons: Record<string, string> = {
    risk: "⚠",
    key_term: "●",
    notable: "◆",
    metadata: "◇",
    structural: "□",
  };
  const isRisk = finding.category === "risk";

  return (
    <div
      className={`flex gap-2.5 rounded-lg border-l-2 p-3 ${
        isRisk
          ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-[var(--border-default)] bg-[var(--bg-elevated)]"
      }`}
    >
      <span className={`text-xs mt-0.5 shrink-0 ${isRisk ? "text-amber-500" : "text-[var(--text-tertiary)]"}`}>
        {icons[finding.category] ?? "●"}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-[var(--text-primary)] leading-snug">{finding.insight}</p>
        {finding.pageReference && (
          <span className="text-xs text-[var(--text-tertiary)]">{finding.pageReference}</span>
        )}
      </div>
    </div>
  );
}

// ─── ERROR DISPLAY ───────────────────────────────────────────
function XRayErrorDisplay({
  error,
  onRetry,
  onDismiss,
}: {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5 flex flex-col items-center gap-4">
      <p className="text-sm text-red-700 dark:text-red-400 text-center">{error}</p>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-lg bg-[var(--clr-accent)] text-white text-sm font-medium hover:bg-[var(--clr-accent-hover)] transition-colors"
        >
          Try again
        </button>
        <button
          onClick={onDismiss}
          className="px-5 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] text-sm hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
