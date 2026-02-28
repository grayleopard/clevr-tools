"use client";

import dynamic from "next/dynamic";
import DeferredAnalytics from "@/components/analytics/DeferredAnalytics";

const LazyToastContainer = dynamic(
  () => import("@/components/ui/ToastContainer").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function ClientOverlays() {
  return (
    <>
      <LazyToastContainer />
      <DeferredAnalytics />
    </>
  );
}
