function roundedWholeSeconds(totalSeconds: number): number | null {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;
  return Math.round(totalSeconds);
}

export function formatRoundedPace(totalSeconds: number): string {
  const rounded = roundedWholeSeconds(totalSeconds);
  if (rounded === null) return "--:--";

  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRoundedDuration(totalSeconds: number): string {
  const rounded = roundedWholeSeconds(totalSeconds);
  if (rounded === null) return "0:00:00";

  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
