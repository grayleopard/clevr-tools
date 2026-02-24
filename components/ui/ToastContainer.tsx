"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { subscribeToasts, removeToast, type ToastItem } from "@/lib/toast";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

// Inverted: toasts use dark bg in light mode, light bg in dark mode
const ICON_COLORS = {
  success: "text-green-400 dark:text-green-600",
  error: "text-red-400 dark:text-red-500",
  info: "text-zinc-400 dark:text-zinc-500",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-2 items-end"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className="animate-in slide-in-from-bottom-3 fade-in duration-200 pointer-events-auto flex items-center gap-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-50 dark:text-zinc-900 shadow-lg shadow-black/10 max-w-xs"
          >
            <Icon className={`h-4 w-4 shrink-0 ${ICON_COLORS[toast.type]}`} />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
