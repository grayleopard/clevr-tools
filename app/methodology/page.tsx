import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileCheck2, RefreshCw, ShieldCheck } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "How clevr.tools Works | Methodology",
  description:
    "Learn how clevr.tools approaches tool testing, local processing disclosures, updates, limitations, and corrections.",
  alternates: {
    canonical: "https://www.clevr.tools/methodology",
  },
  openGraph: {
    title: "How clevr.tools Works | Methodology",
    description:
      "Our approach to tool testing, privacy disclosures, limitations, updates, and corrections.",
    url: "https://www.clevr.tools/methodology",
    siteName: "clevr.tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "How clevr.tools Works | Methodology",
    description:
      "Our approach to tool testing, privacy disclosures, limitations, updates, and corrections.",
  },
};

const standards = [
  {
    number: "01",
    title: "Start with the actual task",
    description:
      "A tool should solve a specific job without making the workflow harder to understand. We check that its labels, accepted input, result, and download or copy action describe the same capability.",
    icon: FileCheck2,
  },
  {
    number: "02",
    title: "State the processing boundary",
    description:
      "Tools that process files or text locally are described that way. A capability that would require external processing stays unavailable until its processor and data-handling terms can be clearly presented before use.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Check the result, not just the screen",
    description:
      "For the behaviors and inputs covered by our current checks, we use focused regression tests and representative fixtures. Where a tool creates a file, the useful question is whether the downloaded result opens and behaves as expected—not just whether a progress message appeared.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Keep claims within the evidence",
    description:
      "Examples and guidance are meant to explain a workflow, not to overstate certainty. Some tools provide estimates or depend on browser and device limits; those boundaries belong in the product experience, not in fine print.",
    icon: RefreshCw,
  },
];

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b-2 border-foreground px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-12">
            <nav className="flex items-start gap-2 text-xs font-medium text-muted-foreground lg:pt-2">
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <span>Methodology</span>
            </nav>

            <div className="max-w-4xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Our working standard
              </p>
              <h1 className="mt-5 font-display text-[clamp(3.4rem,9vw,7.5rem)] font-black uppercase leading-[0.82] tracking-[-0.075em] text-foreground">
                Useful before
                <br />
                <span className="text-primary">visible.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                clevr.tools is built for small tasks that need a clear answer: what this tool does,
                where processing happens, and what to expect from the result. This page explains the
                standard we use when we publish, review, update, or pause a tool.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Last reviewed: <time dateTime="2026-08-04">August 4, 2026</time>
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[10rem_minmax(0,1fr)]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  How we evaluate
                </p>
              </div>
              <div className="border-t-2 border-foreground">
                {standards.map((standard) => {
                  const Icon = standard.icon;
                  return (
                    <article
                      key={standard.number}
                      className="grid gap-5 border-b border-[color:var(--ghost-border)] py-8 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-start"
                    >
                      <span className="font-display text-3xl font-bold tracking-[-0.04em] text-primary">
                        {standard.number}
                      </span>
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                          {standard.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                          {standard.description}
                        </p>
                      </div>
                      <span className="hidden border border-primary/30 bg-primary/10 p-2.5 text-primary sm:block">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[color:var(--ghost-border)] bg-muted/45 px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary lg:pt-1">
              Evidence and limits
            </p>
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] text-foreground">
                  What a check can tell you
                </h2>
                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  A successful check supports a defined behavior on the input it covers. It does not
                  turn a calculator into professional advice, guarantee every browser or file, or
                  remove the need to inspect an important result. We describe tools as utilities and
                  keep unavailable capabilities out of normal discovery while their requirements are
                  still under review.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-6 sm:pl-8">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Privacy is a product boundary
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Local tools process files or text in browser memory and do not send that content to
                  our servers. If a feature would need external processing, we do not present it as a
                  ready-to-use local workflow. Read the <Link href="/privacy" className="font-medium text-primary underline underline-offset-4">Privacy Policy</Link> for the
                  current data-handling details.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary lg:pt-1">
              Updates and corrections
            </p>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
              <div>
                <h2 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] text-foreground sm:text-4xl">
                  Clear changes. Honest pauses.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Material changes to this policy will carry a visible update date. If we find that a capability,
                  claim, or handling boundary needs correction, the appropriate response may be to
                  correct the page, narrow the claim, or temporarily remove the capability from normal
                  discovery while it is reviewed.
                </p>
              </div>
              <a
                href="mailto:privacy@clevr.tools?subject=clevr.tools%20correction%20request"
                className="group flex items-start justify-between gap-5 border border-foreground bg-card p-5 text-left transition-colors hover:border-primary hover:bg-primary/10"
              >
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Report a concern
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-foreground">
                    Send a correction or data-handling question
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    privacy@clevr.tools
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
