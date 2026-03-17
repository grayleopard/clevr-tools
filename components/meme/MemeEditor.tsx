"use client";

import { ArrowLeft, Download, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import MemeCanvas from "@/components/meme/MemeCanvas";
import TemplateGrid from "@/components/meme/TemplateGrid";
import TextControls from "@/components/meme/TextControls";
import { memeTemplates } from "@/lib/memes/templates";
import type {
  MemeStyleState,
  MemeTemplate,
  MemeTextValues,
  TextFieldConfig,
} from "@/lib/memes/types";

const defaultStyle: MemeStyleState = {
  mode: "classic",
  color: "#FFFFFF",
  fontScale: 1,
};

function createDefaultTextValues(textFields: TextFieldConfig[]): MemeTextValues {
  return Object.fromEntries(textFields.map((field) => [field.id, ""]));
}

function createUploadedTemplate(
  file: File,
  src: string,
  width: number,
  height: number
): MemeTemplate {
  const fontSize = Math.max(24, Math.round((width / 600) * 36));

  return {
    id: `upload-${Date.now()}`,
    name: file.name.replace(/\.[^.]+$/, "") || "Uploaded image",
    src,
    width,
    height,
    textFields: [
      {
        id: "top",
        label: "Top text",
        x: width * 0.05,
        y: height * 0.04,
        width: width * 0.9,
        height: height * 0.18,
        fontSize,
        align: "center",
        valign: "middle",
        color: "#FFFFFF",
        outline: true,
      },
      {
        id: "bottom",
        label: "Bottom text",
        x: width * 0.05,
        y: height * 0.78,
        width: width * 0.9,
        height: height * 0.18,
        fontSize,
        align: "center",
        valign: "middle",
        color: "#FFFFFF",
        outline: true,
      },
    ],
  };
}

interface MemeEditorProps {
  initialTemplate?: MemeTemplate;
  showDebugRegions?: boolean;
}

export default function MemeEditor({
  initialTemplate,
  showDebugRegions = false,
}: MemeEditorProps = {}) {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(
    initialTemplate ?? null
  );
  const [texts, setTexts] = useState<MemeTextValues>(
    initialTemplate ? createDefaultTextValues(initialTemplate.textFields) : {}
  );
  const [style, setStyle] = useState<MemeStyleState>(defaultStyle);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedSrc) {
        URL.revokeObjectURL(uploadedSrc);
      }
    };
  }, [uploadedSrc]);

  function releaseUploadedTemplate() {
    setUploadedSrc((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }

  function openTemplate(template: MemeTemplate) {
    startTransition(() => {
      setSelectedTemplate(template);
      setTexts(createDefaultTextValues(template.textFields));
      setStyle(defaultStyle);
    });
  }

  function handleBack() {
    releaseUploadedTemplate();
    setSelectedTemplate(null);
    setTexts({});
    setStyle(defaultStyle);
  }

  async function handleUpload(file: File) {
    const src = URL.createObjectURL(file);

    try {
      const dimensions = await new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          const image = new Image();
          image.onload = () =>
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => reject(new Error("Image load failed"));
          image.src = src;
        }
      );

      if (uploadedSrc) {
        URL.revokeObjectURL(uploadedSrc);
      }

      const template = createUploadedTemplate(
        file,
        src,
        dimensions.width,
        dimensions.height
      );
      setUploadedSrc(src);
      openTemplate(template);
    } catch {
      URL.revokeObjectURL(src);
    }
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate || isDownloading) return;

    setIsDownloading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${selectedTemplate.id}-meme.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  if (!selectedTemplate) {
    return (
      <TemplateGrid
        templates={memeTemplates}
        onUpload={handleUpload}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {initialTemplate ? (
            <Link
              href="/play/meme-generator"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/35 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              All templates
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/35 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to templates
            </button>
          )}
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {selectedTemplate.name}
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
        <div className="rounded-[28px] border border-border bg-card p-3 shadow-sm sm:p-5">
          <MemeCanvas
            ref={canvasRef}
            template={selectedTemplate}
            texts={texts}
            style={style}
            showDebugRegions={showDebugRegions}
          />
        </div>

        <div className="space-y-6">
          <TextControls
            template={selectedTemplate}
            texts={texts}
            style={style}
            onTextChange={(id, value) =>
              setTexts((current) => ({
                ...current,
                [id]: value,
              }))
            }
            onStyleChange={setStyle}
          />

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDownloading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? "Rendering PNG..." : "Download PNG"}
          </button>
        </div>
      </div>
    </section>
  );
}
