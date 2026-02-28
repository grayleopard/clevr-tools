"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gtagLoaded?: boolean;
  }
}

const MEASUREMENT_ID = "G-X161SLKN61";

function ensureGtagQueue() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
}

function loadAnalytics() {
  if (window.__gtagLoaded) return;
  window.__gtagLoaded = true;

  ensureGtagQueue();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.onload = () => {
    window.gtag?.("js", new Date());
    window.gtag?.("config", MEASUREMENT_ID);
  };
  document.head.appendChild(script);
}

export default function DeferredAnalytics() {
  useEffect(() => {
    ensureGtagQueue();

    const onFirstIntent = () => {
      loadAnalytics();
      removeListeners();
      clearTimeout(fallbackTimeout);
    };

    const eventOptions: AddEventListenerOptions = { passive: true };
    const removeListeners = () => {
      window.removeEventListener("pointerdown", onFirstIntent, eventOptions);
      window.removeEventListener("keydown", onFirstIntent);
      window.removeEventListener("scroll", onFirstIntent, eventOptions);
      window.removeEventListener("touchstart", onFirstIntent, eventOptions);
    };

    window.addEventListener("pointerdown", onFirstIntent, eventOptions);
    window.addEventListener("keydown", onFirstIntent);
    window.addEventListener("scroll", onFirstIntent, eventOptions);
    window.addEventListener("touchstart", onFirstIntent, eventOptions);

    const fallbackTimeout = window.setTimeout(() => {
      loadAnalytics();
      removeListeners();
    }, 4500);

    return () => {
      window.clearTimeout(fallbackTimeout);
      removeListeners();
    };
  }, []);

  return (
    <script
      id="gtag-queue-stub"
      dangerouslySetInnerHTML={{
        __html:
          "window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};",
      }}
    />
  );
}
