declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: {
      unit?: string;
      format?: string | [number, number];
      orientation?: string;
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
    enableLinks?: boolean;
  }

  interface Html2PdfWorker extends Promise<void> {
    from(element: HTMLElement | string, type?: string): Html2PdfWorker;
    set(options: Html2PdfOptions): Html2PdfWorker;
    save(filename?: string): Html2PdfWorker;
    outputPdf(type: "blob"): Promise<Blob>;
    outputPdf(type: "arraybuffer"): Promise<ArrayBuffer>;
    outputPdf(type: "datauristring" | "dataurlstring"): Promise<string>;
    outputPdf(type: "bloburl" | "bloburi"): Promise<string>;
    outputPdf(type: string, options?: Record<string, unknown>): Promise<unknown>;
    toPdf(): Html2PdfWorker;
    toImg(): Html2PdfWorker;
    toCanvas(): Html2PdfWorker;
    toContainer(): Html2PdfWorker;
    get(key: "pdf"): Promise<Html2PdfWorker>;
    get<T>(key: string, cbk?: (val: T) => void): Promise<T>;
    then<T>(resolve: (val: unknown) => T): Html2PdfWorker;
    thenList(fns: Array<() => unknown>): Html2PdfWorker;
    catch(onRejected: (err: unknown) => void): Html2PdfWorker;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2PdfWorker;

  export = html2pdf;
}
