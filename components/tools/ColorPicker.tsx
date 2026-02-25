"use client";

import { useState, useCallback, useRef } from "react";
import { Copy } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Color conversion utilities ─────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => {
        const h = Math.max(0, Math.min(255, Math.round(c))).toString(16);
        return h.length === 1 ? "0" + h : h;
      })
      .join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHsb(
  r: number,
  g: number,
  b: number
): { h: number; s: number; b: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
}

function hsbToRgb(
  h: number,
  s: number,
  bVal: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  bVal /= 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = bVal * (1 - s);
  const q = bVal * (1 - f * s);
  const t = bVal * (1 - (1 - f) * s);

  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0:
      r = bVal;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = bVal;
      b = p;
      break;
    case 2:
      r = p;
      g = bVal;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = bVal;
      break;
    case 4:
      r = t;
      g = p;
      b = bVal;
      break;
    case 5:
      r = bVal;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ColorPicker() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [hsb, setHsb] = useState({ h: 217, s: 76, b: 96 });
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState("#3b82f6");

  const lastAddedRef = useRef<string>("");

  const addToRecent = useCallback(
    (color: string) => {
      if (color === lastAddedRef.current) return;
      lastAddedRef.current = color;
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c !== color);
        return [color, ...filtered].slice(0, 10);
      });
    },
    []
  );

  const updateFromRgb = useCallback(
    (r: number, g: number, b: number) => {
      const newHex = rgbToHex(r, g, b);
      setHex(newHex);
      setHexInput(newHex);
      setRgb({ r, g, b });
      setHsl(rgbToHsl(r, g, b));
      setHsb(rgbToHsb(r, g, b));
    },
    []
  );

  const handleColorInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const parsed = hexToRgb(val);
      if (parsed) {
        updateFromRgb(parsed.r, parsed.g, parsed.b);
        addToRecent(val);
      }
    },
    [updateFromRgb, addToRecent]
  );

  const handleHexTextChange = useCallback(
    (val: string) => {
      setHexInput(val);
      const clean = val.startsWith("#") ? val : "#" + val;
      const parsed = hexToRgb(clean);
      if (parsed) {
        updateFromRgb(parsed.r, parsed.g, parsed.b);
        addToRecent(clean);
      }
    },
    [updateFromRgb, addToRecent]
  );

  const handleRgbChange = useCallback(
    (channel: "r" | "g" | "b", value: string) => {
      const num = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
      const newRgb = { ...rgb, [channel]: num };
      updateFromRgb(newRgb.r, newRgb.g, newRgb.b);
      addToRecent(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [rgb, updateFromRgb, addToRecent]
  );

  const handleHslChange = useCallback(
    (channel: "h" | "s" | "l", value: string) => {
      const maxVal = channel === "h" ? 360 : 100;
      const num = Math.max(0, Math.min(maxVal, parseInt(value, 10) || 0));
      const newHsl = { ...hsl, [channel]: num };
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      updateFromRgb(newRgb.r, newRgb.g, newRgb.b);
      addToRecent(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [hsl, updateFromRgb, addToRecent]
  );

  const handleHsbChange = useCallback(
    (channel: "h" | "s" | "b", value: string) => {
      const maxVal = channel === "h" ? 360 : 100;
      const num = Math.max(0, Math.min(maxVal, parseInt(value, 10) || 0));
      const newHsb = { ...hsb, [channel]: num };
      const newRgb = hsbToRgb(newHsb.h, newHsb.s, newHsb.b);
      updateFromRgb(newRgb.r, newRgb.g, newRgb.b);
      addToRecent(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [hsb, updateFromRgb, addToRecent]
  );

  const setFromRecent = useCallback(
    (color: string) => {
      const parsed = hexToRgb(color);
      if (parsed) {
        updateFromRgb(parsed.r, parsed.g, parsed.b);
      }
    },
    [updateFromRgb]
  );

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, []);

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors tabular-nums";

  return (
    <div className="space-y-5">
      {/* Color picker + swatch */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <input
            type="color"
            value={hex}
            onChange={handleColorInput}
            className="h-20 w-20 cursor-pointer rounded-lg border border-border shrink-0"
            style={{ padding: 0 }}
          />
          <div
            className="h-20 flex-1 rounded-lg border border-border"
            style={{ backgroundColor: hex }}
          />
        </div>
      </div>

      {/* Format inputs */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        {/* HEX */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">HEX</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexTextChange(e.target.value)}
              className={inputClass}
              maxLength={7}
            />
            <button
              onClick={() => copyText(hex)}
              className="flex shrink-0 items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy HEX"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RGB */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">RGB</label>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-3 gap-2">
              <input
                type="number"
                value={rgb.r}
                min={0}
                max={255}
                onChange={(e) => handleRgbChange("r", e.target.value)}
                className={inputClass}
                placeholder="R"
              />
              <input
                type="number"
                value={rgb.g}
                min={0}
                max={255}
                onChange={(e) => handleRgbChange("g", e.target.value)}
                className={inputClass}
                placeholder="G"
              />
              <input
                type="number"
                value={rgb.b}
                min={0}
                max={255}
                onChange={(e) => handleRgbChange("b", e.target.value)}
                className={inputClass}
                placeholder="B"
              />
            </div>
            <button
              onClick={() => copyText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
              className="flex shrink-0 items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy RGB"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* HSL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">HSL</label>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-3 gap-2">
              <input
                type="number"
                value={hsl.h}
                min={0}
                max={360}
                onChange={(e) => handleHslChange("h", e.target.value)}
                className={inputClass}
                placeholder="H"
              />
              <input
                type="number"
                value={hsl.s}
                min={0}
                max={100}
                onChange={(e) => handleHslChange("s", e.target.value)}
                className={inputClass}
                placeholder="S"
              />
              <input
                type="number"
                value={hsl.l}
                min={0}
                max={100}
                onChange={(e) => handleHslChange("l", e.target.value)}
                className={inputClass}
                placeholder="L"
              />
            </div>
            <button
              onClick={() => copyText(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
              className="flex shrink-0 items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy HSL"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* HSB */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">HSB</label>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-3 gap-2">
              <input
                type="number"
                value={hsb.h}
                min={0}
                max={360}
                onChange={(e) => handleHsbChange("h", e.target.value)}
                className={inputClass}
                placeholder="H"
              />
              <input
                type="number"
                value={hsb.s}
                min={0}
                max={100}
                onChange={(e) => handleHsbChange("s", e.target.value)}
                className={inputClass}
                placeholder="S"
              />
              <input
                type="number"
                value={hsb.b}
                min={0}
                max={100}
                onChange={(e) => handleHsbChange("b", e.target.value)}
                className={inputClass}
                placeholder="B"
              />
            </div>
            <button
              onClick={() => copyText(`hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`)}
              className="flex shrink-0 items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy HSB"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-medium">Recent Colors</h3>
          <div className="flex flex-wrap gap-2">
            {recentColors.map((color) => (
              <button
                key={color}
                onClick={() => setFromRecent(color)}
                className="h-8 w-8 rounded-md border border-border transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
