import type { DailyPuzzle, NumbleMode } from "@/lib/numble";

interface SharePayload {
  puzzle: DailyPuzzle;
  stars: 0 | 1 | 2 | 3 | null;
  steps: number;
  optimalSteps: number;
  status: "won" | "gave-up";
  streak: number;
  mode: NumbleMode;
  closestDiff?: number | null;
}

export function buildNumbleShareText({
  puzzle,
  stars,
  steps,
  optimalSteps,
  status,
  streak,
  mode,
  closestDiff,
}: SharePayload): string {
  const header =
    mode === "daily" ? `Numble #${puzzle.puzzleNumber}` : "Numble Practice";
  const starsLine = stars && stars > 0 ? "★".repeat(stars) : "☆☆☆";
  const resultLine =
    status === "won"
      ? `Solved in ${steps} step${steps === 1 ? "" : "s"}`
      : closestDiff != null
        ? `${closestDiff} away`
        : "Couldn’t finish";
  const optimalLine = `Optimal: ${optimalSteps}`;
  const streakLine =
    mode === "daily" && streak > 1 ? `\n🔥 ${streak}-day streak` : "";

  return `${header}\n${starsLine}\n\n${puzzle.target}\n\n${resultLine}\n${optimalLine}${streakLine}\n\nCan you beat it?\n\nclevr.tools/play/numble`;
}

export async function downloadNumbleShareCard({
  puzzle,
  stars,
  steps,
  optimalSteps,
  status,
  mode,
  closestDiff,
}: SharePayload): Promise<void> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not generate share image");

  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#1d4ed8");
  gradient.addColorStop(1, "#0f172a");
  ctx.fillStyle = gradient;
  ctx.fillRect(64, 64, canvas.width - 128, canvas.height - 128);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(110, 110, canvas.width - 220, canvas.height - 220);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 64px Arial";
  ctx.fillText(mode === "daily" ? `Numble #${puzzle.puzzleNumber}` : "Numble Practice", 140, 210);

  ctx.font = "500 34px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText(`Target ${puzzle.target}`, 140, 270);
  ctx.fillText(`Difficulty ${puzzle.difficulty}`, 140, 320);

  ctx.font = "700 180px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(puzzle.target), 140, 570);

  ctx.font = "700 88px Arial";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText(stars && stars > 0 ? "★".repeat(stars) : "☆☆☆", 140, 700);

  ctx.font = "600 46px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    status === "won"
      ? `Solved in ${steps} steps`
      : closestDiff != null
        ? `${closestDiff} away from target`
        : "Couldn’t finish",
    140,
    815
  );
  ctx.fillText(`Optimal: ${optimalSteps}`, 140, 885);

  ctx.font = "500 38px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.fillText("Can you beat it?", 140, 1010);

  ctx.font = "600 40px Arial";
  ctx.fillStyle = "#93c5fd";
  ctx.fillText("clevr.tools/play/numble", 140, 1150);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error("Canvas export failed"));
        return;
      }
      resolve(value);
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = mode === "daily"
    ? `numble-${puzzle.puzzleNumber}.png`
    : "numble-practice.png";
  link.click();
  URL.revokeObjectURL(url);
}
