"use client";

import { ImagePlus, Search } from "lucide-react";
import { useDeferredValue, useId, useState } from "react";
import type { MemeTemplate } from "@/lib/memes/types";
import TemplateCard from "@/components/meme/TemplateCard";

interface TemplateGridProps {
  templates: MemeTemplate[];
  onUpload: (file: File) => void;
}

export default function TemplateGrid({
  templates,
  onUpload,
}: TemplateGridProps) {
  const inputId = useId();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const normalizedQuery = deferredSearch.trim().toLowerCase();
  const filteredTemplates = normalizedQuery
    ? templates.filter((template) =>
        template.name.toLowerCase().includes(normalizedQuery)
      )
    : templates;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Pick a template
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Start from a classic format or upload your own image and place text directly on the canvas.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search templates"
          className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <label
          htmlFor={inputId}
          className="relative flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-4 text-center transition hover:border-primary/60 hover:bg-primary/10"
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onUpload(file);
              event.target.value = "";
            }}
          />
          <div className="rounded-full bg-background p-3 text-primary shadow-sm">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Upload your own</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              JPG, PNG, WebP, or any image your browser can open.
            </p>
          </div>
        </label>

        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {!filteredTemplates.length && (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No templates matched <span className="font-medium text-foreground">{search}</span>.
        </div>
      )}
    </section>
  );
}
