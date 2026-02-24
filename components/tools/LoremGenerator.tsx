"use client";

import { useState, useCallback } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Lorem ipsum word bank (200+ words) ────────────────────────────────────

const WORDS = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis
nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis
aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur
excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt
mollit anim est laborum perspiciatis unde omnis iste natus error voluptatem
accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo
inventore veritatis quasi architecto beatae vitae dicta explicabo nemo ipsam
quia voluptas aspernatur aut odit fugit consequuntur magni dolores eos ratione
sequi nesciunt neque porro quisquam adipisci numquam eius modi tempora incidunt
labore dolorem magnos quaerat simul cumque cupiditate blanditiis debitis rerum
impedit quo minus id quod maxime placeat facere possimus omnis voluptas assumenda
reprehenderit repellendus temporibus autem quibusdam officiis debitis rerum
necessitibus saepe eveniet ut voluptates repudiandae recusandae itaque earum
hic tenetur sapiente delectus reiciendis voluptatibus maiores alias perferendis
doloribus asperiores repellat fuga perspiciatis corporis suscipit laboriosam nisi
aliquid commodi consequatur quis autem vel eum iure voluptatem nihil molestiae
consequatur vel illum qui dolorem eum fugiat consequuntur magni`.split(/\s+/).filter(Boolean);

// ─── Generation logic ──────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence(): string {
  const len = rand(8, 16);
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(pick());
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function generateParagraph(): string {
  const count = rand(3, 6);
  return Array.from({ length: count }, generateSentence).join(" ");
}

function generate(count: number, type: "paragraphs" | "sentences" | "words"): string {
  if (count <= 0) return "";
  switch (type) {
    case "paragraphs":
      return Array.from({ length: count }, generateParagraph).join("\n\n");
    case "sentences":
      return Array.from({ length: count }, generateSentence).join(" ");
    case "words": {
      const ws: string[] = [];
      for (let i = 0; i < count; i++) ws.push(pick());
      const text = ws.join(" ");
      return text.charAt(0).toUpperCase() + text.slice(1) + ".";
    }
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function LoremGenerator() {
  const [count, setCount] = useState(5);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState<string>(() => generate(5, "paragraphs"));

  const handleGenerate = useCallback(() => {
    setOutput(generate(count, type));
  }, [count, type]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [output]);

  return (
    <div className="space-y-4">
      {/* Config row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 1 && v <= 100) setCount(v);
            }}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors tabular-nums"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "paragraphs" | "sentences" | "words")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate
        </button>
      </div>

      {/* Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">
            {count} {type}
          </p>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          rows={12}
          className="w-full bg-background px-4 py-3 text-sm text-foreground focus:outline-none resize-y min-h-[240px] cursor-text"
        />
      </div>
    </div>
  );
}
