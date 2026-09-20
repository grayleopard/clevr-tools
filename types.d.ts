// Module declarations for packages that lack first-class TypeScript types.

declare module "pdfmake/build/pdfmake" {
  const pdfMake: {
    addVirtualFileSystem(vfs: Record<string, string>): void;
    fonts: Record<string, unknown>;
    createPdf(documentDefinition: Record<string, unknown>): {
      download(filename?: string): Promise<void>;
      getBlob(): Promise<Blob>;
      getBase64(): Promise<string>;
      getDataUrl(): Promise<string>;
    };
  };
  export = pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export = vfs;
}

declare module "html-to-pdfmake" {
  function htmlToPdfmake(
    html: string,
    options?: Record<string, unknown>
  ): unknown[];
  export = htmlToPdfmake;
}

declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  export const WorkerMessageHandler: {
    setup: (handler: unknown, port: unknown) => void;
  };
}
