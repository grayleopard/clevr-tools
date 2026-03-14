"use client";

import { forwardRef, useEffect, useRef } from "react";
import type {
  MemeStyleState,
  MemeTemplate,
  MemeTextValues,
  TextFieldConfig,
} from "@/lib/memes/types";

interface MemeCanvasProps {
  template: MemeTemplate;
  texts: MemeTextValues;
  style: MemeStyleState;
}

interface WrappedLine {
  text: string;
  width: number;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

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

function breakLongWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number
): string[] {
  const pieces: string[] = [];
  let current = "";

  for (const character of word) {
    const next = current + character;
    if (current && ctx.measureText(next).width > maxWidth) {
      pieces.push(current);
      current = character;
    } else {
      current = next;
    }
  }

  if (current) {
    pieces.push(current);
  }

  return pieces.length ? pieces : [word];
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): WrappedLine[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const words = normalized.split(" ").flatMap((word) => {
    const measured = ctx.measureText(word).width;
    return measured > maxWidth ? breakLongWord(ctx, word, maxWidth) : [word];
  });

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

function drawField(
  ctx: CanvasRenderingContext2D,
  field: TextFieldConfig,
  value: string,
  style: MemeStyleState
) {
  const text = value.trim();
  if (!text) return;

  const fontSize = Math.max(20, Math.round(field.fontSize * style.fontScale));
  const fontFamily =
    style.mode === "classic"
      ? "Impact, 'Arial Black', sans-serif"
      : "'Arial Black', 'Helvetica Neue', sans-serif";
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = field.align;

  const lines = wrapText(ctx, style.mode === "classic" ? text.toUpperCase() : text, field.maxWidth);
  if (!lines.length) return;

  const lineHeight = fontSize * 1.08;
  const startY = field.y - ((lines.length - 1) * lineHeight) / 2;
  const anchorX = field.align === "center" ? field.x : field.x;

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    const x = field.align === "center" ? anchorX : field.x;

    if (style.mode === "classic" && field.outline) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.max(2, fontSize * 0.15);
      ctx.lineJoin = "round";
      ctx.strokeText(line.text, x, y, field.maxWidth);
    }

    ctx.fillStyle =
      style.mode === "classic" ? "#FFFFFF" : style.color || field.color;
    ctx.fillText(line.text, x, y, field.maxWidth);
  });
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
  { template, texts, style },
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
      className="h-auto w-full rounded-2xl border border-border bg-black/5 shadow-sm"
    />
  );
});

export default MemeCanvas;
