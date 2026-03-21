import Link from "next/link";
import type { ReactNode, ComponentType } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/tool/ToolCard";
import type { Tool } from "@/lib/tools";

interface CategorySection {
  title: string;
  tools?: Tool[];
  columnsClassName?: string;
  content?: ReactNode;
}

interface CategoryPageScaffoldProps {
  categoryName: string;
  headerLabel: string;
  titleLineOne: string;
  titleLineTwo: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  sections: CategorySection[];
}

export default function CategoryPageScaffold({
  categoryName,
  headerLabel,
  titleLineOne,
  titleLineTwo,
  description,
  Icon,
  sections,
}: CategoryPageScaffoldProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-16 max-w-3xl">
            <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <span>{categoryName}</span>
            </nav>

            <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-primary">
              <Icon className="h-[14px] w-[14px]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {headerLabel}
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-6xl">
              {titleLineOne}
              <br />
              <span className="text-primary">{titleLineTwo}</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section) => {
              const hasTools = (section.tools?.length ?? 0) > 0;
              const hasContent = section.content !== undefined;
              if (!hasTools && !hasContent) return null;

              return (
                <section key={section.title}>
                  <h2 className="mb-6 mt-12 text-2xl font-bold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  {hasTools ? (
                    <div className={`grid gap-4 ${section.columnsClassName ?? "lg:grid-cols-3"}`}>
                      {section.tools?.map((tool) => (
                        <ToolCard key={tool.slug} tool={tool} />
                      ))}
                    </div>
                  ) : section.content}
                </section>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
