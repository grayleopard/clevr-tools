export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  category: 'compress' | 'convert' | 'generate' | 'ai' | 'tools';
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
    relatedTools: ['png-to-jpg', 'png-to-webp', 'resize-image'],
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
    relatedTools: ['merge-pdf', 'split-pdf', 'pdf-to-jpg'],
  },
  // ─── New PDF Tools ────────────────────────────────────────────────────────
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    shortDescription: 'Convert PDF pages to high-quality JPG images — batch supported.',
    category: 'convert',
    route: '/convert/pdf-to-jpg',
    acceptedFormats: ['.pdf'],
    icon: 'ImageDown',
    metaTitle: 'Convert PDF to JPG Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert PDF pages to JPG images online free. Select page range, adjust quality, preview all pages. Download individually or as ZIP. No upload — 100% browser-based.',
    seoContent: `
      <h2>Why Convert PDF to JPG?</h2>
      <p>PDFs are the universal format for documents, but JPG images are universal for sharing, embedding, and displaying content. Converting PDF pages to JPG lets you share individual slides or pages via email or messaging apps, embed document content in presentations and web pages, use PDF content in image editors, and create thumbnail previews of multi-page reports. JPG is the format that works everywhere images are accepted.</p>
      <h2>Quality and Page Selection</h2>
      <p>The quality slider controls the JPG compression applied to each rendered page — higher quality produces sharper, larger files ideal for archiving or professional use, while lower quality creates smaller files perfect for web thumbnails or quick sharing. The page range selector lets you extract just the pages you need rather than converting an entire document, saving time and storage on long PDFs.</p>
      <h2>How It Works</h2>
      <p>Each PDF page is rendered to an HTML5 Canvas element using PDF.js — Mozilla's open-source PDF rendering library used in Firefox. The canvas is exported as a JPEG at your chosen quality. All processing happens entirely in your browser: no pages, no text, and no document content is ever transmitted to a server. Your PDFs and their contents stay completely private throughout the conversion process.</p>
    `,
    relatedTools: ['pdf-compressor', 'merge-pdf', 'jpg-to-pdf'],
    badge: 'popular',
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF Converter',
    shortDescription: 'Combine JPG, PNG & WebP images into a single PDF document.',
    category: 'convert',
    route: '/convert/jpg-to-pdf',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    icon: 'FileText',
    metaTitle: 'Convert JPG to PDF Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert JPG, PNG, and WebP images to PDF online free. Drag to reorder pages, choose page size, add margins. No upload — processes entirely in your browser.',
    seoContent: `
      <h2>Combine Images into a Professional PDF</h2>
      <p>Converting images to PDF is one of the most common document tasks — assembling scanned receipts, combining photo scans of a multi-page form, packaging multiple screenshots into a single shareable file, or creating a presentation-ready document from individual image files. This tool accepts JPG, PNG, and WebP images and combines them into a single, properly-formatted PDF in seconds.</p>
      <h2>Page Layout Control</h2>
      <p>Choose between A4 (international standard), US Letter (North American standard), or "Fit to Image" mode that creates a page sized exactly to each image's dimensions. Portrait and landscape orientations are supported, and an optional margin adds professional whitespace around each image. Drag-to-reorder lets you arrange images in any sequence before generating the PDF — no re-uploading required.</p>
      <h2>Private, Client-Side Processing</h2>
      <p>All PDF creation happens in your browser using pdf-lib, a pure JavaScript PDF library. Your images are never sent to any server — they're read locally, embedded into the PDF structure in memory, and the result is downloaded directly to your device. This makes it safe for scanned identification documents, private correspondence, financial statements, and any image content you'd prefer to keep off the internet.</p>
    `,
    relatedTools: ['pdf-compressor', 'png-to-pdf', 'merge-pdf'],
    badge: 'popular',
  },
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    shortDescription: 'Combine multiple PDF files into one — drag to reorder.',
    category: 'tools',
    route: '/tools/merge-pdf',
    acceptedFormats: ['.pdf'],
    icon: 'GitMerge',
    metaTitle: 'Merge PDF Files Online Free — No Signup | clevr.tools',
    metaDescription:
      'Merge multiple PDF files into one online free. Drag to reorder, see page counts. No upload — combines PDFs entirely in your browser using pdf-lib.',
    seoContent: `
      <h2>Why Merge PDFs?</h2>
      <p>Merging PDF files is one of the most frequent document tasks in modern workflows: combining chapters into a complete report, assembling contract addenda into a single file, merging bank statements for expense reporting, or packaging multiple form submissions into one document for a records system. A single merged PDF is easier to email, archive, print, and review than a collection of individual files.</p>
      <h2>Reorder Before Merging</h2>
      <p>Drag any PDF up or down to set the final page order before generating the merged file. Each card shows the filename, page count, and file size so you can confirm everything is in order. The merge produces a standard PDF file readable by Adobe Acrobat, Preview, every browser, and every mobile PDF viewer — with all original formatting, fonts, images, and bookmarks preserved.</p>
      <h2>Completely Private</h2>
      <p>PDF merging happens entirely in your browser using pdf-lib, an open-source JavaScript library. No file is ever uploaded to a server — not even temporarily. Your PDFs could contain legal contracts, medical records, financial statements, or anything else sensitive, and they will never leave your device. This is the fundamental privacy advantage of browser-based document processing over cloud-based alternatives.</p>
    `,
    relatedTools: ['split-pdf', 'pdf-compressor', 'rotate-pdf'],
    badge: 'popular',
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    shortDescription: 'Split a PDF into individual pages or custom page ranges.',
    category: 'tools',
    route: '/tools/split-pdf',
    acceptedFormats: ['.pdf'],
    icon: 'Scissors',
    metaTitle: 'Split PDF Online Free — No Signup | clevr.tools',
    metaDescription:
      'Split PDF into individual pages or custom page ranges online free. Preview page thumbnails, select exactly what you need. No upload — 100% browser-based.',
    seoContent: `
      <h2>Extract Exactly the Pages You Need</h2>
      <p>PDF documents often contain more pages than you need to share or work with: a 50-page report where you only need pages 3–7, a scanned book where you want a specific chapter, a legal document where you need to extract individual exhibits. PDF splitting lets you extract precisely the content you need without editing the original, creating focused documents for each recipient or purpose.</p>
      <h2>Three Split Modes</h2>
      <p>Split into all individual pages (one PDF per page), extract a custom page range using range notation like "1-5, 8, 11-15", or visually select specific pages by clicking thumbnails. Multiple extracted pages can be bundled into a ZIP archive for convenient download, or individual page PDFs can be downloaded one at a time. All original page content — text, images, formatting, and annotations — is preserved in every extracted page.</p>
      <h2>How PDF Splitting Works</h2>
      <p>Page extraction uses pdf-lib to read the source PDF and copy selected pages into new PDF documents. Visual page previews are rendered by PDF.js, the same engine used in Firefox. All processing runs locally in your browser — no pages of your PDF are sent to any server. This guarantees privacy for confidential documents, legal files, patient records, and any other sensitive content you need to split and share.</p>
    `,
    relatedTools: ['merge-pdf', 'rotate-pdf', 'pdf-compressor'],
  },
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    shortDescription: 'Rotate PDF pages individually or all at once.',
    category: 'tools',
    route: '/tools/rotate-pdf',
    acceptedFormats: ['.pdf'],
    icon: 'RotateCw',
    metaTitle: 'Rotate PDF Pages Online Free — No Signup | clevr.tools',
    metaDescription:
      'Rotate PDF pages online free. Fix upside-down or sideways pages individually or all at once. Preview thumbnails before saving. No upload — browser-based.',
    seoContent: `
      <h2>Fix Rotated PDF Pages</h2>
      <p>Incorrectly oriented PDF pages are a common problem: scanned documents that come out sideways, PDFs created from photos taken in landscape mode, presentations exported with mixed orientations, or signed contracts where some pages are upside-down. Sending a rotated PDF looks unprofessional and is frustrating to read — this tool fixes rotation problems permanently in a few clicks without re-scanning or re-creating the document.</p>
      <h2>Per-Page Control</h2>
      <p>Each page is shown as a thumbnail. Click any page to rotate it 90° clockwise — clicking repeatedly cycles through all four orientations (0°, 90°, 180°, 270°). Use "Rotate All" to apply the same rotation to every page at once, or rotate individual pages when only some need adjustment. A rotation indicator shows the current orientation of each page before you apply changes.</p>
      <h2>Non-Destructive Metadata Rotation</h2>
      <p>PDF rotation is stored as a metadata property on each page rather than re-rendering content. This means the rotation is applied instantly regardless of PDF complexity, and the original page content (vectors, text, images) is preserved at full quality. The output PDF is a standard, widely-compatible file that opens correctly in all PDF readers — Adobe Acrobat, Preview, browsers, and mobile apps alike.</p>
    `,
    relatedTools: ['merge-pdf', 'split-pdf', 'pdf-compressor'],
  },
  {
    slug: 'resize-image',
    name: 'Image Resizer',
    shortDescription: 'Resize images by dimensions, presets, or target file size.',
    category: 'tools',
    route: '/tools/resize-image',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    icon: 'Scaling',
    metaTitle: 'Resize Images Online Free — No Signup | clevr.tools',
    metaDescription:
      'Resize images online free. Set exact dimensions, use social media presets, or target a specific file size. Batch support, aspect ratio lock. No upload required.',
    seoContent: `
      <h2>Three Ways to Resize</h2>
      <p>Different use cases call for different resizing approaches. Exact dimensions mode lets you set precise pixel widths and heights with an aspect ratio lock that automatically calculates the proportional dimension — essential for UI design, web assets, and any context with strict size requirements. Preset mode provides ready-made dimensions for common social media formats (Instagram, Facebook, Twitter), passport photos, and standard web sizes so you don't need to memorize specifications. Target file size mode iteratively adjusts compression until your image meets an exact kilobyte limit — useful for applications with strict upload size requirements.</p>
      <h2>Quality Without Distortion</h2>
      <p>All resizing uses the HTML5 Canvas API with bicubic-equivalent scaling to produce smooth, artifact-free results. Aspect ratio locking prevents the stretching and distortion that occurs when width and height are changed independently. For batch resizing, the same settings apply to all files — useful when standardizing a collection of product photos, profile pictures, or presentation assets to consistent dimensions.</p>
      <h2>Private Browser-Based Processing</h2>
      <p>Image resizing happens entirely in your browser. Files are drawn to an HTML5 Canvas element and re-exported — no pixel data is ever transmitted to a server. Batch processing runs sequentially in memory, and all blob URLs are released after download. Your photos — including faces, locations, documents, and private content — never leave your device during any step of the process.</p>
    `,
    relatedTools: ['image-compressor', 'png-to-jpg', 'jpg-to-png'],
    badge: 'new',
  },
  {
    slug: 'png-to-pdf',
    name: 'PNG to PDF Converter',
    shortDescription: 'Convert PNG images to a PDF document — drag to reorder.',
    category: 'convert',
    route: '/convert/png-to-pdf',
    acceptedFormats: ['.png'],
    icon: 'FileText',
    metaTitle: 'Convert PNG to PDF Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert PNG images to PDF online free. Combine multiple PNGs into one PDF, drag to reorder pages, choose page size and margins. No upload required.',
    seoContent: `
      <h2>PNG to PDF for Documents and Presentations</h2>
      <p>PNG is the preferred format for screenshots, diagrams, flowcharts, and any image with sharp edges or text — making it the natural choice for document content that started as image captures. Converting PNG files to PDF creates a properly formatted, distributable document from your images: screenshots of reports, exported presentation slides, scanned pages saved as PNG, or any collection of images that needs to be packaged into a single professional document.</p>
      <h2>Lossless Embedding</h2>
      <p>Unlike JPEG, PNG uses lossless compression — every pixel is preserved exactly. When embedded in a PDF, PNG images retain full fidelity with no additional compression artifacts introduced during the conversion. This matters for screenshots with text, diagrams with fine lines, and any image where sharpness and legibility are critical. The PDF output is identical in visual quality to the original PNG source files.</p>
      <h2>Page Layout and Ordering</h2>
      <p>Drag your PNG files into any order before generating the PDF. Choose A4, US Letter, or image-fitted page sizes, and toggle margins for a clean professional look. All conversion happens in your browser using pdf-lib — no file is ever sent to a server. Your PNG files stay on your device from start to finish, keeping screenshots of private content, proprietary diagrams, and sensitive documents completely secure.</p>
    `,
    relatedTools: ['jpg-to-pdf', 'merge-pdf', 'png-to-jpg'],
  },
  // ─── Word ↔ PDF ───────────────────────────────────────────────────────────
  {
    slug: 'word-to-pdf',
    name: 'Word to PDF Converter',
    shortDescription: 'Convert .docx Word documents to PDF — 100% in your browser.',
    category: 'convert',
    route: '/convert/word-to-pdf',
    acceptedFormats: ['.docx', '.doc'],
    icon: 'FileText',
    metaTitle: 'Convert Word to PDF Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert Word documents (.docx) to PDF online free. Preview your document, choose page size and margins. No upload — processes entirely in your browser, files never leave your device.',
    seoContent: `
      <h2>Convert Word to PDF Without Sending Files to a Server</h2>
      <p>Most online Word to PDF converters upload your document to a remote server, process it there, and return a download link. This means your document — including any confidential content, personal data, legal text, or proprietary information — leaves your device and passes through someone else's infrastructure. clevr.tools converts your Word document to PDF entirely in your browser using JavaScript. Your file never leaves your device, at any point in the process.</p>
      <h2>How It Works</h2>
      <p>Your .docx file is parsed in-browser using Mammoth.js, which extracts the document content — paragraphs, headings, bold and italic text, lists, and tables — and converts it to clean HTML. That HTML is then rendered with Word-like typography (serif font, 12pt body text, proper heading hierarchy) and converted to a PDF using html2canvas and jsPDF. The result is a clean, readable PDF that accurately represents your Word document's content and structure.</p>
      <h2>What's Preserved and What Isn't</h2>
      <p>Text content, headings (H1–H6), bold, italic, bullet and numbered lists, tables, and basic formatting are faithfully converted. Complex Word features like custom macros, tracked changes, form fields, and advanced layout elements (text boxes, floating images) may not render perfectly in every case — this is a fundamental limitation of browser-based conversion without the full Word rendering engine. For documents where pixel-perfect fidelity matters, Microsoft Word's built-in "Export to PDF" function is the most reliable option. For standard documents, reports, letters, and resumes, this tool produces excellent results instantly and privately.</p>
    `,
    relatedTools: ['pdf-to-word', 'pdf-compressor', 'merge-pdf'],
    badge: 'new',
  },
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word Converter',
    shortDescription: 'Extract text from PDFs and convert to editable .docx files.',
    category: 'convert',
    route: '/convert/pdf-to-word',
    acceptedFormats: ['.pdf'],
    icon: 'FileText',
    metaTitle: 'Convert PDF to Word Online Free — No Signup | clevr.tools',
    metaDescription:
      'Convert PDF to Word (.docx) online free. Extracts text, detects headings and paragraphs, generates an editable document. No upload — 100% browser-based, files stay private.',
    seoContent: `
      <h2>Turn Static PDFs Into Editable Word Documents</h2>
      <p>PDFs are designed to be read, not edited. Converting a PDF back to Word lets you modify the content, reuse text in other documents, correct errors in a scanned report, update a contract, or extract data for further use. This tool extracts text content from your PDF using PDF.js and reconstructs it as an editable .docx file you can open in Microsoft Word, Google Docs, LibreOffice, or any other word processor.</p>
      <h2>Structure Detection</h2>
      <p>PDF files don't store document structure — they're essentially instructions for drawing characters at specific coordinates on a page. This tool analyzes the text content to infer structure: larger-than-average text is classified as headings (H1, H2, H3 depending on relative size), bold and italic formatting is detected from font names, consistent indentation patterns are detected as lists, and large gaps between text blocks are treated as paragraph breaks. The result is a structured Word document rather than a flat text dump.</p>
      <h2>What to Expect</h2>
      <p>Text-based PDFs (created from Word, InDesign, or similar tools) convert with high fidelity. Scanned PDFs (image-based, no embedded text layer) cannot have text extracted without OCR — this tool will produce a document with no content for such files. Complex multi-column layouts may produce text in a different reading order than expected, since PDF stores text by position rather than reading order. For most standard documents — reports, articles, contracts, and letters — the output is clean, accurate, and immediately usable.</p>
    `,
    relatedTools: ['word-to-pdf', 'pdf-compressor', 'split-pdf'],
    badge: 'new',
  },
  // ─── Not-yet-built tools ───────────────────────────────────────────────────
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
  { id: 'tools' as const, label: 'PDF & File Tools', icon: 'FileStack' },
  { id: 'generate' as const, label: 'Generate', icon: 'Sparkles' },
  { id: 'ai' as const, label: 'AI Tools', icon: 'Bot' },
];
