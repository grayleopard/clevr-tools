import Link from "next/link";

type RelatedClusterCategory = "pdf" | "image" | "utility";

interface RelatedToolLink {
  label: string;
  href: string;
}

interface RelatedToolsClusterProps {
  category: RelatedClusterCategory;
  currentPath?: string;
}

const CLUSTERS: Record<RelatedClusterCategory, { title: string; links: RelatedToolLink[] }> = {
  pdf: {
    title: "Related PDF Tools",
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

export default function RelatedToolsCluster({ category, currentPath }: RelatedToolsClusterProps) {
  const cluster = CLUSTERS[category];

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight">{cluster.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Explore adjacent tools in this workflow.</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cluster.links.map((link) => {
          const isCurrent = currentPath === link.href;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isCurrent ? "page" : undefined}
                className="inline-flex w-full items-center rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
