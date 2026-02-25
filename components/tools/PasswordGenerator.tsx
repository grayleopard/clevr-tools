"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
  let symbols = SYMBOLS;

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

type Strength = "weak" | "fair" | "strong" | "very-strong";

function getStrength(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean
): { label: string; level: Strength; entropy: number } {
  let poolSize = 0;
  if (useUppercase) poolSize += excludeAmbiguous ? UPPER.length - 2 : UPPER.length;
  if (useLowercase) poolSize += excludeAmbiguous ? LOWER.length - 1 : LOWER.length;
  if (useNumbers) poolSize += excludeAmbiguous ? DIGITS.length - 2 : DIGITS.length;
  if (useSymbols) poolSize += SYMBOLS.length;

  if (poolSize === 0) return { label: "None", level: "weak", entropy: 0 };

  const entropy = length * Math.log2(poolSize);

  if (entropy < 40) return { label: "Weak", level: "weak", entropy };
  if (entropy < 60) return { label: "Fair", level: "fair", entropy };
  if (entropy < 80) return { label: "Strong", level: "strong", entropy };
  return { label: "Very Strong", level: "very-strong", entropy };
}

const strengthColors: Record<Strength, string> = {
  weak: "bg-red-500",
  fair: "bg-orange-500",
  strong: "bg-green-500",
  "very-strong": "bg-emerald-600",
};

const strengthWidths: Record<Strength, string> = {
  weak: "w-1/4",
  fair: "w-2/4",
  strong: "w-3/4",
  "very-strong": "w-full",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [multiCount, setMultiCount] = useState<"1" | "5" | "10">("1");
  const [multiPasswords, setMultiPasswords] = useState<string[]>([]);

  const noCharSets = !useUppercase && !useLowercase && !useNumbers && !useSymbols;

  const regenerate = useCallback(() => {
    if (noCharSets) {
      setPassword("");
      setMultiPasswords([]);
      return;
    }
    const pw = generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous);
    setPassword(pw);

    const count = parseInt(multiCount, 10);
    if (count > 1) {
      const pws: string[] = [];
      for (let i = 0; i < count; i++) {
        pws.push(generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous));
      }
      setMultiPasswords(pws);
    } else {
      setMultiPasswords([]);
    }
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous, multiCount, noCharSets]);

  // Auto-generate on mount and when settings change
  useEffect(() => {
    regenerate();
  }, [regenerate]);

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
              <span className="flex-1 break-all font-mono text-lg select-all">{password}</span>
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
                onClick={regenerate}
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
            <span className="font-semibold">{strength.label}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthColors[strength.level]} ${strengthWidths[strength.level]}`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {strength.entropy > 0
              ? `~${Math.round(strength.entropy)} bits of entropy`
              : "No characters selected"}
          </p>
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
              onClick={regenerate}
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
