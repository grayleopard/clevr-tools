export type SmartConverterFileType =
  | "png"
  | "jpg"
  | "gif"
  | "webp"
  | "heic"
  | "pdf"
  | "docx"
  | "unknown";

export type SmartConverterActionId =
  | "compress-gif"
  | "compress-image"
  | "to-jpg"
  | "to-png"
  | "to-webp"
  | "to-pdf"
  | "resize-image"
  | "crop-image"
  | "compress-pdf"
  | "pdf-to-jpg"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "word-to-pdf";

interface SmartConverterContract {
  actionId: SmartConverterActionId;
  route: string;
}

/**
 * Explicit source-format contracts for homepage handoff actions.
 * Do not add a pair unless the destination route accepts that source directly.
 */
export const SMART_CONVERTER_CONTRACTS: Record<
  SmartConverterFileType,
  readonly SmartConverterContract[]
> = {
  png: [
    { actionId: "compress-image", route: "/compress/image" },
    { actionId: "to-jpg", route: "/convert/png-to-jpg" },
    { actionId: "to-webp", route: "/convert/png-to-webp" },
    { actionId: "to-pdf", route: "/convert/png-to-pdf" },
    { actionId: "resize-image", route: "/tools/resize-image" },
    { actionId: "crop-image", route: "/files/image-cropper" },
  ],
  jpg: [
    { actionId: "compress-image", route: "/compress/image" },
    { actionId: "to-png", route: "/convert/jpg-to-png" },
    { actionId: "to-pdf", route: "/convert/jpg-to-pdf" },
    { actionId: "resize-image", route: "/tools/resize-image" },
    { actionId: "crop-image", route: "/files/image-cropper" },
  ],
  gif: [{ actionId: "compress-gif", route: "/tools/gif-compressor" }],
  webp: [
    { actionId: "to-png", route: "/convert/webp-to-png" },
    { actionId: "resize-image", route: "/tools/resize-image" },
  ],
  heic: [],
  pdf: [
    { actionId: "compress-pdf", route: "/compress/pdf" },
    { actionId: "pdf-to-jpg", route: "/convert/pdf-to-jpg" },
    { actionId: "merge-pdf", route: "/tools/merge-pdf" },
    { actionId: "split-pdf", route: "/tools/split-pdf" },
    { actionId: "rotate-pdf", route: "/tools/rotate-pdf" },
  ],
  docx: [{ actionId: "word-to-pdf", route: "/convert/word-to-pdf" }],
  unknown: [],
};

export function getSmartConverterActions(
  fileType: SmartConverterFileType
): SmartConverterActionId[] {
  return SMART_CONVERTER_CONTRACTS[fileType].map((contract) => contract.actionId);
}

export function getSmartConverterRoute(
  fileType: SmartConverterFileType,
  actionId: SmartConverterActionId
): string | null {
  return (
    SMART_CONVERTER_CONTRACTS[fileType].find(
      (contract) => contract.actionId === actionId
    )?.route ?? null
  );
}

export function detectSmartConverterFileType(
  file: Pick<File, "name" | "type">
): SmartConverterFileType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();
  if (mime === "image/png" || ext === "png") return "png";
  if (mime === "image/jpeg" || ext === "jpg" || ext === "jpeg") return "jpg";
  if (mime === "image/gif" || ext === "gif") return "gif";
  if (mime === "image/webp" || ext === "webp") return "webp";
  if (mime === "image/heic" || mime === "image/heif" || ext === "heic" || ext === "heif") {
    return "heic";
  }
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    ext === "docx" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  return "unknown";
}
