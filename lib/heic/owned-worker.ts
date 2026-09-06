import { HEIC_CONVERSION_TIMEOUT_MS, HeicConversionError } from "../image-remediation/heic-validation";

export function runHeicWorker(
  createWorker: () => Worker,
  file: File,
  quality: number,
  signal?: AbortSignal,
  timeoutMs = HEIC_CONVERSION_TIMEOUT_MS,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Conversion cancelled", "AbortError"));
    let worker: Worker;
    try { worker = createWorker(); } catch { return reject(new HeicConversionError("unsupported-browser")); }
    let settled = false;
    const finish = (error?: Error, blob?: Blob) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      worker.terminate();
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      if (error) reject(error);
      else resolve(blob!);
    };
    const cancel = () => finish(new DOMException("Conversion cancelled", "AbortError"));
    const timer = setTimeout(() => finish(new HeicConversionError("timeout")), timeoutMs);
    signal?.addEventListener("abort", cancel, { once: true });
    worker.onmessage = (event: MessageEvent<{ blob?: Blob; error?: boolean }>) => {
      if (event.data.error || !(event.data.blob instanceof Blob)) {
        finish(new HeicConversionError("decoder-failed"));
      } else finish(undefined, event.data.blob);
    };
    worker.onerror = () => finish(new HeicConversionError("decoder-failed"));
    worker.onmessageerror = () => finish(new HeicConversionError("decoder-failed"));
    try { worker.postMessage({ file, quality }); } catch { finish(new HeicConversionError("decoder-failed")); }
  });
}
