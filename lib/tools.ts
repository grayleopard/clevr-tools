export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  category: 'compress' | 'convert' | 'generate' | 'ai';
  route: string;
  acceptedFormats: string[];
  icon: string;
  metaTitle: string;
  metaDescription: string;
  seoContent: string;
  relatedTools: string[];
  badge?: 'new' | 'popular';
}

export const tools: Tool[] = [
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Compress JPG, PNG & WebP images without losing quality.',
    category: 'compress',
    route: '/compress/image',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    icon: 'ImageDown',
    metaTitle: 'Compress Images Online Free — No Signup | clevr.tools',
    metaDescription:
      'Compress JPG, PNG, and WebP images online for free. Reduce file size up to 90% while preserving quality. No upload to servers — 100% browser-based.',
    seoContent: `
      <h2>Why Compress Images?</h2>
      <p>Large image files slow down your website, increase storage costs, and hurt your Core Web Vitals score. Compressing images is one of the easiest wins for web performance.</p>
      <h2>How It Works</h2>
      <p>Our compressor uses the Canvas API and advanced algorithms to reduce file size while maintaining visual quality. You control the quality slider from 1–100. Your files never leave your browser.</p>
      <h2>Supported Formats</h2>
      <p>Supports JPEG, PNG, and WebP. Output can be kept in the original format or converted to JPG or WebP for maximum compression.</p>
    `,
    relatedTools: ['png-to-jpg', 'qr-code-generator', 'webp-converter'],
    badge: 'popular',
  },
  {
    slug: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    shortDescription: 'Convert PNG images to JPG with a white background.',
    category: 'convert',
    route: '/convert/png-to-jpg',
    acceptedFormats: ['.png'],
    icon: 'FileImage',
    metaTitle: 'Convert PNG to JPG Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert PNG to JPG online for free. Handles transparency with a white background fill. Adjust quality. No upload — processes entirely in your browser.',
    seoContent: `
      <h2>PNG vs JPG</h2>
      <p>PNG files support transparency and lossless compression, making them ideal for logos and graphics. JPG uses lossy compression that produces much smaller files, perfect for photos and web images.</p>
      <h2>Transparency Handling</h2>
      <p>When converting PNG files with transparency, we fill the transparent areas with a white background — the standard approach for JPEG which does not support alpha channels.</p>
      <h2>How It Works</h2>
      <p>We use the HTML5 Canvas API to draw your PNG onto a canvas with a white background, then export as JPEG at your chosen quality level. Everything runs locally in your browser.</p>
    `,
    relatedTools: ['image-compressor', 'qr-code-generator', 'jpg-to-png'],
    badge: 'new',
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription: 'Generate QR codes for URLs or text. Download as PNG or SVG.',
    category: 'generate',
    route: '/generate/qr-code',
    acceptedFormats: [],
    icon: 'QrCode',
    metaTitle: 'QR Code Generator Online Free — No Signup | clevr.tools',
    metaDescription:
      'Generate QR codes for URLs and text online for free. Customize size, colors, and error correction. Download as PNG or SVG. No signup required.',
    seoContent: `
      <h2>What is a QR Code?</h2>
      <p>A QR (Quick Response) code is a two-dimensional barcode that can store URLs, text, and other data. Smartphones can scan them instantly with their cameras.</p>
      <h2>Error Correction Levels</h2>
      <p>Higher error correction means the QR code can still be scanned even if part of it is damaged or obscured. Use Level H for QR codes that will be printed on physical materials.</p>
      <h2>PNG vs SVG Download</h2>
      <p>Download PNG for digital use (websites, presentations). Download SVG for print materials — it scales to any size without pixelation.</p>
    `,
    relatedTools: ['image-compressor', 'png-to-jpg', 'url-encoder'],
    badge: 'popular',
  },
  {
    slug: 'heic-to-jpg',
    name: 'HEIC to JPG Converter',
    shortDescription: 'Convert iPhone HEIC photos to JPG — batch supported.',
    category: 'convert',
    route: '/convert/heic-to-jpg',
    acceptedFormats: ['.heic', '.heif'],
    icon: 'Smartphone',
    metaTitle: 'Convert HEIC to JPG Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert HEIC and HEIF photos from iPhone to JPG online for free. Batch convert multiple files. No upload — processes entirely in your browser.',
    seoContent: `
      <h2>What is HEIC?</h2>
      <p>HEIC (High Efficiency Image Container) is the default photo format on iPhones running iOS 11 and later. While it produces smaller files than JPEG at the same quality, HEIC is not universally supported — Windows, many websites, and older apps often require JPEG.</p>
      <h2>Why Convert HEIC to JPG?</h2>
      <p>Converting to JPG gives you universal compatibility. Share photos via email, upload to any website, and open them on any device without compatibility issues.</p>
      <h2>Batch Conversion</h2>
      <p>You can drop multiple HEIC files at once and download them all as a ZIP archive — saving time when converting a whole camera roll.</p>
    `,
    relatedTools: ['image-compressor', 'png-to-jpg', 'jpg-to-png'],
    badge: 'new',
  },
  {
    slug: 'webp-to-png',
    name: 'WebP to PNG Converter',
    shortDescription: 'Convert WebP images to lossless PNG — batch supported.',
    category: 'convert',
    route: '/convert/webp-to-png',
    acceptedFormats: ['.webp'],
    icon: 'FileImage',
    metaTitle: 'Convert WebP to PNG Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert WebP images to PNG online for free. Get lossless PNG output compatible with all applications. Batch convert multiple files. No upload required.',
    seoContent: `
      <h2>Why Convert WebP to PNG?</h2>
      <p>WebP is a modern format with great compression, but PNG enjoys near-universal support across design tools, legacy software, and platforms that don't yet accept WebP.</p>
      <h2>Lossless Output</h2>
      <p>PNG uses lossless compression, so your converted images retain every pixel of the original WebP — no quality loss during conversion.</p>
      <h2>Batch Support</h2>
      <p>Drop multiple WebP files at once and download all the PNGs in a single ZIP file.</p>
    `,
    relatedTools: ['png-to-webp', 'image-compressor', 'png-to-jpg'],
  },
  {
    slug: 'png-to-webp',
    name: 'PNG to WebP Converter',
    shortDescription: 'Convert PNG images to WebP for smaller web-ready files.',
    category: 'convert',
    route: '/convert/png-to-webp',
    acceptedFormats: ['.png'],
    icon: 'Layers',
    metaTitle: 'Convert PNG to WebP Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert PNG images to WebP format online for free. WebP files are up to 26% smaller than PNG. Adjust quality. Batch support. No upload required.',
    seoContent: `
      <h2>PNG to WebP — Smaller Files for the Web</h2>
      <p>WebP is Google's modern image format that combines the best of JPEG and PNG: lossy compression for photos and lossless compression for graphics, all in one format with smaller file sizes.</p>
      <h2>Quality Control</h2>
      <p>Use the quality slider to balance file size against image quality. A setting of 80–90% produces files visually indistinguishable from the original at a fraction of the size.</p>
      <h2>Browser Support</h2>
      <p>WebP is supported by all modern browsers including Chrome, Firefox, Safari (since 2020), and Edge. It's the recommended format for web images.</p>
    `,
    relatedTools: ['webp-to-png', 'image-compressor', 'png-to-jpg'],
    badge: 'new',
  },
  {
    slug: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    shortDescription: 'Convert JPG images to lossless PNG — batch supported.',
    category: 'convert',
    route: '/convert/jpg-to-png',
    acceptedFormats: ['.jpg', '.jpeg'],
    icon: 'FileImage',
    metaTitle: 'Convert JPG to PNG Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert JPG images to PNG format online for free. Get lossless PNG output with full quality preservation. Batch convert multiple files. No upload — 100% browser-based.',
    seoContent: `
      <h2>When to Use PNG Over JPG</h2>
      <p>PNG is better for images that require transparency, sharp edges, or lossless quality preservation. Converting a JPG to PNG won't restore lost quality but gives you a lossless container for further editing.</p>
      <h2>Batch Conversion</h2>
      <p>Drop multiple JPG files at once and download all PNGs in a ZIP archive.</p>
    `,
    relatedTools: ['png-to-jpg', 'image-compressor', 'webp-to-png'],
  },
  {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    shortDescription: 'Strip metadata and reduce PDF file size in your browser.',
    category: 'compress',
    route: '/compress/pdf',
    acceptedFormats: ['.pdf'],
    icon: 'FileText',
    metaTitle: 'Compress PDF Online Free — No Signup | clevr.tools',
    metaDescription:
      'Compress PDF files online for free. Strip metadata and reduce file size for email attachments and uploads. Batch support. No signup, no upload to servers.',
    seoContent: `
      <h2>Why Compress PDFs?</h2>
      <p>Large PDFs are hard to email and slow to download. Stripping embedded metadata and unnecessary data can meaningfully reduce file size without affecting the document's content.</p>
      <h2>What Gets Removed?</h2>
      <p>Our compressor removes embedded metadata (author, software, dates), XML metadata streams, and other optional data that inflates file size without adding value to readers.</p>
      <h2>Limitations</h2>
      <p>For PDFs that are large due to high-resolution embedded images, the reduction will be modest. Image-heavy PDFs benefit most from dedicated PDF tools that can resample images.</p>
    `,
    relatedTools: ['image-compressor', 'png-to-jpg', 'qr-code-generator'],
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    shortDescription: 'Encode or decode URLs and query string parameters.',
    category: 'generate',
    route: '/generate/url-encoder',
    acceptedFormats: [],
    icon: 'Link',
    metaTitle: 'URL Encoder & Decoder Online Free | clevr.tools',
    metaDescription:
      'Encode and decode URLs online for free. Percent-encode special characters or decode encoded URLs instantly. No signup required.',
    seoContent: `
      <h2>What is URL Encoding?</h2>
      <p>URL encoding converts special characters into a format that can be safely transmitted over the internet.</p>
    `,
    relatedTools: ['qr-code-generator', 'image-compressor', 'png-to-jpg'],
  },
  {
    slug: 'base64-encoder',
    name: 'Base64 Encoder / Decoder',
    shortDescription: 'Encode text or files to Base64 and decode back.',
    category: 'generate',
    route: '/generate/base64',
    acceptedFormats: [],
    icon: 'Code',
    metaTitle: 'Base64 Encoder & Decoder Online Free | clevr.tools',
    metaDescription:
      'Encode text or files to Base64 and decode Base64 strings online for free. No signup, instant results.',
    seoContent: `
      <h2>What is Base64?</h2>
      <p>Base64 is an encoding scheme that represents binary data as ASCII text, commonly used in email attachments and data URIs.</p>
    `,
    relatedTools: ['url-encoder', 'qr-code-generator', 'image-compressor'],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: Tool['category']): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getRelatedTools(tool: Tool): Tool[] {
  return tool.relatedTools
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t !== undefined)
    .slice(0, 4);
}

export const toolCategories = [
  { id: 'compress' as const, label: 'Compress', icon: 'Minimize2' },
  { id: 'convert' as const, label: 'Convert', icon: 'ArrowLeftRight' },
  { id: 'generate' as const, label: 'Generate', icon: 'Sparkles' },
  { id: 'ai' as const, label: 'AI Tools', icon: 'Bot' },
];
