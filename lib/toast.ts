/**
 * Lightweight pub/sub toast system — no React context needed.
 * Any client component can call addToast() directly.
 */

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

let items: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  const snapshot = [...items];
  listeners.forEach((l) => l(snapshot));
}

export function addToast(
  message: string,
  type: ToastType = "info",
  duration = 3000
): string {
  const id = Math.random().toString(36).slice(2, 9);
  items = [...items, { id, message, type }];
  notify();
  if (duration > 0) setTimeout(() => removeToast(id), duration);
  return id;
}

export function removeToast(id: string) {
  items = items.filter((t) => t.id !== id);
  notify();
}

/** Subscribe to toast changes. Returns an unsubscribe function. */
export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener([...items]); // deliver current snapshot immediately
  return () => listeners.delete(listener);
}
