"use client";

import { forwardRef, useEffect, useRef } from "react";
import type {
  MemeTextAlign,
  MemeTextVAlign,
  MemeStyleState,
  MemeTemplate,
  MemeTextValues,
  TextFieldConfig,
} from "@/lib/memes/types";

interface MemeCanvasProps {
  template: MemeTemplate;
  texts: MemeTextValues;
  style: MemeStyleState;
  showDebugRegions?: boolean;
}

interface WrappedLine {
  text: string;
  width: number;
}

interface TextRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  align: MemeTextAlign;
  valign: MemeTextVAlign;
}

interface FittedTextLayout {
  fontSize: number;
  lineHeight: number;
  lines: WrappedLine[];
  region: TextRegion;
  innerX: number;
  innerY: number;
  innerWidth: number;
  innerHeight: number;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const MIN_FONT_SIZE = 8;

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });

  imageCache.set(src, imagePromise);
  return imagePromise;
}

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): WrappedLine[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const words = normalized.split(" ");
  const lines: WrappedLine[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = ctx.measureText(candidate).width;

    if (current && width > maxWidth) {
      lines.push({ text: current, width: ctx.measureText(current).width });
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push({ text: current, width: ctx.measureText(current).width });
  }

  return lines;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): WrappedLine[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: WrappedLine[] = [];

  paragraphs.forEach((paragraph, index) => {
    const wrapped = wrapParagraph(ctx, paragraph, maxWidth);
    if (wrapped.length) {
      lines.push(...wrapped);
    } else if (index < paragraphs.length - 1) {
      lines.push({ text: "", width: 0 });
    }

    if (index < paragraphs.length - 1 && wrapped.length) {
      lines.push({ text: "", width: 0 });
    }
  });

  while (lines.length && !lines[lines.length - 1].text) {
    lines.pop();
  }

  return lines;
}

function getFieldRegion(field: TextFieldConfig): TextRegion {
  return {
    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height,
    align: field.align,
    valign: field.valign ?? "middle",
  };
}

function getLineHeight(fontSize: number, style: MemeStyleState): number {
  return fontSize * (style.mode === "classic" ? 1.08 : 1.16);
}

function fitTextToRegion(
  ctx: CanvasRenderingContext2D,
  field: TextFieldConfig,
  value: string,
  style: MemeStyleState
): FittedTextLayout | null {
  const text = value.trim();
  if (!text) return null;

  const displayText = style.mode === "classic" ? text.toUpperCase() : text;
  const fontFamily =
    style.mode === "classic"
      ? "Impact, 'Arial Black', sans-serif"
      : "Geist, 'Helvetica Neue', Arial, sans-serif";

  const region = getFieldRegion(field);
  let fontSize = Math.max(MIN_FONT_SIZE, Math.round(field.fontSize * style.fontScale));
  let fallbackLayout: FittedTextLayout | null = null;

  while (fontSize >= MIN_FONT_SIZE) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    const paddingX = Math.min(region.width * 0.08, Math.max(4, fontSize * 0.22));
    const paddingY = Math.min(region.height * 0.12, Math.max(2, fontSize * 0.16));
    const innerWidth = Math.max(1, region.width - paddingX * 2);
    const innerHeight = Math.max(1, region.height - paddingY * 2);
    const lines = wrapText(ctx, displayText, innerWidth);
    const lineHeight = getLineHeight(fontSize, style);
    const totalHeight = lines.length * lineHeight;
    const allFit = lines.every((line) => line.width <= innerWidth + 1);

    if (lines.length) {
      fallbackLayout = {
        fontSize,
        lineHeight,
        lines,
        region,
        innerX: region.x + paddingX,
        innerY: region.y + paddingY,
        innerWidth,
        innerHeight,
      };
    }

    if (lines.length && allFit && totalHeight <= innerHeight) {
      return fallbackLayout;
    }

    fontSize -= 1;
  }

  return fallbackLayout;
}

function drawField(
  ctx: CanvasRenderingContext2D,
  field: TextFieldConfig,
  value: string,
  style: MemeStyleState
) {
  const layout = fitTextToRegion(ctx, field, value, style);
  if (!layout) return;

  const fontFamily =
    style.mode === "classic"
      ? "Impact, 'Arial Black', sans-serif"
      : "Geist, 'Helvetica Neue', Arial, sans-serif";

  ctx.save();
  ctx.beginPath();
  ctx.rect(layout.region.x, layout.region.y, layout.region.width, layout.region.height);
  ctx.clip();

  ctx.font = `bold ${layout.fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = layout.region.align;

  const totalHeight = layout.lines.length * layout.lineHeight;
  let startY = layout.innerY + layout.lineHeight / 2;

  if (layout.region.valign === "middle") {
    startY = layout.innerY + (layout.innerHeight - totalHeight) / 2 + layout.lineHeight / 2;
  } else if (layout.region.valign === "bottom") {
    startY = layout.innerY + layout.innerHeight - totalHeight + layout.lineHeight / 2;
  }

  const x =
    layout.region.align === "left"
      ? layout.innerX
      : layout.region.align === "right"
        ? layout.innerX + layout.innerWidth
        : layout.innerX + layout.innerWidth / 2;

  layout.lines.forEach((line, index) => {
    const y = startY + index * layout.lineHeight;

    if (style.mode === "classic" && field.outline && line.text) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.max(2, layout.fontSize * 0.16);
      ctx.lineJoin = "round";
      ctx.strokeText(line.text, x, y, layout.innerWidth);
    }

    ctx.fillStyle =
      style.mode === "classic"
        ? field.outline
          ? "#FFFFFF"
          : field.color
        : style.color || field.color;
    ctx.fillText(line.text, x, y, layout.innerWidth);
  });

  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.025));
  ctx.save();
  ctx.font = `600 ${fontSize}px Geist, Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
  ctx.lineWidth = Math.max(1, fontSize * 0.08);
  ctx.strokeText("clevr.tools", width - fontSize * 0.8, height - fontSize * 0.7);
  ctx.fillText("clevr.tools", width - fontSize * 0.8, height - fontSize * 0.7);
  ctx.restore();
}

const MemeCanvas = forwardRef<HTMLCanvasElement, MemeCanvasProps>(function MemeCanvas(
  { template, texts, style, showDebugRegions = false },
  forwardedRef
) {
  const localRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderCanvas() {
      const canvas = localRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = template.width;
      canvas.height = template.height;

      try {
        const image = await loadImage(template.src);
        if (cancelled) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, template.width, template.height);

        template.textFields.forEach((field) => {
          drawField(context, field, texts[field.id] ?? "", style);
        });

        drawWatermark(context, template.width, template.height);
      } catch {
        context.fillStyle = "#111827";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawWatermark(context, template.width, template.height);
      }
    }

    renderCanvas();

    return () => {
      cancelled = true;
    };
  }, [style, template, texts]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <canvas
        ref={(node) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        aria-label={`${template.name} meme preview`}
        className="block h-auto w-full rounded-2xl border border-border bg-black/5 shadow-sm"
      />

      {showDebugRegions ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
        >
          {template.textFields.map((field) => (
            <div
              key={field.id}
              className="absolute border-2 border-rose-500/90 bg-rose-500/15"
              style={{
                left: `${(field.x / template.width) * 100}%`,
                top: `${(field.y / template.height) * 100}%`,
                width: `${(field.width / template.width) * 100}%`,
                height: `${(field.height / template.height) * 100}%`,
              }}
            >
              <span className="absolute left-1 top-1 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm sm:text-xs">
                {field.id}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
});

export default MemeCanvas;
