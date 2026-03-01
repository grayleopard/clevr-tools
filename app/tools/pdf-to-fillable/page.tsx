import type { Metadata } from "next";
import Link from "next/link";
import { getToolBySlug } from "@/lib/tools";
import { getToolFaqs } from "@/lib/seo/tool-faqs";
import FaqSchema from "@/components/seo/FaqSchema";
import ToolLayout from "@/components/tool/ToolLayout";
import PdfToFillablePdf from "@/components/tools/PdfToFillablePdf";
import { notFound } from "next/navigation";

const tool = getToolBySlug("pdf-to-fillable")!;
const faqItems = getToolFaqs("pdf-to-fillable");

export async function generateMetadata(): Promise<Metadata> {
  if (!tool) return {};
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `https://clevr.tools${tool.route}`,
      siteName: "clevr.tools",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    alternates: {
      canonical: `https://clevr.tools${tool.route}`,
    },
  };
}

export default function PdfToFillablePdfPage() {
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <PdfToFillablePdf />
      <section className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Common scenarios</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Practical ways to use this free online PDF to Fillable PDF tool in your browser.
          Processing stays private on your device.
        </p>
        <div className="mt-6 grid gap-5">
          <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <h3 className="text-base font-semibold">Make a PDF fillable for signatures</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If you need a contract, approval sheet, or consent form, this is a simple way to
              make a PDF fillable for signatures without desktop software. The workflow is free,
              online, and runs in your browser, so the file stays private while you place
              signature and text fields where people must sign. You can label each field clearly,
              add multiple signer areas, and export a standard fillable PDF that opens in common
              readers. When signatures come back as separate files, use{" "}
              <Link href="/tools/merge-pdf" className="text-primary underline">
                Merge PDF
              </Link>{" "}
              to combine them into one final document.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <h3 className="text-base font-semibold">
              Create a fillable PDF for HR / onboarding forms
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Teams often need to create a fillable PDF for HR onboarding forms like contact
              details, acknowledgments, and equipment checklists. This free online editor runs in
              your browser, so private employee information is not uploaded while you prepare
              fields. Add text inputs for names and addresses, checkboxes for policy acceptance,
              and date fields for start dates. You can keep naming consistent so downstream
              processing is easier and forms are less confusing for new hires. If you need to send
              only certain pages from a longer packet, finish by using{" "}
              <Link href="/tools/split-pdf" className="text-primary underline">
                Split PDF
              </Link>
              .
            </p>
          </article>

          <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <h3 className="text-base font-semibold">
              Turn a scanned form into a fillable PDF (manual fields)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When you only have a scan, you can still turn a scanned form into a fillable PDF by
              placing fields manually over each blank line and checkbox. This free online approach
              works in your browser and keeps documents private, which matters for medical,
              finance, or legal paperwork. Because v1 does not auto-detect field locations, manual
              placement gives you full control over exact position and size on every page. Add
              labels that match printed prompts so recipients know what to enter. If you want to
              inspect page regions more closely first, convert a sample page with{" "}
              <Link href="/convert/pdf-to-jpg" className="text-primary underline">
                PDF to JPG
              </Link>
              .
            </p>
          </article>

          <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <h3 className="text-base font-semibold">Add a date field to a PDF</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If your document needs signed dates, review dates, or renewal dates, you can add a
              date field to a PDF in minutes with this free online tool. It runs in your browser,
              keeps files private, and uses a clear YYYY-MM-DD placeholder so entries are
              consistent across teams and systems. You can place date fields on one page or repeat
              them across multiple pages for audit and approval workflows. This is useful for
              contracts, inspections, and compliance records where timing matters. If a page is
              sideways from a scanner before field placement, fix orientation first with{" "}
              <Link href="/tools/rotate-pdf" className="text-primary underline">
                Rotate PDF
              </Link>
              .
            </p>
          </article>

          <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <h3 className="text-base font-semibold">Add checkboxes to a PDF</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              For consent forms, checklists, and yes/no declarations, it is easy to add checkboxes
              to a PDF using this free online editor. Everything runs in your browser and remains
              private while you place each checkbox next to the matching statement. You can keep
              boxes small for dense layouts or enlarge them for touch-friendly mobile completion.
              Manual placement also helps when forms have irregular spacing that automated tools
              often miss. After adding fields and exporting, you can reduce send size for email or
              portals by running the result through{" "}
              <Link href="/compress/pdf" className="text-primary underline">
                PDF Compressor
              </Link>
              .
            </p>
          </article>

          <article className="rounded-lg border border-border bg-background p-4 sm:p-5">
            <h3 className="text-base font-semibold">Make a fillable PDF private (no upload)</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If privacy is the main requirement, this tool helps you make a fillable PDF private
              because processing is free, online, and in your browser with no file upload. That
              means forms with personal, payroll, client, or legal data stay on your device while
              you add and edit fields. You can still prepare professional documents with named
              inputs, signature boxes, and date fields without sending content to an external
              server. It is a practical option for teams with strict handling rules or local-first
              workflows. If your source starts as photographed pages, first combine images with{" "}
              <Link href="/convert/jpg-to-pdf" className="text-primary underline">
                JPG to PDF
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
      <FaqSchema items={faqItems} />
    </ToolLayout>
  );
}
