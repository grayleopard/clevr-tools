"use client";

import type {
  MemeStyleState,
  MemeTemplate,
  MemeTextValues,
} from "@/lib/memes/types";

interface TextControlsProps {
  template: MemeTemplate;
  texts: MemeTextValues;
  style: MemeStyleState;
  onTextChange: (id: string, value: string) => void;
  onStyleChange: (nextStyle: MemeStyleState) => void;
}

function modeButtonClass(isActive: boolean): string {
  return isActive
    ? "border-primary bg-primary text-primary-foreground shadow-sm"
    : "border-border bg-background text-foreground hover:border-primary/35";
}

export default function TextControls({
  template,
  texts,
  style,
  onTextChange,
  onStyleChange,
}: TextControlsProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Text</h3>

        <div className="space-y-4">
          {template.textFields.map((field) => (
            <label key={field.id} className="block space-y-2">
              <span className="text-sm font-medium text-foreground">{field.label}</span>
              <textarea
                value={texts[field.id] ?? ""}
                onChange={(event) => onTextChange(field.id, event.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={field.align === "left" ? 2 : 3}
                className="min-h-24 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">Style</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch between classic meme text and a cleaner modern look.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Text style</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onStyleChange({ ...style, mode: "classic" })}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition ${modeButtonClass(style.mode === "classic")}`}
              >
                Classic
              </button>
              <button
                type="button"
                onClick={() => onStyleChange({ ...style, mode: "modern" })}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition ${modeButtonClass(style.mode === "modern")}`}
              >
                Modern
              </button>
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Modern text color</span>
            <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background px-3">
              <input
                type="color"
                value={style.color}
                onChange={(event) =>
                  onStyleChange({ ...style, color: event.target.value })
                }
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="text-sm text-muted-foreground">{style.color.toUpperCase()}</span>
            </div>
          </label>
        </div>

        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">Font scale</span>
            <span className="text-xs text-muted-foreground">
              {Math.round(style.fontScale * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.6"
            step="0.05"
            value={style.fontScale}
            onChange={(event) =>
              onStyleChange({
                ...style,
                fontScale: Number(event.target.value),
              })
            }
            className="w-full accent-primary"
          />
        </label>
      </section>
    </div>
  );
}
