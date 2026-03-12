export function normalizeCanvasQuality(
  quality?: number | null
): number | undefined {
  if (quality == null || Number.isNaN(quality)) {
    return undefined;
  }

  const normalized = quality > 1 ? quality / 100 : quality;
  return Math.min(1, Math.max(0.01, normalized));
}

export function qualityToPercent(quality: number): number {
  if (Number.isNaN(quality)) {
    return 100;
  }

  return quality > 1
    ? Math.min(100, Math.max(1, Math.round(quality)))
    : Math.min(100, Math.max(1, Math.round(quality * 100)));
}
