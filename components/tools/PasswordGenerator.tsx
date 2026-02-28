"use client";

import { useState, useCallback, useMemo } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Character sets ─────────────────────────────────────────────────────────

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:',.<>?";
const AMBIGUOUS = "0O1lI";

// ─── Generation helpers ─────────────────────────────────────────────────────

function cryptoRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = cryptoRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePassword(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean
): string {
  let upper = UPPER;
  let lower = LOWER;
  let digits = DIGITS;
  const symbols = SYMBOLS;

  if (excludeAmbiguous) {
    upper = upper
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
    lower = lower
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
    digits = digits
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }

  // Build required sets and full charset
  const requiredSets: string[] = [];
  let charset = "";

  if (useUppercase) {
    requiredSets.push(upper);
    charset += upper;
  }
  if (useLowercase) {
    requiredSets.push(lower);
    charset += lower;
  }
  if (useNumbers) {
    requiredSets.push(digits);
    charset += digits;
  }
  if (useSymbols) {
    requiredSets.push(symbols);
    charset += symbols;
  }

  if (charset.length === 0) return "";

  // Ensure at least one char from each enabled category
  const result: string[] = [];
  for (const set of requiredSets) {
    result.push(set[cryptoRandom(set.length)]);
  }

  // Fill remainder from full charset
  for (let i = result.length; i < length; i++) {
    result.push(charset[cryptoRandom(charset.length)]);
  }

  // Shuffle to randomize required-char positions
  return shuffleArray(result).join("");
}

// ─── Strength calculation ───────────────────────────────────────────────────

type Strength = "very-weak" | "weak" | "fair" | "strong" | "very-strong" | "overkill";

function getPoolSize(
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean
): number {
  let poolSize = 0;
  if (useUppercase) poolSize += UPPER.length;
  if (useLowercase) poolSize += LOWER.length;
  if (useNumbers) poolSize += DIGITS.length;
  if (useSymbols) poolSize += SYMBOLS.length;
  if (excludeAmbiguous && poolSize > 0) poolSize = Math.max(1, poolSize - 8);
  return poolSize;
}

function getStrength(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean
): { label: string; level: Strength; entropy: number; poolSize: number } {
  const poolSize = getPoolSize(useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous);

  if (poolSize === 0) return { label: "None", level: "very-weak", entropy: 0, poolSize: 0 };

  const entropy = length * Math.log2(poolSize);

  if (entropy < 30) return { label: "Very Weak", level: "very-weak", entropy, poolSize };
  if (entropy < 50) return { label: "Weak", level: "weak", entropy, poolSize };
  if (entropy < 70) return { label: "Fair", level: "fair", entropy, poolSize };
  if (entropy < 90) return { label: "Strong", level: "strong", entropy, poolSize };
  if (entropy < 120) return { label: "Very Strong", level: "very-strong", entropy, poolSize };
  return { label: "Overkill", level: "overkill", entropy, poolSize };
}

const strengthBarColors: Record<Strength, string> = {
  "very-weak": "bg-[#EF4444]",
  weak: "bg-[#F97316]",
  fair: "bg-[#EAB308]",
  strong: "bg-[#22C55E]",
  "very-strong": "bg-[#10B981]",
  overkill: "bg-primary",
};

const strengthTextColors: Record<Strength, string> = {
  "very-weak": "text-[#EF4444]",
  weak: "text-[#F97316]",
  fair: "text-[#EAB308]",
  strong: "text-[#22C55E]",
  "very-strong": "text-[#10B981]",
  overkill: "text-primary",
};

const strengthWidthPercent: Record<Strength, string> = {
  "very-weak": "10%",
  weak: "25%",
  fair: "45%",
  strong: "65%",
  "very-strong": "82%",
  overkill: "100%",
};

// ─── Crack time estimate ────────────────────────────────────────────────────

function getCrackTime(length: number, poolSize: number): string {
  if (poolSize === 0 || length === 0) return "N/A";

  // Work in log10 space to avoid overflow
  const logCombinations = length * Math.log10(poolSize);
  const logGuessesPerSecond = 10; // log10(10 billion)
  const logSeconds = logCombinations - logGuessesPerSecond;

  // Beyond ~10^13 years = longer than age of universe
  const logYears = logSeconds - Math.log10(31_557_600); // seconds per year
  if (logYears > 13) return "longer than the age of the universe";

  // Convert to actual number (safe since logSeconds is manageable)
  const seconds = Math.pow(10, logSeconds);

  if (seconds < 1) return "Instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const minutes = seconds / 60;
  if (minutes < 60) return `about ${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `about ${Math.round(hours)} hours`;
  const days = hours / 24;
  if (days < 30) return `about ${Math.round(days)} days`;
  const months = days / 30;
  if (months < 12) return `about ${Math.round(months)} months`;
  const years = days / 365.25;
  if (years < 1000) return `about ${Math.round(years)} years`;
  if (years < 1e6) return `about ${(years / 1000).toFixed(0)} thousand years`;
  if (years < 1e9) return `about ${(years / 1e6).toFixed(0)} million years`;
  if (years < 1e12) return `about ${(years / 1e9).toFixed(0)} billion years`;
  return `about ${(years / 1e12).toFixed(0)} trillion years`;
}

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

  const { password, multiPasswords } = useMemo(() => {
    void regenNonce;

    if (noCharSets) {
      return { password: "", multiPasswords: [] as string[] };
    }

    const pw = generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous);

    const count = parseInt(multiCount, 10);
    if (count > 1) {
      const pws: string[] = [];
      for (let i = 0; i < count; i++) {
        pws.push(generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous));
      }
      return { password: pw, multiPasswords: pws };
    }
    return { password: pw, multiPasswords: [] as string[] };
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous, multiCount, noCharSets, regenNonce]);

  const handleRegenerate = useCallback(() => {
    setRegenNonce((value) => value + 1);
  }, []);

  const strength = useMemo(
    () => getStrength(length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous),
    [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous]
  );

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
            <label className="text-sm font-medium">Length</label>
            <span className="text-sm font-semibold tabular-nums">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
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

        {/* Strength bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Strength</span>
            <span className={`font-semibold ${strengthTextColors[strength.level]}`}>
              {strength.entropy > 0
                ? `${strength.label} · ${Math.round(strength.entropy)} bits`
                : "No characters selected"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthBarColors[strength.level]}`}
              style={{ width: strength.entropy > 0 ? strengthWidthPercent[strength.level] : "0%" }}
            />
          </div>
          {strength.entropy > 0 && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">Estimated crack time: </span>
              <span className="text-sm font-semibold text-foreground">
                {getCrackTime(length, strength.poolSize)}
              </span>
              <div className="text-xs text-muted-foreground mt-0.5">
                at 10 billion guesses per second
              </div>
            </div>
          )}
        </div>
      </div>

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
