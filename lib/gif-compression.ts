"use client";

import { parseGIF, decompressFrames, type ParsedFrame } from "gifuct-js";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

export type GifFrameReduction = 1 | 2 | 3 | 4;
export type GifScale = 100 | 75 | 50 | 25;

export interface GifAnalysis {
  width: number;
  height: number;
  frameCount: number;
  durationMs: number;
}

export interface GifCompressionSettings {
  compression: number;
  maxColors: number;
  frameReduction: GifFrameReduction;
  scale: GifScale;
}

export interface GifCompressionResult extends GifAnalysis {
  blob: Blob;
  colors: number;
}

type PaletteFormat = "rgb565" | "rgb444" | "rgba4444";
type Palette = number[][];

interface RenderedFrame {
  data: Uint8ClampedArray;
  delay: number;
}

interface RenderedAnimation {
  frames: RenderedFrame[];
  width: number;
  height: number;
  durationMs: number;
}

function sanitizeDelay(delay: number | undefined): number {
  return Math.max(delay ?? 0, 20);
}

function getScaledDimensions(width: number, height: number, scale: GifScale) {
  if (scale === 100) {
    return { width, height };
  }

  return {
    width: Math.max(1, Math.round((width * scale) / 100)),
    height: Math.max(1, Math.round((height * scale) / 100)),
  };
}

function getEffectiveColorLimit(maxColors: number, compression: number): number {
  const clampedCompression = Math.min(100, Math.max(0, compression));
  const floor = Math.max(8, Math.round(maxColors * 0.18));
  return Math.max(
    8,
    Math.round(maxColors - ((maxColors - floor) * clampedCompression) / 100)
  );
}

function getCandidateColorLimits(base: number): number[] {
  return [...new Set([
    base,
    Math.max(16, Math.round(base * 0.75)),
    Math.max(8, Math.round(base * 0.5)),
  ])];
}

function hasTransparency(frames: RenderedFrame[]): boolean {
  return frames.some((frame) => {
    for (let index = 3; index < frame.data.length; index += 4) {
      if (frame.data[index] < 250) return true;
    }
    return false;
  });
}

function buildPaletteSample(frames: RenderedFrame[]): Uint8Array {
  const totalPixels = frames.reduce((sum, frame) => sum + frame.data.length / 4, 0);
  const maxSamplePixels = 450_000;
  const stride = Math.max(1, Math.ceil(totalPixels / maxSamplePixels));
  const capacity = Math.ceil(totalPixels / stride) * 4;
  const sample = new Uint8Array(capacity);

  let sampleOffset = 0;
  let pixelIndex = 0;

  for (const frame of frames) {
    for (let index = 0; index < frame.data.length; index += 4) {
      if (pixelIndex % stride === 0) {
        sample[sampleOffset++] = frame.data[index];
        sample[sampleOffset++] = frame.data[index + 1];
        sample[sampleOffset++] = frame.data[index + 2];
        sample[sampleOffset++] = frame.data[index + 3];
      }
      pixelIndex += 1;
    }
  }

  return sample.slice(0, sampleOffset);
}

function getTransparentIndex(palette: Palette): number {
  return palette.findIndex((entry) => entry.length === 4 && entry[3] === 0);
}

function encodeFrames(
  frames: RenderedFrame[],
  width: number,
  height: number,
  palette: Palette,
  format: PaletteFormat
): Blob {
  const gif = GIFEncoder();
  const transparentIndex = getTransparentIndex(palette);
  const transparent = transparentIndex >= 0;

  frames.forEach((frame, index) => {
    const indexed = applyPalette(frame.data, palette, format);
    gif.writeFrame(indexed, width, height, {
      palette: index === 0 ? palette : undefined,
      repeat: 0,
      delay: frame.delay,
      transparent,
      transparentIndex: transparent ? transparentIndex : 0,
      dispose: 2,
    });
  });

  gif.finish();
  const bytes = gif.bytes();
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  return new Blob([arrayBuffer], { type: "image/gif" });
}

