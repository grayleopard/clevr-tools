import Link from "next/link";
import { ArrowRight } from "lucide-react";

type RelatedClusterCategory = "pdf" | "image" | "utility";

interface RelatedToolLink {
  label: string;
  href: string;
}

interface RelatedToolsClusterProps {
  category: RelatedClusterCategory;
  currentPath?: string;
}

const CLUSTERS: Record<
  RelatedClusterCategory,
  { title: string; description: string; links: RelatedToolLink[] }
> = {
  pdf: {
    title: "Related PDF Tools",
    description: "Continue with the next step in this document workflow.",
    links: [
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "Split PDF", href: "/tools/split-pdf" },
      { label: "Rotate PDF", href: "/tools/rotate-pdf" },
      { label: "PDF Compressor", href: "/compress/pdf" },
      { label: "JPG to PDF", href: "/convert/jpg-to-pdf" },
      { label: "PNG to PDF", href: "/convert/png-to-pdf" },
    ],
  },
  image: {
    title: "Related Image Tools",
    description: "Resize, compress, or change formats without leaving the image workflow.",
    links: [
      { label: "Image Compressor", href: "/compress/image" },
      { label: "Image Resizer", href: "/tools/resize-image" },
      { label: "PNG to JPG", href: "/convert/png-to-jpg" },
      { label: "JPG to PNG", href: "/convert/jpg-to-png" },
      { label: "PNG to WebP", href: "/convert/png-to-webp" },
      { label: "WebP to PNG", href: "/convert/webp-to-png" },
    ],
  },
  utility: {
    title: "Related Utility Tools",
    description: "Move between closely related generators and developer utilities.",
    links: [
      { label: "QR Code Generator", href: "/generate/qr-code" },
      { label: "Password Generator", href: "/generate/password" },
      { label: "Random Number", href: "/generate/random-number" },
      { label: "UUID Generator", href: "/dev/uuid" },
      { label: "URL Encoder", href: "/dev/url-encoder" },
      { label: "Base64 Encoder", href: "/dev/base64" },
    ],
  },
};

const CONTEXTUAL_ORDER: Record<string, string[]> = {
  "/tools/merge-pdf": ["/tools/split-pdf", "/tools/rotate-pdf", "/compress/pdf"],
  "/tools/split-pdf": ["/tools/merge-pdf", "/tools/rotate-pdf", "/compress/pdf"],
  "/tools/rotate-pdf": ["/tools/merge-pdf", "/tools/split-pdf", "/compress/pdf"],
  "/compress/pdf": ["/tools/merge-pdf", "/tools/split-pdf", "/convert/pdf-to-jpg"],
  "/convert/pdf-to-jpg": ["/tools/rotate-pdf", "/tools/merge-pdf", "/compress/pdf"],
  "/convert/jpg-to-pdf": ["/compress/pdf", "/tools/merge-pdf", "/convert/png-to-pdf"],
  "/convert/png-to-pdf": ["/compress/pdf", "/tools/merge-pdf", "/convert/jpg-to-pdf"],
  "/compress/image": ["/tools/resize-image", "/convert/png-to-webp", "/convert/png-to-jpg"],
  "/tools/resize-image": ["/compress/image", "/convert/png-to-webp", "/convert/png-to-jpg"],
  "/convert/png-to-jpg": ["/compress/image", "/convert/jpg-to-png", "/tools/resize-image"],
  "/convert/jpg-to-png": ["/convert/png-to-jpg", "/compress/image", "/tools/resize-image"],
  "/convert/png-to-webp": ["/compress/image", "/convert/webp-to-png", "/tools/resize-image"],
  "/convert/webp-to-png": ["/convert/png-to-webp", "/compress/image", "/tools/resize-image"],
  "/generate/qr-code": ["/dev/url-encoder", "/dev/base64", "/dev/uuid"],
  "/generate/password": ["/generate/random-number", "/dev/uuid", "/dev/base64"],
  "/generate/random-number": ["/generate/password", "/dev/uuid", "/generate/qr-code"],
  "/dev/uuid": ["/generate/random-number", "/dev/base64", "/dev/url-encoder"],
  "/dev/url-encoder": ["/dev/base64", "/generate/qr-code", "/dev/uuid"],
  "/dev/base64": ["/dev/url-encoder", "/dev/uuid", "/generate/qr-code"],
};

export default function RelatedToolsCluster({ category, currentPath }: RelatedToolsClusterProps) {
  const cluster = CLUSTERS[category];
  const preferredOrder = currentPath ? CONTEXTUAL_ORDER[currentPath] ?? [] : [];
  const links = cluster.links
    .filter((link) => link.href !== currentPath)
    .sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.href);
      const bIndex = preferredOrder.indexOf(b.href);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .slice(0, 4);

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight">{cluster.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{cluster.description}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.06] hover:text-primary"
            >
              {link.label}
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
