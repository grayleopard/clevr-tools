import { heicTo } from "heic-to/csp";

// Each conversion owns this worker and its decoder child. Terminating this
// worker also stops its descendants, including a decoder that never resolves.
self.onmessage = async (event: MessageEvent<{ file: File; quality: number }>) => {
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await heicTo({ blob: event.data.file, type: "bitmap" });
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 50_000_000) {
      throw new Error("Unsupported image dimensions");
    }
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: event.data.quality });
    self.postMessage({ blob });
  } catch {
    self.postMessage({ error: true });
  } finally {
    bitmap?.close();
  }
};
