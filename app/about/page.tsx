import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | clevr.tools",
  description:
    "clevr.tools is a free collection of online file and text utilities. Local tools are clearly labeled and process files in your browser.",
  alternates: {
    canonical: "https://www.clevr.tools/about",
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
              Most tools run entirely in your browser. Tools labeled as local
              process your files or text in browser memory without sending that
              content to our servers. Any tool that requires external processing
              is labeled before submission and is unavailable until its data-handling
              terms have been verified. There&apos;s no signup or account; we use only
              basic usage analytics configured to exclude file contents, filenames,
              and text inputs.
            </p>

            <p>
              We built clevr.tools because most online tool sites are slow,
              cluttered with ads, and shady about what happens to your data. We
              wanted something we&apos;d actually want to use ourselves — fast,
              clean, and trustworthy.
            </p>

            <h2>Our responsibility</h2>

            <p>
              clevr.tools is accountable for the tools and claims we publish.
              We do not present an unfinished or externally processed capability
              as a ready-to-use local tool. When a tool needs more evidence or a
              clearer handling boundary, we can limit it or keep it out of normal
              discovery while it is reviewed.
            </p>

            <p>
              Read <Link href="/methodology">how we test tools, describe limitations, and handle corrections</Link>.
              For privacy and data-handling details, see our <Link href="/privacy">Privacy Policy</Link>.
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

            <p>
              New tools are added only when we can describe what they do and how
              they handle your information clearly. Built in the USA.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