function renderAnimationFrames(
  frames: ParsedFrame[],
  sourceWidth: number,
  sourceHeight: number,
  scale: GifScale,
  frameReduction: GifFrameReduction
): RenderedAnimation {
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });

  if (!sourceContext) {
    throw new Error("Could not create a canvas context for GIF processing.");
  }

  const { width, height } = getScaledDimensions(sourceWidth, sourceHeight, scale);
  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = width;
  scaledCanvas.height = height;
  const scaledContext = scaledCanvas.getContext("2d", { willReadFrequently: true });

  if (!scaledContext) {
    throw new Error("Could not create a scaled canvas context for GIF processing.");
  }

  sourceContext.clearRect(0, 0, sourceWidth, sourceHeight);
  scaledContext.imageSmoothingEnabled = true;

  let previousFrame: ParsedFrame | null = null;
  let previousRestore: ImageData | null = null;
  let carriedDelay = 0;
  const renderedFrames: RenderedFrame[] = [];

  frames.forEach((frame, index) => {
    if (previousFrame) {
      if (previousFrame.disposalType === 2) {
        sourceContext.clearRect(
          previousFrame.dims.left,
          previousFrame.dims.top,
          previousFrame.dims.width,
          previousFrame.dims.height
        );
      } else if (previousFrame.disposalType === 3 && previousRestore) {
        sourceContext.putImageData(previousRestore, 0, 0);
      }
    }

    previousRestore =
      frame.disposalType === 3
        ? sourceContext.getImageData(0, 0, sourceWidth, sourceHeight)
        : null;

    const patch = new Uint8ClampedArray(frame.patch.length);
    patch.set(frame.patch);

    sourceContext.putImageData(
      new ImageData(patch, frame.dims.width, frame.dims.height),
      frame.dims.left,
      frame.dims.top
    );

    carriedDelay += sanitizeDelay(frame.delay);

    const keepFrame =
      frameReduction === 1 || index % frameReduction === 0 || index === frames.length - 1;

    if (keepFrame) {
      let data: Uint8ClampedArray;

      if (scale === 100) {
        data = new Uint8ClampedArray(
          sourceContext.getImageData(0, 0, sourceWidth, sourceHeight).data
        );
      } else {
        scaledContext.clearRect(0, 0, width, height);
        scaledContext.drawImage(sourceCanvas, 0, 0, width, height);
        data = new Uint8ClampedArray(scaledContext.getImageData(0, 0, width, height).data);
      }

      renderedFrames.push({
        data,
        delay: carriedDelay,
      });
      carriedDelay = 0;
    }

    previousFrame = frame;
  });

  const durationMs = renderedFrames.reduce((sum, frame) => sum + frame.delay, 0);

  return {
    frames: renderedFrames,
    width,
    height,
    durationMs,
  };
}

export async function analyzeGif(file: File): Promise<GifAnalysis> {
  const parsed = parseGIF(await file.arrayBuffer());
  const frames = decompressFrames(parsed, false);

  return {
    width: parsed.lsd.width,
    height: parsed.lsd.height,
    frameCount: frames.length,
    durationMs: frames.reduce((sum, frame) => sum + sanitizeDelay(frame.delay), 0),
  };
}

export async function compressGif(
  file: File,
  settings: GifCompressionSettings
): Promise<GifCompressionResult> {
  const parsed = parseGIF(await file.arrayBuffer());
  const decodedFrames = decompressFrames(parsed, true);

  if (decodedFrames.length === 0) {
    throw new Error("No animation frames were found in this GIF.");
  }

  const rendered = renderAnimationFrames(
    decodedFrames,
    parsed.lsd.width,
    parsed.lsd.height,
    settings.scale,
    settings.frameReduction
  );

  const sample = buildPaletteSample(rendered.frames);
  const transparent = hasTransparency(rendered.frames);
  const baseColorLimit = getEffectiveColorLimit(settings.maxColors, settings.compression);
  const colorLimits = getCandidateColorLimits(baseColorLimit);
  const paletteFormats: PaletteFormat[] = transparent
    ? ["rgba4444"]
    : settings.compression >= 65
    ? ["rgb444", "rgb565"]
    : ["rgb565", "rgb444"];

  let bestBlob: Blob | null = null;
  let bestColorCount = colorLimits[0];

  for (const format of paletteFormats) {
    for (const maxColors of colorLimits) {
      const palette = quantize(
        sample,
        maxColors,
        format === "rgba4444"
          ? {
              format,
              oneBitAlpha: true,
              clearAlpha: true,
              clearAlphaThreshold: 127,
            }
          : { format }
      );

      const blob = encodeFrames(rendered.frames, rendered.width, rendered.height, palette, format);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
        bestColorCount = palette.length;
      }
    }
  }

  if (!bestBlob) {
    throw new Error("GIF compression did not produce an output file.");
  }

  return {
    blob: bestBlob,
    width: rendered.width,
    height: rendered.height,
    frameCount: rendered.frames.length,
    durationMs: rendered.durationMs,
    colors: bestColorCount,
  };
}
