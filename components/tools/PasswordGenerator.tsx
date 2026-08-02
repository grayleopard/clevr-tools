"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { addToast } from "@/lib/toast";
import { TipJar } from "@/components/tool/TipJar";
import {
  generatePassword,
  passwordSearchSpaceBits,
  type PasswordOptions,
} from "@/lib/p1-remediation/secure-random";

// ─── Component ──────────────────────────────────────────────────────────────

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);
  const [multiCount, setMultiCount] = useState<"1" | "5" | "10">("1");
  const [regenNonce, setRegenNonce] = useState(0);

  const noCharSets = !useUppercase && !useLowercase && !useNumbers && !useSymbols;
  const passwordOptions = useMemo<PasswordOptions>(() => ({
    length,
    useUppercase,
    useLowercase,
    useNumbers,
    useSymbols,
    excludeAmbiguous,
  }), [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous]);

  // crypto.getRandomValues() must not run during render — the server and the
  // client would each compute a different random password, guaranteeing a
  // hydration mismatch on every load. Generate client-only, in an effect,
  // matching UUIDGenerator.tsx's established pattern for this codebase. One
  // combined state object so the effect makes a single setState call.
  const [{ password, multiPasswords }, setGenerated] = useState<{ password: string; multiPasswords: string[] }>({
    password: "",
    multiPasswords: [],
  });

  useEffect(() => {
    void regenNonce;

    if (noCharSets) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- crypto.getRandomValues() is unavailable during SSR render, so generation can only happen client-side in an effect
      setGenerated({ password: "", multiPasswords: [] });
      return;
    }

    const pw = generatePassword(passwordOptions);

    const count = parseInt(multiCount, 10);
    if (count > 1) {
      const pws: string[] = [];
      for (let i = 0; i < count; i++) {
        pws.push(generatePassword(passwordOptions));
      }
      setGenerated({ password: pw, multiPasswords: pws });
    } else {
      setGenerated({ password: pw, multiPasswords: [] });
    }
  }, [multiCount, noCharSets, passwordOptions, regenNonce]);

  const handleRegenerate = useCallback(() => {
    setRegenNonce((value) => value + 1);
  }, []);

  const searchSpaceBits = noCharSets ? 0 : passwordSearchSpaceBits(passwordOptions);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        addToast("Copied to clipboard", "success");
        setTimeout(() => setCopied(false), 1500);
      } catch {
        addToast("Failed to copy", "error");
      }
    },
    []
  );

  const handleCopyMulti = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast("Copied to clipboard", "success");
      } catch {
        addToast("Failed to copy", "error");
      }
    },
    []
  );

  return (
    <div className="space-y-5">
      {/* Password display */}
      <div className="rounded-xl border border-border bg-card p-5">
        {noCharSets ? (
          <div className="flex items-center justify-center py-6 text-sm text-red-500 font-medium">
            Enable at least one character type
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <span className="flex-1 break-all font-mono text-lg select-all dark:text-emerald-500">{password}</span>
              <button
                onClick={() => handleCopy(password)}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Copy"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy
              </button>
              <button
                onClick={handleRegenerate}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        {/* Length slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password-length" className="text-sm font-medium">Length</label>
            <span className="text-sm font-semibold tabular-nums">{length}</span>
          </div>
          <input
            id="password-length"
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            aria-describedby="password-length-range"
            className="w-full accent-primary"
          />
          <div id="password-length-range" className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character toggles */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Character Types</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => setUseUppercase(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              Uppercase (A-Z)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => setUseLowercase(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              Lowercase (a-z)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              Numbers (0-9)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              Symbols (!@#$...)
            </label>
          </div>
        </div>

        {/* Exclude ambiguous */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            className="accent-primary h-4 w-4"
          />
          <span>
            Exclude ambiguous characters{" "}
            <span className="font-mono text-muted-foreground">(0, O, 1, l, I)</span>
          </span>
        </label>

        {/* Distribution information */}
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">Valid-password search space</span>
            <span className="font-semibold tabular-nums text-primary">
              {searchSpaceBits > 0 ? `${searchSpaceBits.toFixed(1)} bits` : "No characters selected"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This is log2 of the exact number of possible passwords that contain every selected character type.
            Generation is uniform across that valid set using Web Crypto. It is not a crack-time prediction.
          </p>
        </div>
      </div>

      <TipJar />

      {/* Multi-generate */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Generate multiple</label>
          <div className="flex gap-2">
            {(["1", "5", "10"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setMultiCount(c)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  multiCount === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {multiPasswords.length > 0 && (
          <div className="space-y-2">
            {multiPasswords.map((pw, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <span className="flex-1 break-all font-mono text-sm select-all">{pw}</span>
                <button
                  onClick={() => handleCopyMulti(pw)}
                  className="flex shrink-0 items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
