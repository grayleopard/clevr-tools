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
  /** false = page not built yet — hidden from homepage grid and sitemap */
  live?: boolean;
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
      'Compress JPG, PNG, and WebP images online for free. Reduce file size up to 90% while preserving quality. No upload to servers — 100% browser-based, instant results.',
    seoContent: `
      <h2>Why Compress Images?</h2>
      <p>Large image files slow down your website, inflate storage costs, and directly hurt your Core Web Vitals score — a factor Google uses in search rankings. The average web page loads 2–4 MB of images; compressing them to under 500 KB is one of the highest-impact performance optimizations available. Studies consistently show that each second of load time reduction improves conversion rates by 2–5%.</p>
      <h2>Quality Control</h2>
      <p>The quality slider gives you precise control over the compression trade-off. At 80%, most images are visually indistinguishable from the original while achieving 60–80% size reduction. Converting to WebP — Google's modern format — typically produces files 25–35% smaller than JPEG at equivalent quality, making it the best choice for web assets that need to load fast.</p>
      <h2>Private by Design</h2>
      <p>Every image is compressed entirely in your browser using the HTML5 Canvas API. Your files are never sent to a server, never stored, and never seen by anyone but you. This makes it safe for confidential client work, proprietary images, personal photos, and anything else you wouldn't want leaving your device.</p>
    `,
    relatedTools: ['png-to-jpg', 'png-to-webp', 'jpg-to-png'],
    badge: 'popular',
  },
  {
    slug: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    shortDescription: 'Convert PNG images to JPG with a white background fill.',
    category: 'convert',
    route: '/convert/png-to-jpg',
    acceptedFormats: ['.png'],
    icon: 'FileImage',
    metaTitle: 'Convert PNG to JPG Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert PNG to JPG online free, instantly. Handles transparency with white background fill. Adjust quality. No upload — processes entirely in your browser.',
    seoContent: `
      <h2>When to Convert PNG to JPG</h2>
      <p>PNG is a lossless format ideal for screenshots, logos, and graphics with transparent backgrounds or sharp edges. JPEG uses lossy compression optimized for photographs and images with gradual color transitions — typically producing files 5–10× smaller than equivalent PNGs. Converting to JPG makes sense when you need smaller file sizes for email, social media, or web use, and transparency isn't required.</p>
      <h2>Transparency Handling</h2>
      <p>JPEG doesn't support transparent pixels. When converting a PNG with transparency, we automatically fill transparent areas with a solid white background before encoding. This is standard practice for web images, print materials, and email attachments, and produces clean output without unexpected visual artifacts.</p>
      <h2>Choosing the Right Quality</h2>
      <p>The quality slider controls how aggressively JPEG discards visual data. For photographs, 85–90% produces results visually indistinguishable from the original at a fraction of the size. For graphics with solid colors, text, or sharp edges, stay above 90% to avoid blocky compression artifacts. Everything processes locally in your browser — no upload, no account required.</p>
    `,
    relatedTools: ['image-compressor', 'jpg-to-png', 'png-to-webp'],
    badge: 'popular',
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
      'Generate QR codes for URLs and text online free. Customize size, colors, and error correction level. Download as PNG or SVG. Instant, no signup required.',
    seoContent: `
      <h2>What is a QR Code?</h2>
      <p>A QR (Quick Response) code is a two-dimensional barcode that stores data in a grid of black and white squares. Unlike traditional barcodes, QR codes can hold significantly more information — URLs, contact details, Wi-Fi credentials, or any text. Every smartphone camera can decode them instantly without a dedicated app, making QR codes one of the most frictionless ways to share information in the physical world.</p>
      <h2>Error Correction and Reliability</h2>
      <p>QR codes include built-in error correction, allowing them to be scanned even when partially damaged or obscured. Level L corrects up to 7% of errors — suitable for clean digital displays. Level M (15%) balances size and resilience for general use. Level Q (25%) handles moderate physical wear, and Level H (30%) is essential for QR codes on merchandise, packaging, or any item that will be physically handled.</p>
      <h2>PNG vs. SVG Download</h2>
      <p>Download PNG for screen use — websites, presentations, and digital documents where pixel dimensions are fixed. Download SVG for print: as a vector format, SVG scales to any size without pixelation, making it the right choice for business cards, posters, and signage. For professional print work, 512px or larger PNG, or SVG, ensures crisp scanning at print resolution.</p>
    `,
    relatedTools: ['image-compressor', 'png-to-jpg', 'pdf-compressor'],
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
      'Convert iPhone HEIC and HEIF photos to JPG online free. Batch convert multiple files at once. No upload — processes entirely in your browser, instant results.',
    seoContent: `
      <h2>What is HEIC?</h2>
      <p>HEIC (High Efficiency Image Container) is Apple's default photo format for iPhones and iPads running iOS 11 and later. Using the HEVC codec, HEIC files are typically 40–50% smaller than JPEG at the same perceptual quality — a significant saving when a modern iPhone captures 48-megapixel photos. The trade-off is compatibility: HEIC has limited support outside Apple's ecosystem and is not natively opened on Windows, most Android apps, or web platforms.</p>
      <h2>Why Convert to JPG?</h2>
      <p>JPEG enjoys universal compatibility across every operating system, browser, application, and device manufactured in the past 30 years. Converting HEIC to JPG lets you share photos via email, upload to any website, edit in Windows applications, and print at any service — without compatibility errors. It's the format that everyone can open, everywhere, on everything.</p>
      <h2>Batch Conversion</h2>
      <p>Drop multiple HEIC files at once and our converter processes them all simultaneously in your browser using the heic2any library. Download converted JPGs individually or as a single ZIP archive. Everything runs locally — your iPhone photos never leave your device during conversion.</p>
    `,
    relatedTools: ['image-compressor', 'jpg-to-png', 'png-to-jpg'],
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
      'Convert WebP images to PNG online free. Get lossless PNG output compatible with all apps and design tools. Batch convert multiple files. No upload required.',
    seoContent: `
      <h2>Why Convert WebP to PNG?</h2>
      <p>WebP is Google's efficient image format widely used across the web, but PNG remains the universal standard for maximum application compatibility. Every design tool (Photoshop, Illustrator, Figma, Sketch), photo editor, and operating system supports PNG natively. Converting to PNG is essential when preparing images for design work, archiving assets, or working in environments that don't yet accept WebP — which still includes many older enterprise applications.</p>
      <h2>Lossless Output</h2>
      <p>PNG uses lossless compression — no image data is discarded during conversion. For lossless WebP sources, the PNG output is pixel-for-pixel identical to the original. For lossy WebP sources, PNG preserves the full decoded quality without any additional compression loss. This makes PNG ideal when you need to preserve every detail for editing, compositing, or long-term archival storage.</p>
      <h2>Batch Conversion</h2>
      <p>Drop multiple WebP files at once and download all converted PNGs individually or as a single ZIP archive. All processing is entirely client-side — your files are never uploaded to a server. This makes it safe for proprietary images, client assets, and anything you'd rather keep private.</p>
    `,
    relatedTools: ['png-to-webp', 'image-compressor', 'jpg-to-png'],
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
      'Convert PNG images to WebP format online free. WebP files are up to 35% smaller than PNG. Adjust quality, batch convert multiple files. No upload required.',
    seoContent: `
      <h2>Why Convert to WebP?</h2>
      <p>WebP is Google's modern image format, offering 25–35% smaller file sizes than PNG at equivalent visual quality. Developed for web performance, WebP is now supported by all major browsers (Chrome, Firefox, Safari since 2020, Edge) and most modern software. Switching PNG assets to WebP reduces page weight, improves load times, and can directly improve search rankings through better Core Web Vitals scores.</p>
      <h2>Quality and Compression Control</h2>
      <p>Unlike PNG (always lossless), WebP in this converter uses lossy compression with your chosen quality setting. At 80–85%, most images are visually indistinguishable from the original PNG while being dramatically smaller. For graphics, logos, or images with sharp edges and solid colors, use 90%+ to avoid compression artifacts. The quality slider lets you find the optimal balance for your specific content.</p>
      <h2>Batch Conversion</h2>
      <p>Drop multiple PNG files simultaneously and download all WebP outputs as a ZIP. Every conversion happens locally in your browser using the HTML5 Canvas API — no uploads, no account, no file size limits imposed by server quotas. Your files stay on your device throughout the entire process.</p>
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
      'Convert JPG images to PNG format online free. Lossless PNG output, full quality preservation. Batch convert multiple files. No upload — 100% browser-based.',
    seoContent: `
      <h2>When to Convert JPG to PNG</h2>
      <p>JPEG uses lossy compression — each save permanently discards image data and introduces compression artifacts. Converting to PNG provides a lossless container for further editing without compounding quality loss with each save cycle. PNG is also required when you need to add transparency (alpha channel), which JPEG cannot support. Use this tool when preparing images for UI design, logos, compositing workflows, or any editing process where maintaining quality matters.</p>
      <h2>Understanding the Conversion</h2>
      <p>Converting JPG to PNG does not restore quality lost during original JPEG compression — JPEG artifacts become part of the PNG output losslessly. What you gain is a format that won't degrade on subsequent saves. If you plan to edit and re-export multiple times, starting from PNG prevents the cumulative quality degradation that plagues multi-generation JPEG files. Think of it as locking in the current quality and preventing further loss.</p>
      <h2>Batch Processing</h2>
      <p>Drop multiple JPG or JPEG files at once and convert them all simultaneously. Download converted PNGs individually or as a single ZIP archive. All conversion happens entirely in your browser via the HTML5 Canvas API — no server uploads, no account required, and no file size limits imposed by server quotas.</p>
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
      'Compress PDF files online free. Strip metadata and reduce file size for email and uploads. No signup, no upload to servers — 100% browser-based, instant results.',
    seoContent: `
      <h2>Why Compress PDFs?</h2>
      <p>PDFs frequently contain hidden overhead that inflates file size without adding value: embedded document metadata (author names, creation dates, software version strings, revision histories), XML metadata streams, and unoptimized object cross-reference tables. Stripping this bloat can reduce file size by 10–40%, making PDFs faster to email, easier to upload to web services, and quicker to open on slow connections.</p>
      <h2>What Gets Removed?</h2>
      <p>Our compressor strips document information metadata (author, creator, producer, subject, keywords), XMP metadata streams embedded in the PDF structure, and performs structural cleanup of the PDF object table. The text, images, fonts, formatting, interactive elements, and page layout are completely preserved. The resulting PDF opens identically in every reader — Adobe Acrobat, Preview, Chrome, and mobile PDF apps alike.</p>
      <h2>Limitations to Know</h2>
      <p>This tool is most effective for PDFs padded with verbose metadata and structural overhead. For PDFs that are large primarily because of embedded high-resolution images, size reduction will be modest — image-based PDF compression requires specialist tools that resample or re-encode the embedded images. If your PDF contains scanned documents or photographs, this tool works best combined with a dedicated image compression step beforehand.</p>
    `,
    relatedTools: ['image-compressor', 'png-to-jpg', 'jpg-to-png'],
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
    live: false,
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
    live: false,
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: Tool['category']): Tool[] {
  return tools.filter((t) => t.category === category && t.live !== false);
}

export function getRelatedTools(tool: Tool): Tool[] {
  return tool.relatedTools
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t !== undefined && t.live !== false)
    .slice(0, 4);
}

export const toolCategories = [
  { id: 'compress' as const, label: 'Compress', icon: 'Minimize2' },
  { id: 'convert' as const, label: 'Convert', icon: 'ArrowLeftRight' },
  { id: 'generate' as const, label: 'Generate', icon: 'Sparkles' },
  { id: 'ai' as const, label: 'AI Tools', icon: 'Bot' },
];
