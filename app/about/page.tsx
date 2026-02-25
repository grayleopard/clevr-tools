import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | clevr.tools",
  description:
    "clevr.tools is a free collection of online file and text utilities. All tools run in your browser — your files never leave your device.",
  alternates: {
    canonical: "https://clevr.tools/about",
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h1>About clevr.tools</h1>

            <p>
              clevr.tools is a free collection of online utilities for working
              with files and text — built for speed, privacy, and simplicity.
            </p>

            <p>
              Every tool runs entirely in your browser. Your files and text never
              leave your device, are never uploaded to a server, and are never
              stored anywhere. There&apos;s no signup, no account, no tracking
              beyond basic anonymous analytics.
            </p>

            <p>
              We built clevr.tools because most online tool sites are slow,
              cluttered with ads, and shady about what happens to your data. We
              wanted something we&apos;d actually want to use ourselves — fast,
              clean, and trustworthy.
            </p>

            <h2>What&apos;s available</h2>

            <ul>
              <li>Image and PDF compression</li>
              <li>File format conversion (PNG, JPG, WebP, HEIC, PDF)</li>
              <li>PDF tools (merge, split, rotate)</li>
              <li>QR code generation</li>
              <li>Text utilities (word counter, case converter, and more)</li>
              <li>Timers and time tracking (countdown timer, stopwatch, Pomodoro)</li>
              <li>Developer utilities (UUID generator, URL encoder/decoder, JSON formatter, and more)</li>
              <li>Calculators (mortgage, BMI, compound interest, GPA, and more)</li>
            </ul>

            <p>New tools are added regularly. Built in the USA.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
