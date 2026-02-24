declare module "mammoth/mammoth.browser" {
  interface Message {
    type: string;
    message: string;
    error?: unknown;
  }

  interface ConvertResult {
    value: string;
    messages: Message[];
  }

  interface ConvertOptions {
    styleMap?: string | string[];
    includeDefaultStyleMap?: boolean;
    convertImage?: (image: { contentType: string; read: () => Promise<Buffer> }) => Promise<{ src: string }>;
    ignoreEmptyParagraphs?: boolean;
  }

  function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: ConvertOptions
  ): Promise<ConvertResult>;

  function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<ConvertResult>;
}
