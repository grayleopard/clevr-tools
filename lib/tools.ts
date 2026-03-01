export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  category: 'compress' | 'convert' | 'generate' | 'ai' | 'tools' | 'text' | 'dev' | 'calc' | 'time' | 'type' | 'files';
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
    slug: 'pdf-to-fillable',
    name: 'PDF to Fillable PDF',
    shortDescription: 'Add fillable fields to any PDF — runs in your browser. Nothing is uploaded.',
    category: 'tools',
    route: '/tools/pdf-to-fillable',
    acceptedFormats: ['.pdf'],
    icon: 'FileStack',
    metaTitle: 'PDF to Fillable PDF Online Free — No Signup | clevr.tools',
    metaDescription:
      'Create fillable PDF forms online for free. Add text fields, checkboxes, date fields, and signature boxes in your browser. Private local processing, no upload.',
    seoContent: `
      <h2>Create Fillable Forms Without Uploading Your PDF</h2>
      <p>Turning a static PDF into a form usually means opening desktop software or uploading files to a cloud service. This tool lets you add form fields directly in your browser using visual placement and instant export. Everything runs locally, so your PDF stays private on your device from start to finish.</p>
      <h2>Visual Field Placement</h2>
      <p>Upload a PDF, choose a field type, click to place it, then drag or resize as needed. You can add text inputs, checkboxes, date fields, and signature fields across multiple pages. A side panel keeps your field list organized so you can quickly rename, edit, or remove fields before exporting.</p>
      <h2>AcroForm Output Compatibility</h2>
      <p>The exported file uses standard PDF AcroForm fields supported by major PDF readers, including Adobe Acrobat, browser viewers, and many mobile apps. This makes it practical for contracts, onboarding forms, internal checklists, and any workflow that needs editable PDF fields without exposing documents to external servers.</p>
    `,
    relatedTools: ['merge-pdf', 'split-pdf', 'rotate-pdf'],
    badge: 'new',
    live: false,
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
    relatedTools: ['pdf-compressor', 'merge-pdf'],
    badge: 'new',
  },
  // ─── Text Tools ───────────────────────────────────────────────────────────
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, paragraphs, and more — in real time.',
    category: 'text',
    route: '/text/word-counter',
    acceptedFormats: [],
    icon: 'Hash',
    metaTitle: 'Word Counter — Count Words & Characters Free Online | clevr.tools',
    metaDescription:
      'Free online word counter. Count words, characters, sentences, paragraphs, and lines in real time. Calculate reading time and speaking time. No signup required.',
    seoContent: `
      <h2>Free Online Word Counter</h2>
      <p>Whether you're writing an essay with a strict word limit, crafting a blog post targeting a specific length, or checking that a social media caption fits within a character limit, our word counter gives you the numbers you need instantly. Paste any text and see words, characters, sentences, paragraphs, reading time, and speaking time update in real time — no button to click, no page to reload.</p>
      <h2>Why Word Count Matters</h2>
      <p>Academic submissions, grant applications, and journalist pitches often have strict word count requirements — going over or under can mean rejection. Blog posts targeting SEO typically perform best between 1,500–2,500 words. Twitter/X allows 280 characters, Instagram captions 2,200, LinkedIn posts 3,000. Reading time estimates help readers know what they're committing to — research shows that displaying "5 min read" at the top of an article increases click-through rates. This tool handles all of these use cases from a single input.</p>
      <h2>Reading Time and Speaking Time</h2>
      <p>Reading time is calculated at 238 words per minute — the average silent reading speed for adults based on academic research. Speaking time uses 150 words per minute, a comfortable conversational pace suitable for podcasts, presentations, and speeches. Both figures give you a practical sense of how long it will take your audience to engage with your content, helping you calibrate length for the medium.</p>
    `,
    relatedTools: ['case-converter', 'lorem-generator', 'remove-line-breaks'],
    badge: 'popular',
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    shortDescription: 'Convert text between uppercase, lowercase, title case, camelCase, and more.',
    category: 'text',
    route: '/text/case-converter',
    acceptedFormats: [],
    icon: 'CaseSensitive',
    metaTitle: 'Case Converter — Uppercase, Lowercase, Title Case & More | clevr.tools',
    metaDescription:
      'Free online case converter. Convert text to uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, and more. Instant, no signup.',
    seoContent: `
      <h2>Free Online Case Converter</h2>
      <p>Text case conversion is a daily task for developers, writers, and content managers. This tool converts any text between ten common case formats instantly — no copy-paste-retype cycle needed. Paste your text, click the target format, and copy the result to your clipboard. Everything runs in your browser with no data sent anywhere.</p>
      <h2>Programming Case Formats</h2>
      <p>Coding conventions vary by language and framework. JavaScript and TypeScript use camelCase for variables and PascalCase for classes and components. Python uses snake_case for variables and functions. URLs, CSS class names, and command-line arguments use kebab-case. Configuration keys and package names sometimes use dot.case. Having a quick converter eliminates the mental overhead of reformatting between standards when moving text between systems, renaming variables, or writing documentation.</p>
      <h2>Writing and Content Case Formats</h2>
      <p>Title Case capitalizes the first letter of every word — the standard for headlines, headings, and proper nouns in English-language publishing. Sentence case capitalizes only the first word of each sentence, which is the default for body text and most UI strings. UPPER CASE is used for acronyms, emphasis, and certain legal and regulatory contexts. Toggle Case flips the case of every character, a quick way to undo an accidental Caps Lock or create stylized text for creative use.</p>
    `,
    relatedTools: ['word-counter', 'remove-line-breaks', 'text-to-slug'],
    badge: 'new',
  },
  {
    slug: 'lorem-generator',
    name: 'Lorem Ipsum Generator',
    shortDescription: 'Generate placeholder text by paragraphs, sentences, or word count.',
    category: 'text',
    route: '/text/lorem-generator',
    acceptedFormats: [],
    icon: 'AlignLeft',
    metaTitle: 'Lorem Ipsum Generator — Free Placeholder Text Online | clevr.tools',
    metaDescription:
      'Generate lorem ipsum placeholder text free. Choose paragraphs, sentences, or words. Copy instantly. No signup — generate realistic Latin filler text for design and development.',
    seoContent: `
      <h2>Free Lorem Ipsum Generator</h2>
      <p>Lorem ipsum placeholder text is the standard filler content for visual design, web development, and print layout. It lets designers and developers work on typography, spacing, and layout without waiting for real content — and without the distraction of meaningful words pulling focus away from the visual elements being evaluated. This generator produces properly structured lorem ipsum text in paragraphs, sentences, or individual words on demand.</p>
      <h2>The Origin of Lorem Ipsum</h2>
      <p>Lorem ipsum text is derived from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (On the Ends of Good and Evil) by the Roman statesman Cicero, written in 45 BC. The scrambled version used today has been the industry's standard dummy text since the 1960s, when Letraset sheets popularized it for dry-transfer lettering. It was further spread by desktop publishing software like Aldus PageMaker in the 1980s. Its nonsensical Latin origins are exactly what make it useful — recognizable enough to signal "placeholder" while remaining unreadable enough not to distract.</p>
      <h2>When to Use Placeholder Text</h2>
      <p>Lorem ipsum is appropriate in wireframes, mockups, and prototypes — anywhere real copy doesn't exist yet and visual structure is what's being evaluated. In client presentations, it prevents feedback about specific word choices when the goal is to get layout approval. In development, it fills database fixtures, demo accounts, and test environments with realistic-looking text. The key is to replace it with real content before any user-facing launch — search engines penalize lorem ipsum as thin or duplicate content.</p>
    `,
    relatedTools: ['word-counter', 'case-converter', 'remove-line-breaks'],
    badge: 'new',
  },
  {
    slug: 'remove-line-breaks',
    name: 'Remove Line Breaks',
    shortDescription: 'Clean up messy text — remove line breaks, extra spaces, and empty lines.',
    category: 'text',
    route: '/text/remove-line-breaks',
    acceptedFormats: [],
    icon: 'Eraser',
    metaTitle: 'Remove Line Breaks Online Free — Clean Up Text | clevr.tools',
    metaDescription:
      'Remove line breaks, extra spaces, and empty lines from text online free. Clean up text copied from PDFs, emails, or documents. Instant, no signup required.',
    seoContent: `
      <h2>Remove Line Breaks & Extra Spaces Online</h2>
      <p>Text copied from PDFs, scanned documents, email threads, terminal output, or online articles frequently contains unwanted line breaks, double spaces, and empty lines that make it unusable in other contexts. Pasting such text into a form field, email body, or database typically preserves all that invisible whitespace, creating formatting problems that require tedious manual cleanup. This tool automates that cleanup in a single click.</p>
      <h2>Common Use Cases</h2>
      <p>PDF text extraction is notoriously prone to inserting hard line breaks at the end of each visual line, turning continuous paragraphs into dozens of short fragments. Email forwarding chains accumulate indentation and quote markers. Terminal logs mix command output with prompt characters. Spreadsheet exports contain inconsistent spacing between fields. The Remove Line Breaks operation joins all these fragments back into proper continuous text, while Remove Extra Spaces normalizes inconsistent whitespace that results from other formatting issues.</p>
      <h2>Working With the Tools</h2>
      <p>Each cleaning operation is applied separately so you can chain them in any order. "Remove Line Breaks" replaces each newline with a single space and collapses multiple spaces. "Remove Empty Lines" preserves the paragraph structure of intentional line breaks while eliminating the blank lines between them. "Clean All" applies all operations at once for the fastest single-click cleanup. "Trim Each Line" is useful for pasted code or lists where you want to normalize indentation without losing the line structure.</p>
    `,
    relatedTools: ['word-counter', 'case-converter', 'text-to-slug'],
    badge: 'new',
  },
  {
    slug: 'text-to-slug',
    name: 'Text to Slug',
    shortDescription: 'Convert any text to a clean, URL-friendly slug instantly.',
    category: 'text',
    route: '/text/text-to-slug',
    acceptedFormats: [],
    icon: 'Link2',
    metaTitle: 'Text to Slug Converter — Free URL Slug Generator | clevr.tools',
    metaDescription:
      'Convert text to a URL-friendly slug instantly. Handles accented characters, spaces, symbols. Real-time output, copy to clipboard. Free, no signup required.',
    seoContent: `
      <h2>Free Text to URL Slug Converter</h2>
      <p>A URL slug is the human-readable part of a URL that identifies a specific page — the "how-to-make-sourdough-bread" in "yoursite.com/recipes/how-to-make-sourdough-bread". Good slugs are all lowercase, contain only letters, numbers, and hyphens, and accurately reflect the page's content. This converter turns any title, heading, or phrase into a clean, properly-formatted slug in real time as you type.</p>
      <h2>SEO Impact of URL Slugs</h2>
      <p>URL slugs are one of the few remaining on-page SEO signals that search engines weigh directly. Google's own documentation recommends using words in URLs and avoiding parameter-heavy URLs. A keyword-rich, human-readable slug helps both search engines and users understand page content before clicking. Slugs also appear in search results snippets, and shorter, cleaner URLs consistently show higher click-through rates than long, parameter-laden alternatives. When publishing a blog post, article, or product page, getting the slug right before publication matters — changing a URL after it's indexed requires 301 redirects to preserve SEO value.</p>
      <h2>Handling International Characters</h2>
      <p>Accented characters (é, ü, ñ, ø, etc.) are normalized to their ASCII equivalents using Unicode NFD decomposition before the slug is generated. This means "Crème brûlée" becomes "creme-brulee" rather than containing encoded Unicode sequences in the URL. The result is a slug that works correctly in all browsers, tools, and file systems without any special encoding or escaping required.</p>
    `,
    relatedTools: ['case-converter', 'remove-line-breaks', 'word-counter'],
    badge: 'new',
  },
  // ─── Character Counter ───────────────────────────────────────────────────
  {
    slug: 'character-counter',
    name: 'Character Counter',
    shortDescription: 'Count characters, words, and lines. See real-time limits for Twitter, Instagram, SMS, and more.',
    category: 'text',
    route: '/text/character-counter',
    acceptedFormats: [],
    icon: 'Hash',
    metaTitle: 'Character Counter Online — Count Characters Free | clevr.tools',
    metaDescription: 'Free online character counter. Count characters with and without spaces, words, sentences, and lines. See real-time character limits for Twitter, Instagram, SMS, meta descriptions, and more.',
    seoContent: `<h2>Why Character Count Matters</h2>
<p>Whether you're writing a tweet, crafting an SMS, or optimizing a meta description for SEO, character limits define what you can say. Going over the limit means your message gets cut off, your tweet gets truncated, or your meta description gets replaced by Google's own snippet.</p>
<p>Different platforms have different limits: Twitter/X allows 280 characters per post, SMS messages are typically limited to 160 characters (longer messages get split into multiple segments), and SEO best practices suggest keeping meta descriptions under 160 characters for optimal display in search results.</p>
<p>Our character counter updates in real time as you type, so you always know exactly where you stand. It tracks raw character count, characters without spaces, word count, sentence count, and line count — plus it shows you your character usage against the most common platform limits with a visual indicator.</p>`,
    relatedTools: ['word-counter', 'case-converter', 'text-to-slug'],
  },
  // ─── Dev Tools ──────────────────────────────────────────────────────────
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Format, validate, and minify JSON. Instant error detection with line numbers.',
    category: 'dev',
    route: '/dev/json-formatter',
    acceptedFormats: [],
    icon: 'Braces',
    metaTitle: 'JSON Formatter & Validator Online Free | clevr.tools',
    metaDescription: 'Free online JSON formatter, validator, and beautifier. Paste JSON to format it with proper indentation, validate it for errors, or minify it. Instant error detection with line numbers.',
    seoContent: `<h2>Format and Validate JSON Online</h2>
<p>JSON (JavaScript Object Notation) is the universal data format for APIs, configuration files, and data exchange. When working with raw JSON from an API response, a database export, or a config file, it's often minified — stripped of all whitespace to save bandwidth. That makes it nearly impossible to read or debug.</p>
<p>This JSON formatter instantly beautifies minified JSON with proper indentation, making nested objects and arrays easy to navigate. It also validates your JSON as you paste it, catching syntax errors like missing commas, unclosed brackets, or incorrect data types — with the exact position of the error so you can fix it fast.</p>
<p>Use the minify option to do the reverse: compact JSON into a single line for use in API calls, environment variables, or anywhere you need to minimize payload size.</p>`,
    relatedTools: ['base64', 'url-encoder'],
  },
  {
    slug: 'find-and-replace',
    name: 'Find & Replace',
    shortDescription: 'Find and replace text online. Supports plain text, case-sensitive, and regex modes.',
    category: 'text',
    route: '/text/find-and-replace',
    acceptedFormats: [],
    icon: 'Replace',
    metaTitle: 'Find and Replace Text Online Free | clevr.tools',
    metaDescription: 'Free online find and replace tool. Replace text, fix repeated typos, and batch-edit documents. Supports case-sensitive search, whole word matching, and regular expressions.',
    seoContent: `<h2>Find and Replace Text Online</h2>
<p>Need to fix a repeated typo across a long document, replace all instances of a name, or batch-edit a list of URLs? This tool lets you find any text and replace it with something else — across your entire pasted content in one click.</p>
<p>Beyond simple text replacement, it supports regular expressions for advanced users who need to match patterns rather than literal strings. Use regex to find phone numbers, email addresses, dates in a specific format, or anything else that follows a predictable pattern — then replace them all at once.</p>
<p>The match counter updates in real time as you type your search term, so you always know how many replacements will be made before you apply them.</p>`,
    relatedTools: ['word-counter', 'sort-lines', 'remove-line-breaks'],
  },
  {
    slug: 'sort-lines',
    name: 'Sort Lines',
    shortDescription: 'Sort lines of text alphabetically, by length, randomly, or remove duplicates.',
    category: 'text',
    route: '/text/sort-lines',
    acceptedFormats: [],
    icon: 'ArrowUpDown',
    metaTitle: 'Sort Lines Online Free — Alphabetically, by Length | clevr.tools',
    metaDescription: 'Free online line sorter. Sort lines alphabetically A-Z or Z-A, sort by length, randomize order, or remove duplicate lines instantly.',
    seoContent: `<h2>Sort Lines of Text Online</h2>
<p>Sorting lines of text is a surprisingly common task: alphabetizing a list of names, ordering URLs, deduplicating a set of keywords, or randomizing the order of items for a quiz or drawing. This tool handles it all without needing to open a spreadsheet or write a script.</p>
<p>Paste any multi-line content — a list, a CSV column, a set of tags, or exported data — and sort it instantly. The tool handles case-insensitive alphabetical sorting by default, so "Apple" and "apple" sort together rather than being separated by ASCII value differences.</p>
<p>The "Remove Duplicates" option works independently from sorting, so you can clean up a list without reordering it — or combine it with sorting to get a clean, alphabetized, deduplicated list in one step.</p>`,
    relatedTools: ['find-and-replace', 'remove-line-breaks', 'word-counter'],
  },
  {
    slug: 'base64',
    name: 'Base64 Encode / Decode',
    shortDescription: 'Encode text to Base64 or decode Base64 back to plain text. Handles Unicode.',
    category: 'dev',
    route: '/dev/base64',
    acceptedFormats: [],
    icon: 'Binary',
    metaTitle: 'Base64 Encoder / Decoder Online Free | clevr.tools',
    metaDescription: 'Free online Base64 encoder and decoder. Encode plain text to Base64 or decode Base64 back to readable text. Handles Unicode characters. Instant, bidirectional, no data sent to server.',
    seoContent: `<h2>Base64 Encoding and Decoding</h2>
<p>Base64 is an encoding scheme that converts binary data into ASCII text, making it safe to transmit in contexts that only support text — like email, URLs, or JSON payloads. You'll encounter Base64 everywhere in web development: data URIs for embedding images in CSS, Basic Auth headers, JWT tokens, and API responses that include binary data.</p>
<p>Decoding Base64 is equally common when debugging API responses, inspecting JWT payloads (the middle section of a JWT is Base64-encoded JSON), or reading encoded values from environment variables or config files.</p>
<p>This tool handles Unicode characters correctly — most naive implementations using just <code>btoa()</code> break on non-ASCII text like accented characters or emoji. Our encoder uses proper UTF-8 encoding so international text is handled correctly in both directions.</p>`,
    relatedTools: ['json-formatter', 'url-encoder'],
  },
  // ─── Generate Tools ──────────────────────────────────────────────────────
  {
    slug: 'password-generator',
    name: 'Password Generator',
    shortDescription: 'Generate strong, random passwords with custom length and character sets.',
    category: 'generate',
    route: '/generate/password',
    acceptedFormats: [],
    icon: 'KeyRound',
    metaTitle: 'Password Generator — Secure Random Passwords Free | clevr.tools',
    metaDescription: 'Free secure password generator. Create strong, random passwords with custom length (4–128 chars), uppercase, lowercase, numbers, and symbols. Uses cryptographic randomness. No data sent to server.',
    seoContent: `<h2>Free Secure Password Generator</h2>
<p>This password generator creates cryptographically secure random passwords using your browser's built-in <code>crypto.getRandomValues()</code> API — the same source of randomness used in encryption software and security tools. Unlike generators that use <code>Math.random()</code>, which is predictable and unsuitable for security purposes, every password created here is truly unpredictable.</p>
<p>Customize your password length from 4 to 128 characters and choose which character sets to include: uppercase letters, lowercase letters, numbers, and symbols. The "exclude ambiguous characters" option removes look-alike characters like <code>0</code>, <code>O</code>, <code>1</code>, <code>l</code>, and <code>I</code> — useful when you need to type a password manually rather than paste it.</p>
<h2>What Makes a Strong Password?</h2>
<p>Password strength comes down to two factors: length and character diversity. A 16-character password using all four character types has roughly 95^16 possible combinations — more than 10^31. That's beyond the reach of any brute-force attack with current technology. By contrast, an 8-character password using only lowercase letters has just 26^8 combinations, which modern hardware can crack in seconds.</p>
<p>Our strength meter calculates entropy — a measure of randomness measured in bits — and estimates how long a brute-force attack would take at 10 billion guesses per second. This represents a well-funded attacker using modern GPU hardware. For context, a 16-character password using all character types reaches roughly 105 bits of entropy and would take approximately 100 million years to crack. A simple 8-character lowercase password has just 37 bits of entropy and could be cracked in under a minute.</p>
<p>Security experts recommend using a unique password for every account, never reusing passwords, and using a password manager to store them. Generate a long, random password here and let your password manager handle the rest.</p>`,
    relatedTools: ['qr-code-generator', 'base64', 'random-number'],
  },
  {
    slug: 'random-number',
    name: 'Random Number Generator',
    shortDescription: 'Generate random numbers in any range. Supports multiple results, dice, and coin flip.',
    category: 'generate',
    route: '/generate/random-number',
    acceptedFormats: [],
    icon: 'Dices',
    metaTitle: 'Random Number Generator — Free Online RNG | clevr.tools',
    metaDescription: 'Free random number generator. Generate random numbers in any range, pick multiple numbers, flip a coin, or roll dice. Uses cryptographic randomness for true fairness.',
    seoContent: `<h2>Free Random Number Generator</h2>
<p>This random number generator uses your browser's <code>crypto.getRandomValues()</code> API to produce truly random numbers — not pseudo-random numbers from a predictable algorithm. That makes it suitable for giveaways, raffles, games, statistical sampling, and any situation where fairness matters.</p>
<p>Common uses include picking a random winner from a numbered list, selecting a random item from a menu, generating test data, deciding who goes first in a game, or making any decision where you want genuine chance rather than personal bias.</p>
<h2>How Our Random Number Generator Works</h2>
<p>Standard programming languages use pseudo-random number generators (PRNGs) seeded by the current time. These are fast and fine for most purposes, but they're mathematically predictable. Our generator uses hardware entropy collected by your operating system — sources like CPU timing jitter, mouse movement, and other unpredictable physical signals. The result is numbers that cannot be predicted or reproduced.</p>`,
    relatedTools: ['password-generator', 'qr-code-generator'],
  },
  // ─── Dev Tools (additional) ─────────────────────────────────────────────
  {
    slug: 'color-picker',
    name: 'Color Picker',
    shortDescription: 'Pick colors and convert between HEX, RGB, HSL, and HSB formats instantly.',
    category: 'dev',
    route: '/dev/color-picker',
    acceptedFormats: [],
    icon: 'Pipette',
    metaTitle: 'Color Picker — HEX, RGB, HSL Converter Free | clevr.tools',
    metaDescription: 'Free online color picker and converter. Pick any color and instantly get its HEX, RGB, HSL, and HSB values. One-click copy for each format. No ads, no signup.',
    seoContent: `<h2>Free Online Color Picker</h2>
<p>Pick any color using the visual color picker and instantly see its value in every common format: HEX for CSS and HTML, RGB for digital design and CSS, HSL for intuitive color adjustments, and HSB/HSV for Photoshop and illustration tools. Every format has a one-click copy button so you can drop the value straight into your code or design tool.</p>
<p>The recently-used colors panel remembers up to 10 colors you've picked in the current session, so you can easily compare swatches or return to a color you were working with. Edit any input field directly to jump to a specific color — enter a hex code, adjust an RGB channel, or tweak HSL lightness — and all other fields update instantly.</p>
<h2>HEX, RGB, HSL — Color Formats Explained</h2>
<p><strong>HEX</strong> (#3B82F6) is the standard format for web development — used in HTML, CSS, SVG, and almost every design tool. It encodes red, green, and blue as two-digit hexadecimal values. <strong>RGB</strong> (rgb(59, 130, 246)) is more readable for developers working directly in CSS and is the native color space for screens. <strong>HSL</strong> (hsl(217, 91%, 60%)) stands for Hue, Saturation, Lightness — it's the most intuitive format for humans since you can adjust brightness or saturation without mentally recalculating all three channels. <strong>HSB/HSV</strong> (Hue, Saturation, Brightness) is commonly used in graphics applications like Photoshop and Figma's color panels.</p>`,
    relatedTools: ['json-formatter', 'base64'],
  },
  // ─── Calculators ───────────────────────────────────────────────────────
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    shortDescription: 'Calculate percentages, percentage change, and what percent X is of Y.',
    category: 'calc',
    route: '/calc/percentage',
    acceptedFormats: [],
    icon: 'Percent',
    metaTitle: 'Percentage Calculator — Free Online Percent Tool | clevr.tools',
    metaDescription: 'Free percentage calculator. Find what X% of Y is, calculate what percent one number is of another, or compute percentage increase and decrease. Instant results.',
    seoContent: `<h2>Free Percentage Calculator</h2>
<p>Percentages come up constantly in everyday life — calculating a restaurant tip, figuring out a sale discount, understanding a grade, or working out how much tax to add to a price. This calculator handles three common percentage problems in one place, with results updating in real time as you type.</p>
<p>No more second-guessing whether you're doing the math right. Enter your numbers, pick the type of calculation, and get the answer — along with the formula used, so you understand how it was calculated and can do it yourself next time.</p>
<h2>How to Calculate Percentages</h2>
<p>There are three fundamental percentage calculations. <strong>Finding a percentage of a number</strong>: multiply the number by the percentage and divide by 100. For example, 15% of 200 = (15 / 100) x 200 = 30. <strong>Finding what percentage one number is of another</strong>: divide the part by the whole and multiply by 100. For example, 30 is what % of 200? = (30 / 200) x 100 = 15%. <strong>Percentage change</strong>: subtract the original from the new value, divide by the original, and multiply by 100. For example, 200 to 250 = ((250 - 200) / 200) x 100 = +25%.</p>`,
    relatedTools: ['unit-converter'],
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    shortDescription: 'Convert between units of length, weight, temperature, volume, area, speed, and data.',
    category: 'calc',
    route: '/calc/unit-converter',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Unit Converter — Free Online Conversion Tool | clevr.tools',
    metaDescription: 'Free online unit converter. Convert length, weight, temperature, volume, area, speed, and data units. Instant bidirectional conversion with 60+ units.',
    seoContent: `<h2>Free Online Unit Converter</h2>
<p>Convert between units across seven major categories: length (millimeters to miles), weight (milligrams to tons), temperature (Celsius, Fahrenheit, Kelvin), volume (milliliters to gallons), area (square centimeters to acres), speed (meters per second to miles per hour), and digital storage (bits to petabytes). All conversions happen instantly as you type — edit either side and the other updates automatically.</p>
<p>Whether you're a student working on a physics problem, a home cook converting a recipe from US to metric, or a developer calculating file sizes, this converter handles the math so you don't have to.</p>
<h2>Common Unit Conversions</h2>
<p>Some of the most-searched conversions: <strong>1 kg = 2.20462 lbs</strong>, <strong>1 inch = 2.54 cm</strong>, <strong>0 C = 32 F</strong>, <strong>1 mile = 1.60934 km</strong>, <strong>1 gallon = 3.78541 liters</strong>, <strong>1 GB = 1,024 MB</strong>. The unit converter above handles all of these and hundreds more combinations within each category.</p>`,
    relatedTools: ['percentage-calculator'],
  },
  // ─── Not-yet-built tools ───────────────────────────────────────────────────
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    shortDescription: 'Encode or decode URLs and query string parameters.',
    category: 'dev',
    route: '/dev/url-encoder',
    acceptedFormats: [],
    icon: 'Link',
    metaTitle: 'URL Encoder & Decoder Online Free | clevr.tools',
    metaDescription:
      'Free online URL encoder and decoder. Encode special characters with percent-encoding or decode URL-encoded strings. Supports both encodeURI and encodeURIComponent modes.',
    seoContent: `<h2>What is URL Encoding?</h2>
<p>URL encoding (also called percent-encoding) converts special characters into a format safe for transmission in URLs. Characters like spaces, ampersands, question marks, and non-ASCII characters are replaced with a percent sign followed by their hexadecimal value (e.g., a space becomes %20). This ensures URLs are valid and parsed correctly by browsers and servers.</p>
<p>JavaScript provides two levels of encoding: <code>encodeURIComponent()</code> encodes almost all special characters and is the right choice for encoding individual query string values. <code>encodeURI()</code> preserves URL structure characters like <code>:</code>, <code>/</code>, <code>?</code>, and <code>#</code>, making it suitable for encoding an entire URL without breaking its structure. This tool supports both modes so you can pick the one that fits your use case.</p>`,
    relatedTools: ['base64', 'json-formatter'],
  },
  // ─── Time Tools ──────────────────────────────────────────────────────────
  {
    slug: 'timer',
    name: 'Timer',
    shortDescription: 'Countdown timer with sound alerts and quick presets. Works in background tabs.',
    category: 'time',
    route: '/time/timer',
    acceptedFormats: [],
    icon: 'Timer',
    metaTitle: 'Online Timer — Free Countdown Timer with Sound | clevr.tools',
    metaDescription: 'Free online countdown timer with sound alert. Set hours, minutes, and seconds. Quick presets: 1, 5, 10, 25, 30 minutes. Page title shows countdown so you can see time in your browser tab.',
    seoContent: `<h2>Free Online Timer</h2><p>Set a countdown timer for cooking, workouts, study sessions, meeting presentations, classroom activities, or any task that needs a time limit. Quick preset buttons for the most common durations — 1, 3, 5, 10, 15, 25, 30 minutes, and 1 hour — get you started with one click.</p><p>The timer continues counting down even when you switch to another browser tab. Your browser tab title shows the remaining time (e.g., "05:23 — Timer") so you can glance at your taskbar without switching back. When the timer reaches zero, you'll hear a clear audio alert and see a visual notification on the page.</p>`,
    relatedTools: ['stopwatch', 'pomodoro'],
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch',
    shortDescription: 'Precise online stopwatch with lap timing. Highlights fastest and slowest laps.',
    category: 'time',
    route: '/time/stopwatch',
    acceptedFormats: [],
    icon: 'Watch',
    metaTitle: 'Online Stopwatch — Free Lap Timer | clevr.tools',
    metaDescription: 'Free online stopwatch with lap timing. Record split times, track laps, and compare your fastest and slowest laps. Display updates at 60fps for precision timing.',
    seoContent: `<h2>Free Online Stopwatch</h2><p>A precise stopwatch with lap timing for sports training, cooking, lab experiments, presentations, game timing, and any activity where split times matter. Record unlimited laps and see your total elapsed time alongside each individual lap time.</p><p>The fastest and slowest laps are automatically highlighted in green and red so you can instantly identify your best and worst splits. Copy all lap times as text for sharing or logging. The display updates every frame for smooth, accurate time reading down to hundredths of a second.</p>`,
    relatedTools: ['timer', 'pomodoro'],
  },
  {
    slug: 'pomodoro',
    name: 'Pomodoro Timer',
    shortDescription: 'Pomodoro Technique timer with focus/break cycles and customizable intervals.',
    category: 'time',
    route: '/time/pomodoro',
    acceptedFormats: [],
    icon: 'Brain',
    metaTitle: 'Pomodoro Timer Online Free — Focus & Break Timer | clevr.tools',
    metaDescription: 'Free Pomodoro timer. Customizable 25-minute focus sessions with 5-minute short breaks and 15-minute long breaks. Sound alerts, session tracking, and auto-start option.',
    seoContent: `<h2>Free Pomodoro Timer</h2><p>The Pomodoro Technique is a time management method developed by Francesco Cirillo. Work in 25-minute focused sessions (pomodoros), take a 5-minute short break, then after four sessions take a longer 15-minute break. This cycle helps maintain concentration and prevents mental fatigue.</p><p>Customize the focus duration, short break, and long break lengths to fit your work style. Some people find 50/10 or 90-minute sessions work better for deep work. Sound alerts between sessions let you know when it's time to switch — so you can fully focus without watching the clock.</p>`,
    relatedTools: ['timer', 'stopwatch'],
  },
  // ─── Calculators (additional) ───────────────────────────────────────────
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate your exact age in years, months, days, hours, and minutes from your birthday.',
    category: 'calc',
    route: '/calc/age',
    acceptedFormats: [],
    icon: 'Cake',
    metaTitle: 'Age Calculator — How Old Am I? Free Online Tool | clevr.tools',
    metaDescription: 'Free age calculator. Enter your date of birth to find your exact age in years, months, days, hours, and minutes. Also shows next birthday, zodiac sign, Chinese zodiac, and generation.',
    seoContent: `<h2>Free Age Calculator</h2><p>Calculate your exact age down to the day from your date of birth. Useful for filling out forms and applications that require your age, calculating age for legal thresholds, tracking milestones, or satisfying curiosity about exactly how old you are in days or hours.</p><p>Beyond basic age calculation, this tool shows your Western zodiac sign, Chinese zodiac animal, the day of the week you were born on, your generational category (Boomer, Gen X, Millennial, Gen Z, or Gen Alpha), and a countdown to your next birthday.</p>`,
    relatedTools: ['date-difference', 'percentage-calculator'],
  },
  {
    slug: 'date-difference',
    name: 'Date Difference',
    shortDescription: 'Calculate days, weeks, and business days between any two dates.',
    category: 'calc',
    route: '/calc/date-difference',
    acceptedFormats: [],
    icon: 'CalendarDays',
    metaTitle: 'Date Difference Calculator — Days Between Dates Free | clevr.tools',
    metaDescription: 'Free date difference calculator. Find the exact number of days, weeks, months, and business days between any two dates. Includes weekday count and weekend count.',
    seoContent: `<h2>Free Date Difference Calculator</h2><p>Calculate the exact number of days between any two dates for project planning, contract deadlines, travel planning, age verification, countdown to events, or calculating durations. Enter a start and end date to see the difference in days, weeks, months, and years.</p><p>The business days calculation excludes Saturdays and Sundays to give you a working-day count, useful for estimating project timelines and delivery windows. Quick shortcuts for common calculations — days until New Year, days until Christmas, 90 days from today — make frequent lookups instant.</p>`,
    relatedTools: ['age-calculator', 'percentage-calculator'],
  },
  // ─── Dev Tools (additional) ─────────────────────────────────────────────
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    shortDescription: 'Generate random UUIDs (v4 and v7). Bulk generate up to 100 at once.',
    category: 'dev',
    route: '/dev/uuid',
    acceptedFormats: [],
    icon: 'Fingerprint',
    metaTitle: 'UUID Generator — Free Online UUID / GUID Tool | clevr.tools',
    metaDescription: 'Free UUID generator. Create UUID v4 (random) or UUID v7 (timestamp-based) identifiers. Generate up to 100 UUIDs at once. Supports uppercase, lowercase, and no-hyphens formats.',
    seoContent: `<h2>Free UUID Generator</h2><p>Universally Unique Identifiers (UUIDs) are 128-bit identifiers used as primary keys in databases, request IDs in distributed systems, session tokens, file names, and anywhere you need a unique identifier that won't collide with others. UUID v4 is randomly generated and suitable for most use cases. UUID v7 is timestamp-based, which makes it sortable by creation time — useful for database primary keys where chronological ordering matters.</p><p>This generator uses <code>crypto.randomUUID()</code> for v4 when available, falling back to <code>crypto.getRandomValues()</code> with correctly set version (0100) and variant (10xx) bits. All generation happens in your browser — nothing is sent to any server.</p>`,
    relatedTools: ['password-generator', 'random-number'],
  },
  // ─── More Calculators ──────────────────────────────────────────────────
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    shortDescription: 'Calculate Body Mass Index with a visual scale, healthy weight range, and BMI categories.',
    category: 'calc',
    route: '/calc/bmi',
    acceptedFormats: [],
    icon: 'Scale',
    metaTitle: 'BMI Calculator — Body Mass Index Calculator Free | clevr.tools',
    metaDescription: 'Free BMI calculator. Calculate your Body Mass Index using height and weight in imperial or metric. See your BMI category (underweight to obese) and healthy weight range.',
    seoContent: `<h2>Free BMI Calculator</h2><p>Body Mass Index (BMI) is a screening measure calculated from height and weight. The formula is weight in kilograms divided by height in meters squared. The World Health Organization classifies BMI into ranges: underweight (below 18.5), normal weight (18.5–24.9), overweight (25–29.9), and obese (30 and above). This calculator supports both imperial (feet, inches, pounds) and metric (centimeters, kilograms) units.</p><p>BMI is a general population-level screening tool, not a diagnostic measure. It does not account for differences in muscle mass, bone density, age, sex, or ethnicity. Athletes and muscular individuals may have a high BMI despite being healthy. Consult a healthcare professional for personalized health assessment.</p>`,
    relatedTools: ['percentage-calculator', 'unit-converter'],
  },
  {
    slug: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    shortDescription: 'Calculate monthly mortgage payments with taxes, insurance, PMI, and amortization schedule.',
    category: 'calc',
    route: '/calc/mortgage',
    acceptedFormats: [],
    icon: 'Home',
    metaTitle: 'Mortgage Calculator — Monthly Payment Estimator Free | clevr.tools',
    metaDescription: 'Free mortgage calculator. Estimate monthly mortgage payments including principal, interest, property tax, insurance, and PMI. View full amortization schedule.',
    seoContent: `<h2>Free Mortgage Calculator</h2><p>Estimate your monthly mortgage payment by entering the home price, down payment amount, loan term, and interest rate. Include optional property tax and home insurance estimates for a complete monthly housing cost picture. If your down payment is less than 20%, PMI (Private Mortgage Insurance) typically applies until you reach 20% equity.</p><p>The monthly payment formula is M = P[r(1+r)^n] / [(1+r)^n - 1], where P is the loan principal, r is the monthly interest rate (annual rate divided by 12), and n is the total number of payments. This calculator provides estimates — actual payments vary based on lender terms, escrow arrangements, and other factors. Consult a licensed mortgage professional for personalized advice.</p>`,
    relatedTools: ['percentage-calculator', 'compound-interest', 'tip-calculator'],
  },
  {
    slug: 'tip-calculator',
    name: 'Tip Calculator',
    shortDescription: 'Calculate tips and split bills instantly. Quick presets for 15%, 18%, 20%, and more.',
    category: 'calc',
    route: '/calc/tip',
    acceptedFormats: [],
    icon: 'Receipt',
    metaTitle: 'Tip Calculator — Split Bill & Calculate Tip Free | clevr.tools',
    metaDescription: 'Free tip calculator. Enter your bill amount and tip percentage to instantly see the tip amount, total, and per-person cost for groups. Quick presets for common tip amounts.',
    seoContent: `<h2>Free Tip Calculator</h2><p>Calculate the tip amount for any bill and split the total evenly across any group size. Quick preset buttons for 10%, 15%, 18%, 20%, and 25% tip percentages cover most situations — or enter a custom percentage for anything else. The per-person breakdown updates in real time as you change any input.</p><p>Tipping norms vary by country and service type. In the US, 15–20% is standard for sit-down restaurant service, 10–15% for delivery (though apps often suggest more), and tips are generally not expected at fast food or counter service. Bartenders typically receive $1–2 per drink or 15–20% of the tab.</p>`,
    relatedTools: ['percentage-calculator', 'discount-calculator'],
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    shortDescription: 'Find the sale price after any discount. Supports stacked discounts and reverse calculation.',
    category: 'calc',
    route: '/calc/discount',
    acceptedFormats: [],
    icon: 'Tag',
    metaTitle: 'Discount Calculator — Percent Off Calculator Free | clevr.tools',
    metaDescription: 'Free discount calculator. Find the final sale price after any percentage discount. Supports stacked discounts (e.g., 20% off + extra 10% off) and reverse calculation from sale price.',
    seoContent: `<h2>Free Discount Calculator</h2><p>Quickly calculate the final price after a percentage discount while shopping. Enter the original price and discount percentage to instantly see how much you save and what the sale price is. Quick preset buttons for common discount levels — 10%, 20%, 25%, 50%, 75% — cover most retail scenarios.</p><p>The stacked discount feature handles promotions that apply multiple discounts sequentially, such as "30% off, then an extra 20% off the sale price." Note that stacked discounts are not additive — 20% + 20% is not 40% off. The actual combined discount is 36% in this case. Use the reverse calculator to find the original discount percentage when you know the original and sale prices.</p>`,
    relatedTools: ['percentage-calculator', 'tip-calculator'],
  },
  {
    slug: 'compound-interest',
    name: 'Compound Interest Calculator',
    shortDescription: 'See how investments grow over time. Visualize compound growth with a chart and yearly table.',
    category: 'calc',
    route: '/calc/compound-interest',
    acceptedFormats: [],
    icon: 'TrendingUp',
    metaTitle: 'Compound Interest Calculator — Investment Growth Tool Free | clevr.tools',
    metaDescription: 'Free compound interest calculator. Enter initial investment, monthly contributions, interest rate, and time to see your final balance and growth chart. Daily, monthly, quarterly, or annual compounding.',
    seoContent: `<h2>Free Compound Interest Calculator</h2><p>Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods — meaning your money earns returns on its returns. The formula for compound interest with regular contributions is: FV = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)], where P is initial investment, PMT is periodic contribution, r is annual interest rate, n is compounding frequency per year, and t is years.</p><p>The growth chart makes the power of compounding visual: the gap between your total contributions and your final balance widens dramatically over time. A modest monthly contribution invested consistently for 30 years typically produces far more in interest than in contributions — this is why starting early matters more than the amount you invest.</p>`,
    relatedTools: ['mortgage-calculator', 'percentage-calculator'],
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    shortDescription: 'Calculate semester and cumulative GPA. Add courses with credits and letter grades.',
    category: 'calc',
    route: '/calc/gpa',
    acceptedFormats: [],
    icon: 'GraduationCap',
    metaTitle: 'GPA Calculator — Semester & Cumulative GPA Calculator Free | clevr.tools',
    metaDescription: 'Free GPA calculator. Add courses with credit hours and letter grades to calculate your semester GPA. Includes cumulative GPA calculator and Dean\'s List color coding.',
    seoContent: `<h2>Free GPA Calculator</h2><p>Calculate your semester GPA by entering each course's credit hours and letter grade. The standard 4.0 GPA scale assigns points from 4.0 (A/A+) down to 0.0 (F). Your GPA is the weighted average of all grade points, weighted by credit hours: GPA = Sum(credit hours * grade points) / Sum(credit hours). A 3-credit A is worth more toward your GPA than a 1-credit A.</p><p>The cumulative GPA section lets you factor in your existing GPA and credit hours to calculate what your new overall GPA will be after adding this semester's results. Use this to plan which grades you need in order to reach academic honors thresholds (typically 3.5 for Dean's List, 3.9+ for summa cum laude).</p>`,
    relatedTools: ['percentage-calculator', 'age-calculator'],
  },
  // ─── Typing ────────────────────────────────────────────────────────────────
  {
    slug: 'typing-test',
    name: 'Typing Test',
    shortDescription: 'Test your typing speed and accuracy. See WPM, accuracy, consistency, and a live performance chart.',
    category: 'type',
    route: '/type/typing-test',
    acceptedFormats: [],
    icon: 'Keyboard',
    metaTitle: 'Free Typing Test — Check Your Typing Speed | clevr.tools',
    metaDescription: 'Test your typing speed and accuracy with our free online typing test. See your WPM, accuracy, and consistency with detailed stats and a live performance chart.',
    seoContent: `<h2>Free Online Typing Test</h2>
<p>A typing test measures two things: speed (words per minute) and accuracy (percentage of correct keystrokes). Speed without accuracy is meaningless — a professional typing test weights both. WPM is calculated using the standard 5-character word definition: your total correct characters (including spaces) divided by 5, divided by the time in minutes. This standardization lets you compare scores across different texts — a passage full of short words isn't "easier" than one with long words when measured this way.</p>
<p>Average typing speeds vary significantly by age, profession, and practice. Most adults type between 30–45 WPM with moderate accuracy. Office workers who type regularly often reach 60–75 WPM. Professional typists, transcriptionists, and programmers typically type at 80–100+ WPM. World record speeds exceed 200 WPM, though these are rare outliers requiring years of dedicated practice. Knowing your baseline speed is the first step to improving it.</p>
<p>Consistency is as important as peak speed. A typist who averages 70 WPM with high consistency (smooth, even rhythm) is more productive than one who bursts at 90 WPM and crashes. Our consistency score measures the coefficient of variation in your per-word speed — the closer to 100%, the more even your rhythm.</p>
<h2>How to Improve Your Typing Speed</h2>
<p>The single most important technique is proper finger placement. Keep your fingers on the home row (left: ASDF, right: JKL;) and let each finger be responsible for specific keys above and below. Hunt-and-peck typists plateau at 30–40 WPM because visual scanning limits speed. Touch typing removes this ceiling — once your fingers know where the keys are, your brain can process words faster than your eyes can find individual keys.</p>
<p>Focus on accuracy first, speed second. Many beginners try to type as fast as possible and develop sloppy habits that are hard to unlearn. Set a target accuracy of 95%+ before trying to increase speed. Your WPM will naturally increase as your muscle memory improves. Short daily practice sessions (15–20 minutes) are more effective than infrequent marathon sessions — consistency of practice beats intensity.</p>
<p>Use the results chart to identify patterns. If your WPM drops sharply at specific seconds, you're hitting unfamiliar letter combinations or losing concentration. If your accuracy is high but speed is low, you're being overly cautious — try to relax and trust your fingers. Take multiple tests in a session and watch your average improve as you warm up. Most typists are 10–15% faster at the end of a session than the beginning.</p>`,
    relatedTools: ['word-counter', 'character-counter', 'stopwatch'],
    badge: 'popular',
  },
  // ─── Files Tools ──────────────────────────────────────────────────────────
  {
    slug: 'image-cropper',
    name: 'Image Cropper',
    shortDescription: 'Crop images with precision. Freeform or aspect ratio presets including circle crop.',
    category: 'files',
    route: '/files/image-cropper',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    icon: 'Crop',
    metaTitle: 'Free Image Cropper — Crop Images Online | clevr.tools',
    metaDescription: 'Crop any image with precision. Choose from preset aspect ratios or freeform crop. Supports circle crop, 1:1, 16:9, and more. Free and private.',
    seoContent: `<h2>Free Online Image Cropper</h2>
<p>Cropping removes the outer parts of an image to focus on a subject, improve composition, or fit a specific display format. Unlike resizing — which changes an image's dimensions while keeping all its content — cropping changes what content is shown. A portrait photo might be cropped to remove distracting background elements; a landscape shot might be cropped to a square for Instagram. Cropping is one of the most fundamental image editing operations.</p>
<p>Aspect ratios constrain the crop selection to specific proportional shapes. The 1:1 ratio produces a perfect square — ideal for Instagram posts and profile pictures. The 16:9 ratio matches most screens and YouTube thumbnails. The 9:16 ratio is for vertical video and Instagram Stories. The 4:3 ratio is traditional photography. Locking to an aspect ratio ensures your crop will fit exactly into a target format without letterboxing or black bars.</p>
<h2>Circle Crop for Profile Pictures</h2>
<p>Many social platforms display profile pictures as circles — Facebook, LinkedIn, Twitter, Google. The circle crop option removes the corners of your image with a transparent mask, producing a PNG file where the corners are transparent rather than white or black. Upload the result directly as your profile picture without needing to rely on the platform's cropping tool, which often doesn't give you fine control over positioning.</p>`,
    relatedTools: ['image-compressor', 'resize-image', 'png-to-jpg'],
    badge: 'new',
  },
  {
    slug: 'invoice-generator',
    name: 'Invoice Generator',
    shortDescription: 'Create professional PDF invoices with line items, taxes, and your logo.',
    category: 'files',
    route: '/files/invoice-generator',
    acceptedFormats: [],
    icon: 'FileText',
    metaTitle: 'Free Invoice Generator — Create Professional Invoices | clevr.tools',
    metaDescription: 'Generate professional PDF invoices for free. Add line items, taxes, discounts, and your logo. Download instantly. No sign-up required.',
    seoContent: `<h2>Free Professional Invoice Generator</h2>
<p>An invoice is a legally recognized commercial document that records a transaction between a buyer and a seller. It lists the goods or services provided, quantities, unit prices, and the total amount owed. A professional invoice includes your business information, the client's details, a unique invoice number, the date of issue, payment due date, and clear payment terms. These elements are not just professional courtesies — many jurisdictions require specific information on invoices for them to be legally valid and tax-deductible.</p>
<p>Invoice numbering creates an auditable trail of all your transactions. A simple sequential system (INV-001, INV-002) works for most freelancers and small businesses. Some businesses use year-prefixed numbers (2026-001) to reset the sequence annually. Consistent numbering makes it easier to reconcile payments, follow up on outstanding invoices, and prepare for tax season. Your accounting software or the client's accounts payable department may also require a unique invoice number to process payment.</p>
<h2>Professional Invoicing Tips</h2>
<p>Specify payment terms clearly — "Net 30" means payment is due within 30 days of the invoice date. "Due on receipt" means immediate payment is expected. If you charge late fees, state them explicitly: "A 1.5% monthly fee applies to balances unpaid after 30 days." Including multiple payment methods (bank transfer, PayPal, credit card) reduces friction and helps you get paid faster. For larger projects, consider milestone-based invoicing rather than a single invoice at the end — it protects your cash flow and reduces the client's risk as well.</p>`,
    relatedTools: ['word-counter', 'pdf-compressor'],
    badge: 'new',
  },
  // ─── Financial Calculators ───────────────────────────────────────────────
  {
    slug: 'salary',
    name: 'Salary Calculator',
    shortDescription: 'Convert hourly pay to annual salary and see your earnings breakdown.',
    category: 'calc',
    route: '/calc/salary',
    acceptedFormats: [],
    icon: 'DollarSign',
    metaTitle: 'Salary Calculator — Hourly to Salary & Salary to Hourly | clevr.tools',
    metaDescription: 'Free salary calculator. Convert hourly wage to annual salary or annual salary to hourly rate. See daily, weekly, bi-weekly, semi-monthly, and monthly breakdowns instantly.',
    seoContent: `<h2>Free Salary Calculator</h2>
<p>Whether you're evaluating a job offer, negotiating a raise, or comparing hourly and salaried positions, understanding how your pay translates across different time periods is essential. This calculator instantly converts between hourly and annual pay, showing you the full breakdown: hourly, daily, weekly, bi-weekly, semi-monthly, monthly, and annual figures all at once.</p>
<p>The calculation accounts for your actual work schedule — adjust hours per week and weeks per year to reflect part-time schedules, unpaid time off, or non-standard work arrangements. The standard assumption is 40 hours per week for 52 weeks, but many workers take unpaid vacation or work non-standard hours.</p>
<h2>Hourly vs. Salary Comparison</h2>
<p>Hourly workers are paid for each hour worked and typically receive overtime pay (1.5x) for hours exceeding 40 per week. Salaried employees receive a fixed annual amount regardless of hours worked. When comparing offers, consider the total compensation package including benefits, retirement contributions, health insurance, and paid time off — not just the base pay number.</p>`,
    relatedTools: ['take-home-pay', 'paycheck', 'tip-calculator'],
    badge: 'new',
  },
  {
    slug: 'take-home-pay',
    name: 'Take-Home Pay Calculator',
    shortDescription: 'Estimate your paycheck after federal, state, and FICA taxes.',
    category: 'calc',
    route: '/calc/take-home-pay',
    acceptedFormats: [],
    icon: 'Wallet',
    metaTitle: 'Take-Home Pay Calculator — After-Tax Income Estimator | clevr.tools',
    metaDescription: 'Free take-home pay calculator. Estimate your paycheck after federal income tax, state tax, Social Security, and Medicare deductions. All 50 states supported.',
    seoContent: `<h2>Free Take-Home Pay Calculator</h2>
<p>Your gross salary and your take-home pay are very different numbers. Federal income tax, state income tax, Social Security (6.2%), and Medicare (1.45%) all reduce your paycheck before it hits your bank account. This calculator estimates your net pay after all major deductions, giving you a realistic picture of what you'll actually earn per paycheck.</p>
<p>Enter your gross annual salary, select your pay frequency, filing status, and state to see a detailed breakdown of each deduction. Pre-tax deductions like 401(k) contributions reduce your taxable income, potentially lowering your tax bill while building retirement savings.</p>
<h2>Understanding Your Tax Withholding</h2>
<p>Federal income tax uses a progressive bracket system — you don't pay your top marginal rate on all income, only on the portion that falls within each bracket. FICA taxes (Social Security and Medicare) are flat rates applied to your gross pay, with Social Security capped at $176,100 for 2025. State taxes vary dramatically — nine states have no income tax at all, while others like California can add over 10% on high earners.</p>`,
    relatedTools: ['salary', 'paycheck', 'mortgage-calculator'],
    badge: 'new',
  },
  {
    slug: 'loan',
    name: 'Loan Calculator',
    shortDescription: 'Calculate monthly loan payments with a full amortization schedule.',
    category: 'calc',
    route: '/calc/loan',
    acceptedFormats: [],
    icon: 'Landmark',
    metaTitle: 'Loan Calculator — Monthly Payment & Amortization Schedule | clevr.tools',
    metaDescription: 'Free loan calculator. Calculate monthly payments for any loan amount, interest rate, and term. View a full amortization schedule showing principal and interest breakdown.',
    seoContent: `<h2>Free Loan Calculator</h2>
<p>Calculate the monthly payment for any fixed-rate loan using the standard amortization formula: M = P[r(1+r)^n] / [(1+r)^n - 1], where P is the principal, r is the monthly interest rate, and n is the total number of payments. This formula ensures each payment covers the interest due plus a portion of principal, fully paying off the loan by the end of the term.</p>
<p>The amortization schedule shows exactly how each payment is split between principal and interest over the life of the loan. Early payments are mostly interest; later payments are mostly principal. Understanding this pattern helps you see how extra payments can dramatically reduce total interest paid.</p>
<h2>Loan Comparison Tips</h2>
<p>When comparing loan offers, look beyond the monthly payment. A longer term reduces monthly payments but increases total interest paid — sometimes by tens of thousands of dollars. The total cost of the loan (principal + total interest) is the true measure of what you're paying. Even a 0.5% difference in interest rate can add up to thousands over a 15- or 30-year term.</p>`,
    relatedTools: ['auto-loan', 'mortgage-calculator', 'amortization'],
    badge: 'new',
  },
  {
    slug: 'auto-loan',
    name: 'Auto Loan Calculator',
    shortDescription: 'Calculate car loan payments with trade-in and term comparison.',
    category: 'calc',
    route: '/calc/auto-loan',
    acceptedFormats: [],
    icon: 'Car',
    metaTitle: 'Auto Loan Calculator — Car Payment Estimator Free | clevr.tools',
    metaDescription: 'Free auto loan calculator. Enter vehicle price, down payment, trade-in value, interest rate, and loan term. Compare monthly payments across different term lengths.',
    seoContent: `<h2>Free Auto Loan Calculator</h2>
<p>Estimate your monthly car payment before visiting the dealership. Enter the vehicle price, your down payment, any trade-in value, the interest rate, and choose a loan term to see your monthly payment, total interest, and total cost. The term comparison table shows how different loan lengths affect both your monthly payment and total cost.</p>
<p>A larger down payment reduces your loan amount and monthly payment, and may qualify you for a better interest rate. Trade-in value is subtracted from the vehicle price before calculating the loan. If you owe more on your current car than its trade-in value (negative equity), that difference gets added to your new loan.</p>
<h2>Choosing the Right Loan Term</h2>
<p>Shorter loan terms (24–36 months) mean higher monthly payments but significantly less total interest. Longer terms (60–84 months) lower your monthly payment but cost more overall and increase the risk of being "underwater" — owing more than the car is worth. Financial experts generally recommend keeping auto loans to 48–60 months maximum.</p>`,
    relatedTools: ['car-payment', 'loan', 'down-payment'],
    badge: 'new',
  },
  {
    slug: 'credit-card-payoff',
    name: 'Credit Card Payoff Calculator',
    shortDescription: 'See how long it takes to pay off credit card debt and the total interest cost.',
    category: 'calc',
    route: '/calc/credit-card-payoff',
    acceptedFormats: [],
    icon: 'CreditCard',
    metaTitle: 'Credit Card Payoff Calculator — Debt-Free Date Estimator | clevr.tools',
    metaDescription: 'Free credit card payoff calculator. Enter your balance, APR, and monthly payment to see months to payoff, total interest, and how paying more saves money.',
    seoContent: `<h2>Free Credit Card Payoff Calculator</h2>
<p>Credit card debt compounds monthly, meaning you pay interest on interest. Enter your current balance, APR (Annual Percentage Rate), and monthly payment to see exactly how long it will take to pay off your debt and how much total interest you'll pay. The "what if" comparison table shows how increasing your monthly payment by $25, $50, or $100 dramatically reduces both the payoff time and total interest.</p>
<p>If your monthly payment barely covers the interest charges, payoff could take decades. Credit card APRs typically range from 15% to 25%, making them one of the most expensive forms of debt. Prioritizing credit card payoff over other financial goals often makes mathematical sense.</p>
<h2>Strategies to Pay Off Credit Cards Faster</h2>
<p>The avalanche method targets the highest-APR card first, minimizing total interest paid. The snowball method targets the smallest balance first, providing psychological wins. Both are effective — the best strategy is the one you'll stick with. Even small extra payments make a meaningful difference when interest rates are high.</p>`,
    relatedTools: ['debt-to-income', 'loan', 'savings-goal'],
    badge: 'new',
  },
  {
    slug: 'savings-goal',
    name: 'Savings Goal Calculator',
    shortDescription: 'Find out how much to save monthly to reach your financial goal.',
    category: 'calc',
    route: '/calc/savings-goal',
    acceptedFormats: [],
    icon: 'PiggyBank',
    metaTitle: 'Savings Goal Calculator — Monthly Savings Planner Free | clevr.tools',
    metaDescription: 'Free savings goal calculator. Enter your savings target, timeline, and current savings to find the monthly contribution needed. Accounts for interest earnings.',
    seoContent: `<h2>Free Savings Goal Calculator</h2>
<p>Whether you're saving for a vacation, emergency fund, down payment, or any other financial goal, this calculator tells you exactly how much to set aside each month. Enter your target amount, current savings, expected interest rate, and timeline to get your required monthly contribution. The calculation accounts for compound interest on your savings, so money in a high-yield savings account works harder than cash under a mattress.</p>
<p>The formula solves for PMT (monthly payment) given a future value target: PMT = (FV - PV × (1+r)^n) × r / [(1+r)^n - 1], where FV is your goal, PV is current savings, r is the monthly interest rate, and n is the number of months.</p>
<h2>Setting Realistic Savings Goals</h2>
<p>Financial experts recommend saving 3–6 months of expenses as an emergency fund before targeting other goals. High-yield savings accounts currently offer 4–5% APY, meaningfully reducing the monthly contribution needed for longer-term goals. Break large goals into smaller milestones to stay motivated — saving $100,000 feels overwhelming, but $500/month for 15 years with 5% interest gets you there.</p>`,
    relatedTools: ['compound-interest', 'retirement', 'down-payment'],
    badge: 'new',
  },
  {
    slug: 'retirement',
    name: 'Retirement Calculator',
    shortDescription: 'Project your retirement savings and estimated monthly retirement income.',
    category: 'calc',
    route: '/calc/retirement',
    acceptedFormats: [],
    icon: 'TrendingUp',
    metaTitle: 'Retirement Calculator — Savings Projection Tool Free | clevr.tools',
    metaDescription: 'Free retirement calculator. Project your retirement savings based on current savings, monthly contributions, and expected returns. See inflation-adjusted values and estimated monthly income.',
    seoContent: `<h2>Free Retirement Calculator</h2>
<p>Planning for retirement requires understanding how your savings will grow over decades and what that money will actually be worth when you need it. This calculator projects your retirement savings using compound growth with monthly contributions, then adjusts for inflation to show your purchasing power in today's dollars. The 4% rule estimate shows how much monthly income your savings could sustainably provide.</p>
<p>The projection uses: FV = PV × (1 + r/12)^n + PMT × [(1 + r/12)^n - 1] / (r/12), where n is months until retirement. The inflation-adjusted value divides by (1 + inflation)^years to show real purchasing power.</p>
<h2>The 4% Rule</h2>
<p>The 4% rule suggests you can withdraw 4% of your retirement savings annually (adjusted for inflation each year) with a high probability of your money lasting 30+ years. This translates to dividing your target retirement income by 0.04 to find your savings goal — for example, $60,000/year requires approximately $1.5 million saved. The rule is a starting point, not a guarantee — actual safe withdrawal rates depend on market conditions, asset allocation, and retirement length.</p>`,
    relatedTools: ['compound-interest', 'investment-return', 'savings-goal'],
    badge: 'new',
  },
  {
    slug: 'investment-return',
    name: 'Investment Return Calculator',
    shortDescription: 'Calculate future investment value with monthly contributions and compound growth.',
    category: 'calc',
    route: '/calc/investment-return',
    acceptedFormats: [],
    icon: 'BarChart3',
    metaTitle: 'Investment Return Calculator — Growth Projection Tool Free | clevr.tools',
    metaDescription: 'Free investment return calculator. Project future value of investments with initial amount, monthly contributions, and compound growth. Year-by-year breakdown included.',
    seoContent: `<h2>Free Investment Return Calculator</h2>
<p>See how your investments could grow over time with compound returns and regular contributions. Enter your initial investment, monthly contribution, expected annual return, and investment period to get a year-by-year projection of your portfolio's growth. The calculation compounds monthly: FV = P × (1 + r/12)^(y×12) + PMT × [(1 + r/12)^(y×12) - 1] / (r/12).</p>
<p>The year-by-year table breaks down starting balance, contributions, earnings, and ending balance for each year, making it easy to see how compound growth accelerates over time. The gap between your total contributions and final balance represents your investment earnings — this gap widens dramatically in later years.</p>
<h2>Historical Market Returns</h2>
<p>The S&P 500 has returned approximately 10% annually (about 7% after inflation) over the past century. However, returns vary significantly year to year — individual years range from -40% to +50%. Using a conservative estimate (6–8%) for projections is prudent. Past performance does not guarantee future results, and actual returns depend on your specific investment allocation and timing.</p>`,
    relatedTools: ['compound-interest', 'retirement', 'savings-goal'],
    badge: 'new',
  },
  {
    slug: 'debt-to-income',
    name: 'Debt-to-Income Calculator',
    shortDescription: 'Calculate your DTI ratio and see how lenders view your debt level.',
    category: 'calc',
    route: '/calc/debt-to-income',
    acceptedFormats: [],
    icon: 'Scale',
    metaTitle: 'Debt-to-Income (DTI) Calculator — Free Ratio Tool | clevr.tools',
    metaDescription: 'Free debt-to-income ratio calculator. Add all your monthly debts and income to calculate your DTI percentage. See how lenders evaluate your ratio for mortgage and loan approval.',
    seoContent: `<h2>Free Debt-to-Income Calculator</h2>
<p>Your debt-to-income (DTI) ratio is one of the most important numbers lenders use to evaluate your ability to repay a loan. It's calculated simply: DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100. A lower DTI means more of your income is available for new loan payments, making you a lower-risk borrower.</p>
<p>Add all your monthly debt obligations — mortgage/rent, car payments, student loans, credit card minimums, personal loans, and any other recurring debt payments. Divide by your gross (pre-tax) monthly income to get your DTI percentage.</p>
<h2>What Lenders Look For</h2>
<p>Most mortgage lenders prefer a DTI below 36%, with no more than 28% going to housing costs (the "front-end" ratio). FHA loans may accept DTI up to 43–50% with compensating factors. For other loans, under 36% is generally considered good, 37–43% is acceptable, and above 43% may make qualification difficult. Reducing your DTI before applying for a major loan can improve your chances and potentially qualify you for better interest rates.</p>`,
    relatedTools: ['mortgage-calculator', 'credit-card-payoff', 'loan'],
    badge: 'new',
  },
  {
    slug: 'net-worth',
    name: 'Net Worth Calculator',
    shortDescription: 'Calculate your net worth by listing all assets and liabilities.',
    category: 'calc',
    route: '/calc/net-worth',
    acceptedFormats: [],
    icon: 'Calculator',
    metaTitle: 'Net Worth Calculator — Track Your Financial Health Free | clevr.tools',
    metaDescription: 'Free net worth calculator. List your assets (savings, investments, property) and liabilities (loans, credit cards, mortgage) to calculate your total net worth.',
    seoContent: `<h2>Free Net Worth Calculator</h2>
<p>Your net worth is the single most comprehensive measure of your financial health: Net Worth = Total Assets - Total Liabilities. Assets include everything you own that has monetary value — bank accounts, investments, retirement accounts, real estate, vehicles, and valuables. Liabilities include everything you owe — mortgages, car loans, student loans, credit card balances, and personal debts.</p>
<p>Tracking net worth over time is more meaningful than looking at income or savings alone. A high income with high debt can produce a lower net worth than a moderate income with disciplined saving. Calculating your net worth quarterly or annually reveals whether you're building wealth or treading water.</p>
<h2>Net Worth by Age</h2>
<p>Average net worth varies dramatically by age due to the compounding effects of time on both savings and debt repayment. It's common to have a negative net worth in your 20s (student loans exceed assets). By your 30s-40s, net worth typically turns positive as retirement accounts grow and debt is paid down. The key metric isn't comparison to others — it's whether your net worth is trending upward over time.</p>`,
    relatedTools: ['debt-to-income', 'retirement', 'savings-goal'],
    badge: 'new',
  },
  {
    slug: 'sales-tax',
    name: 'Sales Tax Calculator',
    shortDescription: 'Calculate sales tax and total price, or reverse-calculate pre-tax price.',
    category: 'calc',
    route: '/calc/sales-tax',
    acceptedFormats: [],
    icon: 'Receipt',
    metaTitle: 'Sales Tax Calculator — Tax Amount & Total Price Free | clevr.tools',
    metaDescription: 'Free sales tax calculator. Calculate sales tax on any purchase or reverse-calculate the pre-tax price from a total. Includes state tax rate presets for all US states.',
    seoContent: `<h2>Free Sales Tax Calculator</h2>
<p>Calculate the sales tax on any purchase by entering the price and tax rate, or work backwards from a receipt total to find the pre-tax amount. The forward calculation is: Tax = Price × Rate / 100, Total = Price + Tax. The reverse calculation is: Pre-Tax Price = Total / (1 + Rate / 100). State tax rate presets let you quickly select the correct rate for your location.</p>
<p>Sales tax rates in the US vary by state, county, and city. Some states (Oregon, Montana, Delaware, New Hampshire) have no state sales tax. Others, like Tennessee, Louisiana, and Arkansas, have combined state and local rates exceeding 9%. Certain items like groceries or clothing may be exempt or taxed at reduced rates depending on your state.</p>
<h2>Why Sales Tax Matters</h2>
<p>Sales tax adds a meaningful percentage to every purchase. On a $30,000 car in a state with 8% sales tax, you're paying $2,400 in tax alone. Understanding your local rate helps with budgeting, comparing prices across state lines, and making informed purchasing decisions — especially for large purchases where even 1–2% difference represents significant money.</p>`,
    relatedTools: ['tip-calculator', 'discount-calculator', 'percentage-calculator'],
    badge: 'new',
  },
  {
    slug: 'amortization',
    name: 'Amortization Calculator',
    shortDescription: 'View a full loan amortization schedule with optional extra payments.',
    category: 'calc',
    route: '/calc/amortization',
    acceptedFormats: [],
    icon: 'CalendarCheck',
    metaTitle: 'Amortization Calculator — Loan Schedule with Extra Payments | clevr.tools',
    metaDescription: 'Free amortization calculator. Generate a full loan amortization schedule. See how extra monthly payments reduce total interest and shorten your loan term.',
    seoContent: `<h2>Free Amortization Calculator</h2>
<p>An amortization schedule shows exactly how each loan payment is divided between principal and interest over the entire life of the loan. This calculator generates the complete month-by-month schedule for any fixed-rate loan, plus shows the impact of optional extra monthly payments. Extra payments go directly toward principal, reducing both the loan term and total interest paid.</p>
<p>The standard loan payment formula is: M = P[r(1+r)^n] / [(1+r)^n - 1]. Each month, interest is calculated on the remaining balance (Interest = Balance × Monthly Rate), and the rest of the payment goes to principal (Principal = Payment - Interest). As the balance decreases, less goes to interest and more to principal.</p>
<h2>The Power of Extra Payments</h2>
<p>Even modest extra payments can save thousands in interest. Adding just $100/month to a $300,000, 30-year mortgage at 6.5% saves over $50,000 in interest and pays off the loan nearly 5 years early. This calculator shows the exact savings so you can decide whether extra payments are the best use of your money compared to investing the difference.</p>`,
    relatedTools: ['loan', 'mortgage-calculator', 'auto-loan'],
    badge: 'new',
  },
  {
    slug: 'car-payment',
    name: 'Car Payment Calculator',
    shortDescription: 'Estimate monthly car payments with price, down payment, and loan details.',
    category: 'calc',
    route: '/calc/car-payment',
    acceptedFormats: [],
    icon: 'Car',
    metaTitle: 'Car Payment Calculator — Monthly Auto Payment Estimator | clevr.tools',
    metaDescription: 'Free car payment calculator. Enter car price, down payment, interest rate, and loan term to estimate your monthly payment, total interest, and total cost of the vehicle.',
    seoContent: `<h2>Free Car Payment Calculator</h2>
<p>Know your monthly car payment before you start shopping. Enter the vehicle price, your down payment, interest rate, and loan term to instantly see your estimated monthly payment, total interest charges, and the total cost of the vehicle over the life of the loan. This helps you set a realistic budget and avoid overextending at the dealership.</p>
<p>The monthly payment is calculated using the standard amortization formula. A larger down payment directly reduces both your monthly payment and total interest paid. Most financial advisors recommend putting at least 20% down on a car to avoid negative equity.</p>
<h2>Car Buying Tips</h2>
<p>Get pre-approved for financing before visiting dealerships — it gives you negotiating leverage and a baseline rate to compare against dealer financing. Focus on the total cost of the vehicle (purchase price + total interest) rather than just the monthly payment. Dealers can make any monthly payment look affordable by extending the loan term, but you'll pay far more in total interest.</p>`,
    relatedTools: ['auto-loan', 'loan', 'down-payment'],
    badge: 'new',
  },
  {
    slug: 'paycheck',
    name: 'Paycheck Calculator',
    shortDescription: 'Estimate your net paycheck after taxes and deductions per pay period.',
    category: 'calc',
    route: '/calc/paycheck',
    acceptedFormats: [],
    icon: 'Wallet',
    metaTitle: 'Paycheck Calculator — Net Pay Per Period Estimator | clevr.tools',
    metaDescription: 'Free paycheck calculator. Enter your gross pay per period to see estimated deductions for federal tax, state tax, Social Security, and Medicare. All 50 states supported.',
    seoContent: `<h2>Free Paycheck Calculator</h2>
<p>See exactly what your paycheck will look like after deductions. Enter your gross pay per pay period, filing status, and state to get an itemized breakdown of federal income tax, state income tax, Social Security, and Medicare withholding. The result shows your estimated net (take-home) pay for each paycheck.</p>
<p>This calculator uses 2025 federal tax brackets and state tax rates to estimate withholding. Pre-tax deductions like 401(k) contributions and health insurance premiums are subtracted before calculating federal and state income tax, reducing your taxable income.</p>
<h2>Understanding Your Pay Stub</h2>
<p>Your gross pay is the total amount earned before any deductions. From that, your employer withholds federal income tax (based on your W-4 filing status and the progressive bracket system), Social Security tax (6.2% up to $176,100), Medicare tax (1.45%), and state income tax (varies by state). The remainder is your net pay — what gets deposited into your bank account. Understanding these deductions helps you verify your pay stub accuracy and plan your budget around actual take-home pay.</p>`,
    relatedTools: ['salary', 'take-home-pay', 'tip-calculator'],
    badge: 'new',
  },
  {
    slug: 'down-payment',
    name: 'Down Payment Calculator',
    shortDescription: 'Calculate how much to save for a down payment and compare percentages.',
    category: 'calc',
    route: '/calc/down-payment',
    acceptedFormats: [],
    icon: 'Home',
    metaTitle: 'Down Payment Calculator — Home Savings Planner Free | clevr.tools',
    metaDescription: 'Free down payment calculator. Enter home price and down payment percentage to see your savings goal. Compare 5%, 10%, 15%, 20%, and 25% down payment amounts and monthly savings needed.',
    seoContent: `<h2>Free Down Payment Calculator</h2>
<p>A down payment is the upfront cash portion of a home purchase. The standard recommendation is 20% to avoid Private Mortgage Insurance (PMI), but many buyers put down 5–15%. This calculator shows the exact dollar amount needed at different percentages, how long it will take to save based on your current savings and monthly savings rate, and a comparison table across common down payment levels.</p>
<p>The savings timeline is calculated as: Months = (Goal - Current Savings) / Monthly Savings. For a more accurate projection, the calculator can factor in interest earned on savings if you specify an expected rate.</p>
<h2>Down Payment Trade-Offs</h2>
<p>A larger down payment means a smaller loan, lower monthly payments, no PMI (at 20%+), and typically a better interest rate. But it also means more cash tied up in your home and less available for other investments, emergency funds, or home improvements. There's no universally "right" amount — it depends on your financial situation, local market conditions, and how quickly you want to buy. First-time buyer programs, FHA loans (3.5% minimum), and VA loans (0% for veterans) offer lower down payment options.</p>`,
    relatedTools: ['mortgage-calculator', 'savings-goal', 'auto-loan'],
    badge: 'new',
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
  { id: 'type' as const, label: 'Type', icon: 'Keyboard' },
  { id: 'time' as const, label: 'Time & Timers', icon: 'Timer' },
  { id: 'text' as const, label: 'Text Tools', icon: 'Type' },
  { id: 'dev' as const, label: 'Dev Tools', icon: 'Code' },
  { id: 'calc' as const, label: 'Calculators', icon: 'Calculator' },
  { id: 'ai' as const, label: 'AI Tools', icon: 'Bot' },
];
