import Image from "next/image";
import Link from "next/link";
import type { MemeTemplate } from "@/lib/memes/types";

interface TemplateCardProps {
  template: MemeTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      href={`/play/meme-generator/${template.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={template.src}
          alt={template.name}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-white">
          <p className="text-sm font-semibold leading-tight">{template.name}</p>
        </div>
      </div>
    </Link>
  );
}
