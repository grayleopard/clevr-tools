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
      'Compress JPG, PNG, and WebP images online free. Reduce file size up to 90% while keeping quality. No upload to servers — 100% browser-based, instant results.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're about to upload a hero image to your site and it's 4.7 MB straight from the camera. Your email newsletter platform caps images at 1 MB. Shopify is warning you that your product photos are slowing down your store. These are compression moments — you need the same image, just smaller.</p>
      <p>The other common trigger is platform-specific size limits. WordPress media uploads, Squarespace backgrounds, Etsy listings, LinkedIn posts — they all have ceilings. Rather than guessing, compress to 200–500 KB and you'll clear virtually every platform's requirements without visible quality loss.</p>
      <p>One important rule: always resize first, compress second. Compressing a 4000×3000 photo and then displaying it at 800×600 wastes most of the work. Resize to the display dimensions, then compress. You'll get dramatically smaller files with better visual results.</p>

      <h2>Good to know</h2>
      <p><strong>85% quality is the sweet spot.</strong> Below 85%, you start seeing artifacts — banding in gradients, fuzz around text. Above 90%, files barely shrink but you're burning bytes on imperceptible detail. For most web images, 80–85% is where quality and size meet.</p>
      <p><strong>Diminishing returns above 90%.</strong> Going from 90% to 100% quality roughly doubles file size while producing differences only a pixel-peeping comparison tool would catch. Save the 95–100% range for print-quality originals you'll never serve on the web.</p>
      <p><strong>WebP output beats JPG.</strong> If your platform supports it (and in 2026, nearly all do), choose WebP output. It produces files 25–35% smaller than JPEG at the same perceived quality. It's the single biggest free win in image optimization.</p>
      <p><strong>Compression is lossy and one-way.</strong> Once you compress, the discarded data is gone. Always keep your original files. Compress copies, not sources.</p>
      <p><strong>Everything stays on your device.</strong> No server upload, no account, no tracking. Your images never leave your browser tab.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Platform</th><th>Recommended Max Size</th><th>Suggested Quality</th></tr></thead>
        <tbody>
          <tr><td>WordPress (media library)</td><td>500 KB</td><td>80–85%</td></tr>
          <tr><td>Shopify (product images)</td><td>500 KB</td><td>80–85%</td></tr>
          <tr><td>Email newsletters</td><td>200 KB per image</td><td>75–80%</td></tr>
          <tr><td>Social media posts</td><td>1 MB</td><td>85%</td></tr>
          <tr><td>Google Ads display</td><td>150 KB</td><td>70–75%</td></tr>
          <tr><td>Web hero images</td><td>300–500 KB</td><td>80–85%</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You have a PNG screenshot or graphic and you need it smaller — fast. A 2 MB PNG photograph compresses to 200–400 KB as a JPG at 85% quality with no visible difference. If the image doesn't need transparency, this conversion is almost always worth it.</p>
      <p>Common triggers: email attachment limits, CMS upload caps, social media platforms that re-compress PNGs badly (looking at you, Twitter/X), or you're batch-processing hundreds of product photos and every kilobyte matters at scale.</p>
      <p>When it doesn't make sense: logos with sharp edges and flat colors, pixel art, screenshots of text, or anything where you need the transparent background. For those, keep the PNG or convert to WebP instead.</p>

      <h2>Good to know</h2>
      <p><strong>Transparency becomes white.</strong> JPG has no alpha channel. Every transparent pixel gets filled with a solid white background. If your PNG has transparency and you need to keep it, use WebP instead — it supports alpha and still beats PNG on file size.</p>
      <p><strong>The size drop is dramatic.</strong> A typical 3 MB PNG photo becomes 300–500 KB as a JPG. That's a 5–10x reduction. Screenshots with lots of solid color see smaller but still meaningful savings, usually 2–4x.</p>
      <p><strong>Quality below 80% gets noticeable.</strong> JPG compression creates blocky artifacts around sharp edges and in areas of solid color. For photos, 85% is the sweet spot. For graphics with text or UI elements, stay at 90%+ or the edges get muddy.</p>
      <p><strong>JPG degrades on re-save.</strong> Every time you open a JPG and save it again, it re-compresses and loses more data. If you plan to edit the output, do your editing first and export to JPG as the final step.</p>
      <p><strong>No server, no upload.</strong> Conversion happens in your browser via the Canvas API. Your files never leave your device.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Feature</th><th>PNG</th><th>JPG</th></tr></thead>
        <tbody>
          <tr><td>Compression</td><td>Lossless</td><td>Lossy</td></tr>
          <tr><td>Transparency</td><td>Yes (alpha channel)</td><td>No</td></tr>
          <tr><td>Typical photo size</td><td>2–5 MB</td><td>200–500 KB</td></tr>
          <tr><td>Best for</td><td>Graphics, logos, screenshots</td><td>Photos, web images</td></tr>
          <tr><td>Browser support</td><td>Universal</td><td>Universal</td></tr>
          <tr><td>Re-save quality loss</td><td>None</td><td>Yes, cumulative</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You're printing business cards and need a QR code that links to your portfolio. You're setting up a conference booth and want attendees to scan for your WiFi credentials. You're creating restaurant table tents with a link to the digital menu. QR codes are the bridge between physical materials and digital content — and they've become expected rather than novel.</p>
      <p>The pandemic permanently changed QR code adoption. What used to feel gimmicky is now the default for menus, event check-ins, payment links, and contact sharing. If you're producing any physical material that should connect to a URL, a QR code is the fastest path from "holding paper" to "viewing a webpage."</p>
      <p>They're also useful in purely digital contexts: embedding a scannable code in a presentation, adding one to a PDF document, or generating codes for app deep links and two-factor authentication setup.</p>

      <h2>Good to know</h2>
      <p><strong>Error correction is why QR codes survive abuse.</strong> QR codes embed redundant data so they can be scanned even when partially damaged, dirty, or obscured. Level H (30% correction) lets you place a logo over the center of the code and it'll still scan — that's how branded QR codes work.</p>
      <p><strong>More data = denser code = harder to scan.</strong> A QR code encoding a 20-character URL is simple and scans instantly from across a room. A QR code encoding 500 characters of text is dense, requires close-up scanning, and may fail on older cameras. Keep the encoded data as short as possible — use URL shorteners for long links.</p>
      <p><strong>SVG for print, PNG for screens.</strong> SVG is a vector format that scales to any size without pixelation — billboard or business card, it's always sharp. PNG is rasterized (fixed pixels), so choose at least 512px for anything that will be printed. For web use, PNG is fine at 256-512px.</p>
      <p><strong>Dark modules on light background scans best.</strong> QR scanners expect dark-on-light contrast. You can customize colors, but keep the contrast ratio high. Light modules on dark background works if the scanner supports inverted codes, but not all do.</p>
      <p><strong>Test before you print.</strong> Always scan your generated QR code with at least two different phones before sending anything to print. A typo in the URL means reprinting everything.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Error Correction</th><th>Recovery</th><th>Code Density</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>Level L</td><td>~7%</td><td>Smallest</td><td>Clean digital displays, screens</td></tr>
          <tr><td>Level M</td><td>~15%</td><td>Moderate</td><td>General purpose, most use cases</td></tr>
          <tr><td>Level Q</td><td>~25%</td><td>Larger</td><td>Printed materials, moderate wear</td></tr>
          <tr><td>Level H</td><td>~30%</td><td>Largest</td><td>Logo overlay, merchandise, packaging</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You AirDropped photos to your Windows laptop and nothing can open them. Or you're trying to upload iPhone photos to a web form and it only accepts JPG. Or your printing service rejected HEIC files. Apple made HEIC the default camera format in 2017 (iOS 11), and the rest of the world still hasn't fully caught up.</p>
      <p>The compatibility gap is the whole reason this tool exists. HEIC uses the HEVC codec and produces files 40–50% smaller than JPG at the same quality — technically superior. But JPG has 30 years of universal support baked into every operating system, browser, and application on earth. When you need something that just works everywhere, you convert to JPG.</p>
      <p>You can change your iPhone to shoot JPG natively (Settings → Camera → Formats → Most Compatible), but that doubles your storage usage per photo. Most people prefer to shoot in HEIC and convert only when they need to share outside the Apple ecosystem.</p>

      <h2>Good to know</h2>
      <p><strong>HEIC is actually better than JPG.</strong> It's not a "bad" format — Apple chose it because it genuinely produces smaller, higher-quality files. You're converting for compatibility, not quality. The JPG output will be larger than the HEIC input, typically 1.5–2x the file size.</p>
      <p><strong>Live Photos only export the still frame.</strong> HEIC files from Live Photos contain both a still image and a short video clip. This converter extracts the still image. The video component doesn't carry over to JPG.</p>
      <p><strong>EXIF data transfers.</strong> Camera metadata — date, location, exposure settings — carries over from HEIC to JPG. If you're sharing photos and want to strip location data for privacy, that's a separate step.</p>
      <p><strong>Batch is the way.</strong> You probably aren't converting one photo. Drop your entire folder of HEIC files and grab the ZIP. All processing happens in your browser — your photos never touch a server.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Feature</th><th>HEIC</th><th>JPG</th></tr></thead>
        <tbody>
          <tr><td>Compression</td><td>Lossy (HEVC codec)</td><td>Lossy (DCT-based)</td></tr>
          <tr><td>Transparency</td><td>Yes (alpha)</td><td>No</td></tr>
          <tr><td>Typical photo size (12 MP)</td><td>1.5–2.5 MB</td><td>3–5 MB</td></tr>
          <tr><td>Browser support</td><td>Safari only</td><td>Universal</td></tr>
          <tr><td>Windows support</td><td>Requires HEVC extension</td><td>Native</td></tr>
          <tr><td>Best for</td><td>iPhone storage efficiency</td><td>Sharing and compatibility</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You saved an image from a website and it's a WebP file. Now Photoshop won't open it, or Illustrator ignores it, or your company's ancient CMS rejects it outright. Design tools have been slow to adopt WebP — Figma handles it fine, but many desktop apps still choke. If you need to edit a web image in a traditional design tool, PNG is the safe bet.</p>
      <p>Archiving is the other big use case. WebP is relatively young. PNG has been around since 1996 and will open on literally anything with a screen. If you're building a long-term asset library, PNG is the format that won't surprise you in five years.</p>
      <p>Enterprise software is the third reason. Internal tools, medical imaging systems, government portals — many of these were built before WebP existed and won't be updated anytime soon. PNG gets through the door every time.</p>

      <h2>Good to know</h2>
      <p><strong>Zero quality loss.</strong> WebP to PNG conversion is lossless. The PNG output contains every pixel of data from the decoded WebP. Nothing is added, nothing is removed.</p>
      <p><strong>Files will get larger.</strong> That's the tradeoff. PNG uses lossless compression, which produces bigger files than WebP's more aggressive algorithms. Expect 30-50% larger files. You're trading size for universal compatibility.</p>
      <p><strong>Lossy artifacts carry over.</strong> If the original WebP used lossy compression, those artifacts are baked in to the pixel data. PNG preserves them faithfully — it doesn't add new ones, but it can't remove what's already there.</p>
      <p><strong>Batch mode is the fast path.</strong> Drop 10, 20, 50 files at once. Download them individually or grab the ZIP. All processing stays in your browser — nothing leaves your device.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Feature</th><th>WebP</th><th>PNG</th></tr></thead>
        <tbody>
          <tr><td>Compression</td><td>Lossy + lossless</td><td>Lossless only</td></tr>
          <tr><td>Transparency</td><td>Yes (alpha)</td><td>Yes (alpha)</td></tr>
          <tr><td>Browser support</td><td>All modern (post-2020)</td><td>Universal</td></tr>
          <tr><td>Design tool support</td><td>Limited</td><td>Universal</td></tr>
          <tr><td>Typical file size</td><td>Smaller (30-50%)</td><td>Larger</td></tr>
          <tr><td>Best for</td><td>Web delivery</td><td>Editing and archiving</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You're optimizing web assets and PNG files are eating your performance budget. A typical PNG hero image at 1200×800 runs 1–3 MB. The same image as WebP at 85% quality: 200–400 KB. That's the kind of reduction that moves your Lighthouse score from orange to green.</p>
      <p>WebP is the web performance format. Every major browser has supported it since 2020 (yes, including Safari). If you're building a website, blog, e-commerce store, or web app and still serving PNGs for photographs or complex graphics, you're leaving performance on the table.</p>
      <p>When to skip it: if you need lossless transparency for design assets that will be layered and re-exported (keep the PNG), or if you're targeting very old software that predates WebP support. For web delivery in 2026, though, WebP is the default right answer.</p>

      <h2>Good to know</h2>
      <p><strong>WebP keeps transparency.</strong> Unlike JPG, WebP supports alpha channels. Your transparent PNGs convert to transparent WebPs — no white background fill, no lost compositing. This is one of WebP's biggest advantages over JPG.</p>
      <p><strong>25–35% smaller than PNG, consistently.</strong> Across photographs, illustrations, and UI graphics, WebP reliably beats PNG on file size. For photographic content the savings are even larger — often 60–80% smaller.</p>
      <p><strong>Lossy is usually the right call.</strong> This converter uses lossy WebP compression. At 80–85% quality, the output is visually identical to the lossless PNG source. Only use 95%+ if you're working with pixel-precise graphics where every detail matters.</p>
      <p><strong>Next.js and most CDNs auto-convert.</strong> If you're using a modern framework or CDN (Vercel, Cloudflare, Cloudinary), they often serve WebP automatically. Check whether you actually need to convert manually before batch-processing your entire image directory.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Feature</th><th>PNG</th><th>WebP</th></tr></thead>
        <tbody>
          <tr><td>Compression</td><td>Lossless only</td><td>Lossy + lossless</td></tr>
          <tr><td>Transparency</td><td>Yes (alpha)</td><td>Yes (alpha)</td></tr>
          <tr><td>Typical photo size</td><td>1–3 MB</td><td>200–400 KB</td></tr>
          <tr><td>Browser support</td><td>Universal</td><td>All modern (post-2020)</td></tr>
          <tr><td>Design tool support</td><td>Universal</td><td>Growing (Figma, Sketch yes)</td></tr>
          <tr><td>Best for</td><td>Editing, archiving</td><td>Web delivery</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You have a JPG and you need to add it to a design comp in Figma, layer it over other elements in Photoshop, or use it as a texture with transparency. PNG is the starting point for that workflow — it gives you a lossless container and alpha channel support that JPG simply can't provide.</p>
      <p>The other common scenario: you're editing and re-saving an image multiple times. Every JPG save recompresses and degrades the image further (generation loss). Converting to PNG first freezes the quality at its current level. Edit the PNG as many times as you want — it won't degrade on save. Export to JPG as the final step only.</p>
      <p>Be realistic about what this conversion does and doesn't do. It locks in current quality and prevents further loss. It does not magically restore detail that JPG compression already removed. If your JPG has visible artifacts, they'll be faithfully preserved in the PNG output.</p>

      <h2>Good to know</h2>
      <p><strong>Files will get larger.</strong> This is the expected tradeoff. A 400 KB JPG photo typically becomes 2–4 MB as a PNG. You're trading file size for lossless editing capability and transparency support. If you just need a smaller file, this is the wrong direction — look at image compression instead.</p>
      <p><strong>JPG artifacts carry over.</strong> PNG preserves every pixel exactly as decoded from the JPG — including any compression artifacts, color banding, or blockiness. The conversion is lossless in that it adds nothing and removes nothing. It's a faithful pixel-for-pixel copy in a different container.</p>
      <p><strong>Transparency isn't automatic.</strong> Converting to PNG gives you a format that supports transparency, but the actual image still has a solid background. You'll need to remove the background separately (in a design tool or with a background removal tool) to get actual transparency.</p>
      <p><strong>PNG is the editing format, not the delivery format.</strong> Work in PNG, deliver in JPG or WebP. Your final web or email assets should almost always be compressed lossy formats. PNG is for the working file.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Feature</th><th>JPG</th><th>PNG</th></tr></thead>
        <tbody>
          <tr><td>Compression</td><td>Lossy</td><td>Lossless</td></tr>
          <tr><td>Transparency</td><td>No</td><td>Yes (alpha channel)</td></tr>
          <tr><td>Typical photo size</td><td>200–500 KB</td><td>2–5 MB</td></tr>
          <tr><td>Re-save quality loss</td><td>Yes, cumulative</td><td>None</td></tr>
          <tr><td>Best for</td><td>Final delivery, web, email</td><td>Editing, compositing, design</td></tr>
          <tr><td>Browser support</td><td>Universal</td><td>Universal</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['png-to-jpg', 'image-compressor', 'webp-to-png'],
  },
  {
    slug: 'background-remover',
    name: 'AI Background Remover',
    shortDescription: 'Remove backgrounds from images instantly with AI — no signup required.',
    category: 'tools',
    route: '/tools/background-remover',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    icon: 'Bot',
    metaTitle: 'AI Background Remover — Free, No Signup | clevr.tools',
    metaDescription:
      'Remove image backgrounds instantly with AI. Free, no signup, no watermark. Upload a photo and download a clean transparent PNG in seconds.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have a product photo that needs a clean cutout for Shopify, Etsy, Amazon, or a pitch deck. You want a profile photo without the messy office wall behind it. You need to drop a person, pet, or object into a social graphic without opening Photoshop. These are the moments where AI background removal saves real time.</p>
      <p>It is especially useful for ecommerce. Most marketplaces look better when product images sit on transparent or plain white backgrounds, but hand-masking every image is not a sensible use of time. Background removal lets you cut the subject once, then reuse the transparent PNG across storefronts, ads, and presentation slides.</p>
      <p>It also replaces the frustrating part of tools like remove.bg: the free tier here gives you full-resolution output with no watermark. If the model gives you a clean cutout, you can keep it. No artificial downgrade after the work is done.</p>

      <h2>Good to know</h2>
      <p><strong>This is the one clevr.tools image tool that runs server-side.</strong> Your image is sent to our AI server, processed in memory, and immediately deleted. Nothing is stored. The reason is simple: the BiRefNet model is too large to run reliably in a browser tab or Vercel function.</p>
      <p><strong>The output is always PNG.</strong> Transparency needs an alpha channel, and PNG is the safe universal format for that. Even if you upload JPG or WebP, the result comes back as a transparent PNG so you can layer it anywhere.</p>
      <p><strong>Complex edges are where AI matters.</strong> Hair, fur, fabric, and semi-transparent edges are the hard cases. The model handles them well on strong source images, but not perfectly on every file. Clean lighting and clear subject separation still help a lot.</p>
      <p><strong>Free tier is intentionally useful.</strong> You get 5 removals per day, full output resolution, and no watermark. That is enough for occasional product edits, profile images, and social graphics without gating the result behind a paywall.</p>
      <p><strong>Use the cutout as a starting point.</strong> Once you have a transparent PNG, the next steps are usually resize, compress, or convert to WebP. The result here is designed to feed directly into those workflows.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Item</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Supported input</td><td>JPG, PNG, WebP</td></tr>
          <tr><td>Maximum file size</td><td>10 MB</td></tr>
          <tr><td>Maximum dimensions</td><td>4096 × 4096 px</td></tr>
          <tr><td>Output format</td><td>Transparent PNG</td></tr>
          <tr><td>Free limit</td><td>5 removals per day</td></tr>
          <tr><td>Typical processing time</td><td>2–5 seconds</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['resize-image', 'image-compressor', 'png-to-webp'],
    badge: 'new',
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
      <h2>When to use this</h2>
      <p>Gmail bounced your attachment. The upload portal says "file too large." Your Dropbox link won't generate a preview because the PDF is over 50MB. These are the moments you need a compressor.</p>
      <p>Most of the time, the problem isn't the content — it's the overhead. PDFs accumulate metadata, revision histories, XML streams, and bloated cross-reference tables that add megabytes without adding value. Stripping that dead weight can shave 10-40% off the file size without changing a single visible element.</p>
      <p>This is a metadata-and-structure compressor, not an image resampler. If your PDF is large because it's full of high-res photos, the reduction will be modest. But for text-heavy documents with verbose metadata (common with Word-exported PDFs, Adobe InDesign output, and legal document generators), the savings are significant.</p>

      <h2>Good to know</h2>
      <p><strong>Most "bloat" is invisible.</strong> Author names, software version strings, creation timestamps, editing histories, XMP metadata blocks — none of this shows up when you read the PDF, but it can account for 10-30% of the file size. Especially in PDFs generated by enterprise software.</p>
      <p><strong>Your actual content is never touched.</strong> Text, images, fonts, form fields, annotations, bookmarks — all preserved exactly. The compressor only strips metadata and optimizes the internal object table. The PDF opens identically in every reader.</p>
      <p><strong>Image-heavy PDFs won't shrink much.</strong> A 50MB PDF of scanned pages is 50MB because of the images, not the metadata. This tool will trim a few percent, but for dramatic size reduction on image-heavy files, you'd need image resampling (a different technique entirely).</p>
      <p><strong>Word-exported PDFs respond especially well.</strong> Microsoft Word embeds verbose metadata, font subsets, and structural overhead that this compressor strips efficiently. A 10MB Word-exported PDF routinely drops to 6-7MB.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Platform</th><th>File Size Limit</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Gmail</td><td>25 MB</td><td>Attachment limit per email</td></tr>
          <tr><td>Outlook</td><td>20 MB</td><td>Combined attachments</td></tr>
          <tr><td>Most web portals</td><td>5–10 MB</td><td>Insurance, tax, applications</td></tr>
          <tr><td>Dropbox preview</td><td>50 MB</td><td>Larger files won't render inline</td></tr>
          <tr><td>WhatsApp</td><td>100 MB</td><td>Document sharing limit</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You need to drop a chart from a PDF into a slide deck. You want to share a single page from a report on Slack or social media. You're building a web gallery of document thumbnails. Or you just need a quick image of page 1 for a preview card. All of these need JPG, not PDF.</p>
      <p>PDF-to-JPG is also the go-to when you need to extract visuals — graphs, diagrams, infographics — from reports without access to the original source files. Convert the relevant pages, crop in any image editor, done.</p>
      <p>It's particularly useful for social media sharing, where PDF links get ignored but images get engagement. Convert, post, get clicks.</p>

      <h2>Good to know</h2>
      <p><strong>85% quality is the sweet spot.</strong> It's visually indistinguishable from 100% for most documents but produces files 40-60% smaller. Only go higher if you're printing or zooming into fine detail.</p>
      <p><strong>DPI controls the resolution, not the quality slider.</strong> Higher DPI means more pixels per page — bigger files, but sharper output when printed or zoomed. For screen viewing, default DPI is fine. For print, bump it up.</p>
      <p><strong>Text stays sharp because of how rendering works.</strong> PDF.js renders text as vector outlines first, then rasterizes to your chosen resolution. This means text is as sharp as the DPI allows, not limited by the original PDF's internal resolution.</p>
      <p><strong>Use page range to save time.</strong> A 200-page PDF doesn't need all 200 pages converted. Select just the pages you need — the tool skips everything else, which is dramatically faster on long documents.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Use Case</th><th>Quality</th><th>DPI</th><th>Typical File Size</th></tr></thead>
        <tbody>
          <tr><td>Web / social media</td><td>75–85%</td><td>Default (150)</td><td>80–200 KB/page</td></tr>
          <tr><td>Email sharing</td><td>85%</td><td>Default (150)</td><td>150–300 KB/page</td></tr>
          <tr><td>Presentations</td><td>90%</td><td>200</td><td>300–600 KB/page</td></tr>
          <tr><td>Printing</td><td>95–100%</td><td>300</td><td>500 KB–1.5 MB/page</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You photographed six receipts for an expense report. You scanned both sides of your ID for a rental application. You have phone photos of a signed contract that needs to be emailed as one file. The common thread: you have JPG images of real-world documents, and someone needs them as a PDF.</p>
      <p>This is different from PNG-to-PDF in practice. JPG users typically have photos and scans — images from phone cameras, flatbed scanners, or downloaded from email. The content is usually documents, receipts, forms, or ID cards rather than screenshots or design exports.</p>
      <p>It's also the fastest way to package insurance claims, tax documents, college transcripts, or any set of scanned paperwork into the single PDF that every portal and email recipient expects.</p>

      <h2>Good to know</h2>
      <p><strong>Existing compression stays as-is.</strong> JPGs are already compressed. Embedding them in a PDF doesn't add another round of compression or degrade quality further. The artifacts already in your JPG are preserved, not amplified.</p>
      <p><strong>Drag-to-reorder is critical.</strong> For multi-page documents (scanned forms, contracts, ID front/back), page order matters. Drag your images into the correct sequence before converting — it's much easier than fixing page order in a PDF editor afterward.</p>
      <p><strong>"Fit to Image" avoids weird borders.</strong> Phone photos are rarely standard page dimensions. Forcing them onto A4 or Letter adds uneven whitespace. "Fit to Image" creates pages matched to each photo's actual size, which looks cleaner for screen viewing.</p>
      <p><strong>PDF is the universal submission format.</strong> Insurance claims, tax filings, job applications, apartment rentals — virtually every online portal accepts PDF. Converting your scans to PDF before uploading saves you from format rejection errors.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Scenario</th><th>Recommended Page Size</th><th>Margins</th></tr></thead>
        <tbody>
          <tr><td>Scanned receipts</td><td>Fit to Image</td><td>Off</td></tr>
          <tr><td>ID card scans</td><td>Fit to Image</td><td>Off</td></tr>
          <tr><td>Scanned paper forms</td><td>A4 or Letter</td><td>On</td></tr>
          <tr><td>Insurance / tax docs</td><td>A4 or Letter</td><td>On</td></tr>
          <tr><td>Photo collage / portfolio</td><td>Fit to Image</td><td>Optional</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You have five separate PDFs from different departments and the client wants one file. Or you scanned a stack of receipts and now you need a single expense report. Maybe you are assembling a proposal from a cover letter, scope document, and pricing sheet that live in different folders. These are the moments when merging matters.</p>
      <p>Merge is also the fastest way to append a signed addendum to an existing contract, tack a new exhibit onto a legal filing, or combine monthly statements into a year-end archive. Any time you are about to attach multiple PDFs to the same email, stop and merge them first — recipients will thank you.</p>
      <p>One underrated use case: combining presentation handouts with speaker notes into a single reference document after a conference. Much easier to search through one file than twelve.</p>

      <h2>Good to know</h2>
      <p><strong>Page order is your responsibility.</strong> The final PDF follows exactly the sequence you set. Drag files up or down before merging — there is no undo once you download. If you are combining chapters, double-check the order against your table of contents.</p>
      <p><strong>Bookmarks usually do not carry over.</strong> PDF-level bookmarks (the clickable outline panel in Acrobat) are document-specific metadata. When you merge files, each source document's internal bookmark tree is not automatically stitched into a unified outline. If you need bookmarks in the final file, you will need to recreate them in a PDF editor afterward.</p>
      <p><strong>Fonts and images survive intact.</strong> Unlike copy-pasting between Word documents, merging PDFs preserves embedded fonts, vector graphics, and image resolution exactly as they appear in each source file. The merged output is byte-for-byte faithful to the originals.</p>
      <p><strong>File size adds up linearly.</strong> Merging five 2 MB PDFs produces roughly a 10 MB file. There is no compression during the merge step — if you need a smaller result, run the merged file through a PDF compressor afterward.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Use case</th><th>Typical input</th><th>Result</th></tr></thead>
        <tbody>
          <tr><td>Expense report</td><td>5-15 receipt scans</td><td>Single PDF for reimbursement</td></tr>
          <tr><td>Contract assembly</td><td>Agreement + exhibits + signature pages</td><td>One executed document</td></tr>
          <tr><td>Year-end archive</td><td>12 monthly statements</td><td>Single searchable annual record</td></tr>
          <tr><td>Proposal package</td><td>Cover letter + scope + pricing + references</td><td>One professional deliverable</td></tr>
          <tr><td>Conference handouts</td><td>Multiple slide decks or note PDFs</td><td>Unified reference document</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>A 47-page contract lands in your inbox and the client only needs the signature page. Your professor uploaded a 200-slide PDF and you want just the chapter on regression analysis. HR sent a benefits packet and you need to forward only the dental plan pages to your spouse. Splitting is for these moments — when the PDF has what you need, plus a lot of what you do not.</p>
      <p>It is also essential for filing. Courts, insurance portals, and government websites often have strict page limits or require individual exhibits uploaded separately. Splitting a master document into labeled parts is faster than recreating each piece from scratch.</p>
      <p>Another common scenario: you scanned a stack of mixed documents into one PDF and now need to break them apart. Split into individual pages, then re-merge the ones that belong together. It sounds roundabout, but it takes about 30 seconds.</p>

      <h2>Good to know</h2>
      <p><strong>Splitting does not alter the original.</strong> The source PDF is read-only during the process. Every extracted page is written into a brand-new file. Your original document remains untouched — you cannot accidentally corrupt it by extracting pages.</p>
      <p><strong>Cross-page elements may look different.</strong> Headers, footers, and page numbers are baked into each page individually in most PDFs, so they survive extraction. But a table of contents with clickable links to later pages will point to pages that no longer exist in the extracted file. Same for cross-references in legal documents.</p>
      <p><strong>Annotations and form fields come along for the ride.</strong> If page 5 has sticky notes, highlights, or fillable form data, those travel with the extracted page. This is a feature of how PDF page objects work — annotations are stored per-page, not per-document.</p>
      <p><strong>Range notation saves time.</strong> Instead of clicking 20 thumbnails, type "1-5, 8, 12-20" to grab exactly those pages in one shot. Commas separate groups, hyphens define ranges. It is the same syntax most print dialogs use, so it should feel familiar.</p>
      <p><strong>ZIP download for bulk extraction.</strong> Splitting a 100-page PDF into individual pages produces 100 files. The ZIP option bundles them into a single download instead of triggering 100 separate save dialogs.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Scenario</th><th>What to extract</th><th>Best method</th></tr></thead>
        <tbody>
          <tr><td>Signature page from a contract</td><td>Last 1-2 pages</td><td>Page range or thumbnail click</td></tr>
          <tr><td>Chapter from a textbook</td><td>Specific page range</td><td>Range notation (e.g., "34-58")</td></tr>
          <tr><td>Individual exhibits for court filing</td><td>Multiple non-contiguous sections</td><td>Range notation (e.g., "1-3, 12-15, 28")</td></tr>
          <tr><td>Break apart a bulk scan</td><td>Every page individually</td><td>Split all pages + ZIP download</td></tr>
          <tr><td>Remove sensitive pages before sharing</td><td>Everything except certain pages</td><td>Select the pages to keep, not the ones to remove</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You scanned a stack of papers and half the pages came out sideways. You merged PDFs from different sources and now page 7 is upside-down. Your phone scanned a document in landscape when it should have been portrait. These are annoyingly common — and surprisingly hard to fix without the right tool.</p>
      <p>Rotation issues are especially frequent with flatbed scanners (which don't auto-detect orientation), phone-scanned documents (where the phone's gyroscope guessed wrong), and merged PDFs where different source files had different orientations.</p>
      <p>The fix takes seconds. Click the page, click rotate, download. The corrected orientation is permanent — every recipient sees the pages the right way up.</p>

      <h2>Good to know</h2>
      <p><strong>Rotation is metadata-only.</strong> The PDF spec stores rotation as a page property (0°, 90°, 180°, 270°) rather than actually re-rendering the content. This means zero quality loss — text, images, and vectors are untouched. The file size barely changes.</p>
      <p><strong>It's per-page, not per-document.</strong> You can rotate page 3 without affecting pages 1 and 2. This matters when only some pages in a merged document are misoriented — you fix exactly what's wrong and leave the rest alone.</p>
      <p><strong>Some scanners are repeat offenders.</strong> If your scanner consistently produces sideways pages, it's usually a driver setting (page size vs. feed direction mismatch). But when you're in a hurry, rotating after scanning is faster than troubleshooting the scanner.</p>
      <p><strong>The fix is permanent.</strong> Unlike rotating the view in a PDF reader (which resets when you close the file), this tool writes the rotation into the PDF itself. Everyone who opens the file sees the corrected orientation.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Problem</th><th>Rotation Needed</th><th>Common Cause</th></tr></thead>
        <tbody>
          <tr><td>Page is sideways (clockwise)</td><td>90° counter-clockwise</td><td>Landscape scan fed portrait</td></tr>
          <tr><td>Page is sideways (counter-clockwise)</td><td>90° clockwise</td><td>Portrait scan fed landscape</td></tr>
          <tr><td>Page is upside-down</td><td>180°</td><td>Paper fed backwards in scanner</td></tr>
          <tr><td>Mixed orientations after merge</td><td>Per-page correction</td><td>Different source file settings</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>Someone designed a beautiful form in Word or InDesign, exported it as a flat PDF, and now expects people to fill it in digitally. Without fillable fields, recipients are stuck printing it out, writing by hand, and scanning it back. This tool bridges that gap — you overlay interactive fields on top of the static PDF so anyone can type directly into it.</p>
      <p>Common scenarios: employee onboarding packets that HR designed but forgot to make interactive, client intake forms for law firms or clinics, internal checklists that need sign-off fields, and event registration forms that get emailed as attachments. If the PDF already exists and you just need to make it fillable, this is faster than rebuilding it in Adobe Acrobat.</p>
      <p>It is also useful for adding a signature field to a contract or agreement that was originally created without one. Drop a signature box at the bottom of the last page and you have a signable document in seconds.</p>

      <h2>Good to know</h2>
      <p><strong>AcroForm is the standard that actually works.</strong> PDF has two competing form technologies: AcroForm (the original, supported everywhere) and XFA (Adobe's XML-based format, poorly supported outside Acrobat). This tool uses AcroForm, which means your fillable PDF works in Adobe Acrobat, Preview on Mac, Chrome and Firefox's built-in PDF viewers, and most mobile PDF apps. XFA forms routinely break outside Adobe — AcroForm does not.</p>
      <p><strong>Four field types cover most use cases.</strong> Text fields handle names, addresses, and free-form input. Checkboxes work for yes/no questions, agreement acknowledgments, and multi-select lists. Date fields provide structured date entry. Signature fields designate where a signer should place their mark. These four cover the vast majority of form workflows without overcomplicating things.</p>
      <p><strong>Field naming matters more than you think.</strong> If you plan to extract form data programmatically later (via PDF libraries or form processing services), give each field a clear, unique name like "applicant_name" or "agree_terms" rather than "Field1." It saves significant headaches downstream.</p>
      <p><strong>The underlying PDF is untouched.</strong> Form fields are layered on top of the existing page content. The original text, images, and formatting remain exactly as they were. If a recipient opens the PDF in a viewer that does not support forms, they still see the full original document — the fields just will not be interactive.</p>
      <p><strong>Filled-in data can be saved by the recipient.</strong> When someone fills out your form and saves the PDF, their responses are stored in the file. They can reopen it later and their answers are still there. This is standard AcroForm behavior — no special "save permissions" are required.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Field type</th><th>Best for</th><th>Compatibility</th></tr></thead>
        <tbody>
          <tr><td>Text field</td><td>Names, addresses, free-form answers</td><td>All PDF readers</td></tr>
          <tr><td>Checkbox</td><td>Yes/no, agreements, multi-select</td><td>All PDF readers</td></tr>
          <tr><td>Date field</td><td>Dates of birth, deadlines, event dates</td><td>Most PDF readers</td></tr>
          <tr><td>Signature field</td><td>Contract sign-off, approval workflows</td><td>Acrobat, Preview, most mobile apps</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You shot a product photo at 4000 x 3000 pixels but the e-commerce platform caps uploads at 1200 px wide. Or you're preparing images for a blog post and each one needs to be exactly 800 px wide so the layout doesn't shift. Maybe you're batch-resizing 50 headshots for a company directory page where every photo must be 400 x 400. Any time an image's pixel dimensions don't match where it's going, this is the tool.</p>
      <p>Social media is another constant trigger. Every platform has its own preferred image dimensions — an Instagram post is 1080 x 1080, a LinkedIn banner is 1584 x 396, a YouTube thumbnail is 1280 x 720. Uploading an image at the wrong size means the platform will crop or scale it unpredictably, often cutting off faces or text. Using the preset mode here gives you exact dimensions so you control what gets shown.</p>
      <p>The target file size mode solves a different problem entirely: upload limits. Some forms, forums, and email systems cap attachments at 500 KB or 1 MB. Rather than guessing at compression settings, enter the target size and the tool iteratively adjusts quality until the file fits — no trial and error.</p>

      <h2>Good to know</h2>
      <p><strong>Aspect ratio lock prevents distortion.</strong> When enabled, changing the width automatically recalculates the height (and vice versa) to maintain the original proportions. Disable it only when you intentionally want to stretch — like converting a 4:3 photo to a 16:9 banner where some distortion is acceptable.</p>
      <p><strong>Upscaling adds pixels but not detail.</strong> Enlarging a 200 px image to 2000 px won't magically add sharpness. The Canvas API interpolates between existing pixels, producing a softer result. For best quality, always resize down from a larger original rather than up from a smaller one.</p>
      <p><strong>Batch mode applies the same settings to every file.</strong> Drop 50 images and they all get resized to identical dimensions. This is the fastest way to standardize a set of product photos, team headshots, or presentation assets.</p>
      <p><strong>Everything stays on your device.</strong> Images are drawn to an HTML5 Canvas element and re-exported entirely in your browser. No pixel data is transmitted to a server. Blob URLs are released after download to free memory.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Platform</th><th>Format</th><th>Dimensions (px)</th></tr></thead>
        <tbody>
          <tr><td>Instagram</td><td>Post (square)</td><td>1080 x 1080</td></tr>
          <tr><td>Instagram</td><td>Story / Reel</td><td>1080 x 1920</td></tr>
          <tr><td>Facebook</td><td>Cover photo</td><td>820 x 312</td></tr>
          <tr><td>Twitter / X</td><td>Header image</td><td>1500 x 500</td></tr>
          <tr><td>LinkedIn</td><td>Banner</td><td>1584 x 396</td></tr>
          <tr><td>YouTube</td><td>Thumbnail</td><td>1280 x 720</td></tr>
          <tr><td>Pinterest</td><td>Pin</td><td>1000 x 1500</td></tr>
          <tr><td>Passport photo</td><td>US standard</td><td>600 x 600</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>Your client asked for "the screenshots as a PDF." Your boss wants the slide exports in one file. You scanned five pages of a signed contract and now need to send them as a single document. These are all the same problem: you have PNGs, someone else needs a PDF.</p>
      <p>PNG-to-PDF is especially common for screenshots, UI mockups, and exported presentation slides. Unlike photos (which are usually JPGs), screenshots and design exports default to PNG — so this is typically the tool you reach for when packaging screen captures or diagram exports into a shareable document.</p>
      <p>It also works well for assembling portfolio pages, packaging scanned artwork, or creating simple image-based decks when you don't need transitions or animations.</p>

      <h2>Good to know</h2>
      <p><strong>No quality loss.</strong> PNG is lossless, and embedding it in a PDF preserves every pixel. Unlike JPG-to-PDF, there are zero compression artifacts introduced during conversion. What you see in the PNG is exactly what appears in the PDF.</p>
      <p><strong>"Fit to Image" is usually what you want.</strong> Standard page sizes (A4, Letter) add whitespace around your image. If you're packaging screenshots or mockups, "Fit to Image" creates pages sized exactly to each image's dimensions — no awkward borders.</p>
      <p><strong>One PDF beats a ZIP of images.</strong> Recipients can scroll through a single PDF in any viewer. A ZIP of 12 PNGs requires extracting, sorting, and opening each one separately. PDFs are also easier to annotate and comment on.</p>
      <p><strong>Drag to reorder before you generate.</strong> Page order matters for multi-page documents. Get the sequence right before hitting convert — it's faster than fixing it in a PDF editor later.</p>
      <p><strong>Margins matter for printing.</strong> If the PDF will be printed, add margins. Printers clip the outer edges, and borderless content risks losing important details. For screen-only viewing, skip margins to maximize image size.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Page Size</th><th>Dimensions</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>A4</td><td>210 × 297 mm</td><td>Formal docs, international printing</td></tr>
          <tr><td>US Letter</td><td>8.5 × 11 in</td><td>North American printing, submissions</td></tr>
          <tr><td>Fit to Image</td><td>Matches each PNG</td><td>Screenshots, mockups, screen viewing</td></tr>
        </tbody>
      </table>
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
      'Convert Word documents (.docx) to PDF online free. Preview your document, choose page size and margins. No upload — 100% browser-based, files never leave your device.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You need to send a document that looks the same on every screen, every printer, every operating system. That's the entire point of PDF — it freezes your layout. Word files reflow based on the reader's installed fonts, margins, and Word version. PDFs don't.</p>
      <p>Job applications almost always ask for PDF. So do grant submissions, legal filings, and client deliverables. If someone says "send me the document," they usually mean a PDF — whether they say so or not.</p>
      <p>There's also the edit-prevention angle. A .docx is trivially editable. A PDF signals "this is final." It's not bulletproof (PDFs can be edited), but it sets the right expectation.</p>

      <h2>Good to know</h2>
      <p><strong>Text formatting converts well.</strong> Headings, bold, italic, bullet lists, numbered lists, and tables all come through cleanly. These are the building blocks of most documents, and they're handled reliably.</p>
      <p><strong>Complex layouts may shift.</strong> Multi-column layouts, text boxes, floating images, and custom positioning are harder to replicate outside the Word rendering engine. If your document uses these heavily, expect some visual differences.</p>
      <p><strong>Fonts won't match exactly.</strong> The PDF uses Roboto as the base font. Your original Word fonts (Calibri, Times New Roman, etc.) won't carry over. The text content is identical, but the typography will look slightly different.</p>
      <p><strong>For pixel-perfect results, use Word itself.</strong> Word's built-in File, Export, PDF uses its own rendering engine and preserves everything. This tool is for when you don't have Word installed, or you need a quick conversion without opening a desktop app.</p>
      <p><strong>Your file stays on your device.</strong> Unlike most online converters, nothing is uploaded. The conversion runs entirely in your browser using Mammoth.js and jsPDF.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Formatting Feature</th><th>Conversion Quality</th></tr></thead>
        <tbody>
          <tr><td>Headings (H1-H6)</td><td>Excellent</td></tr>
          <tr><td>Bold, italic, underline</td><td>Excellent</td></tr>
          <tr><td>Bullet and numbered lists</td><td>Excellent</td></tr>
          <tr><td>Tables</td><td>Good</td></tr>
          <tr><td>Inline images</td><td>Good</td></tr>
          <tr><td>Columns and text boxes</td><td>May shift</td></tr>
          <tr><td>Floating images</td><td>May shift</td></tr>
          <tr><td>Headers and footers</td><td>Not supported</td></tr>
          <tr><td>Custom fonts</td><td>Replaced with Roboto</td></tr>
          <tr><td>Macros and form fields</td><td>Not supported</td></tr>
        </tbody>
      </table>
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
    metaTitle: 'Word Counter — Free Online Word & Char Count | clevr.tools',
    metaDescription:
      'Free online word counter. Count words, characters, sentences, paragraphs, and lines in real time. Calculate reading time and speaking time. No signup required.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're staring at a college essay prompt that says "500-750 words" and you have no idea if you're close. You're drafting a LinkedIn post and need to stay under 3,000 characters. You're writing product descriptions that need to hit exactly 150 words for your CMS template. Word counting is one of those tasks that's trivially easy to automate and surprisingly annoying to do manually.</p>
      <p>Writers, students, and content marketers are the heaviest users. But it's also useful for anyone preparing a speech (word count determines duration), writing meta descriptions (Google truncates after ~155 characters), or meeting submission requirements for grants, applications, or competitions.</p>
      <p>The reading time estimate is the hidden gem. If you're publishing online, showing "5 min read" at the top of an article measurably improves engagement — readers commit when they know the time investment upfront.</p>

      <h2>Good to know</h2>
      <p><strong>Reading time uses 238 words per minute.</strong> That's the average silent reading speed for adults, based on a meta-analysis of 190 studies. It's more accurate than the commonly cited 200 or 250 WPM figures that float around the internet.</p>
      <p><strong>Speaking time uses 150 words per minute.</strong> That's a comfortable conversational pace — ideal for presentations, podcasts, and speeches. TED Talks average about 163 WPM, so 150 gives you a slight buffer for pauses and emphasis.</p>
      <p><strong>"Characters without spaces" matters more than you think.</strong> Some platforms (like SMS) count characters including spaces, while others (like certain CMS fields) count without. This tool shows both so you never have to guess.</p>
      <p><strong>Sentences ≠ periods.</strong> The counter handles abbreviations (Dr., U.S., etc.) and decimal numbers without miscounting them as sentence boundaries. It's smarter than a simple period-split.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Platform / Context</th><th>Limit</th><th>Type</th></tr></thead>
        <tbody>
          <tr><td>Twitter / X post</td><td>280</td><td>Characters</td></tr>
          <tr><td>Instagram caption</td><td>2,200</td><td>Characters</td></tr>
          <tr><td>LinkedIn post</td><td>3,000</td><td>Characters</td></tr>
          <tr><td>Meta description (SEO)</td><td>155–160</td><td>Characters</td></tr>
          <tr><td>Google Ads headline</td><td>30</td><td>Characters</td></tr>
          <tr><td>Google Ads description</td><td>90</td><td>Characters</td></tr>
          <tr><td>SMS (single segment)</td><td>160</td><td>Characters</td></tr>
          <tr><td>College essay (typical)</td><td>500–750</td><td>Words</td></tr>
          <tr><td>Blog post (SEO sweet spot)</td><td>1,500–2,500</td><td>Words</td></tr>
          <tr><td>5-minute speech</td><td>~750</td><td>Words</td></tr>
        </tbody>
      </table>
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
    metaTitle: 'Case Converter — Text Case Changer Free | clevr.tools',
    metaDescription:
      'Free online case converter. Convert text to uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, and more. Instant, no signup.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You just pasted a heading from a Word doc and it's ALL CAPS. Or you're porting a Python variable into JavaScript and need to flip snake_case to camelCase. Maybe you're writing a blog post title and want proper Title Case without manually capitalizing each word. These are the moments where a case converter saves you time.</p>
      <p>Developers hit this constantly when moving between languages. Python wants snake_case, JavaScript wants camelCase, React components need PascalCase, and CSS classes expect kebab-case. Retyping by hand is slow and error-prone — one wrong capital and your code breaks silently. Paste, click, copy, done.</p>
      <p>Writers and content teams use it just as often. Headline style guides vary between AP (Title Case) and sentence case, and switching between them for a batch of headings is exactly the kind of tedious work a machine should do. If you've ever inherited a spreadsheet where someone typed everything in caps lock, you already know why this exists.</p>

      <h2>Good to know</h2>
      <p><strong>Title Case isn't just "capitalize every word."</strong> Proper title case lowercases articles, prepositions, and conjunctions (a, the, of, and, in) unless they start the title. This converter follows standard English title case rules, so "the art of war" becomes "The Art of War" — not "The Art Of War."</p>
      <p><strong>camelCase and PascalCase strip spaces and punctuation.</strong> "user first name" becomes "userFirstName" or "UserFirstName". The converter handles multi-word input intelligently, splitting on spaces, hyphens, and underscores before rejoining in the target format.</p>
      <p><strong>Toggle case has a real use beyond memes.</strong> Yes, people use it for sarcastic SpongeBob text. But it's also the fastest way to invert case when you accidentally typed a paragraph with Caps Lock on — toggle it, and everything flips back.</p>
      <p><strong>kebab-case is what URLs want.</strong> Search engines prefer lowercase hyphenated slugs. If you're converting a page title to a URL path, kebab-case gives you a clean, SEO-friendly result without needing a separate slug tool.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Format</th><th>Example</th><th>Where it's used</th></tr></thead>
        <tbody>
          <tr><td>UPPER CASE</td><td>HELLO WORLD</td><td>Constants, acronyms, legal text</td></tr>
          <tr><td>lower case</td><td>hello world</td><td>Body text, email, casual writing</td></tr>
          <tr><td>Title Case</td><td>Hello World</td><td>Headlines, book titles, headings</td></tr>
          <tr><td>Sentence case</td><td>Hello world</td><td>UI strings, subtitles, paragraphs</td></tr>
          <tr><td>camelCase</td><td>helloWorld</td><td>JavaScript/TypeScript variables</td></tr>
          <tr><td>PascalCase</td><td>HelloWorld</td><td>React components, C# classes</td></tr>
          <tr><td>snake_case</td><td>hello_world</td><td>Python, Ruby, database columns</td></tr>
          <tr><td>kebab-case</td><td>hello-world</td><td>URLs, CSS classes, CLI flags</td></tr>
          <tr><td>dot.case</td><td>hello.world</td><td>Config keys, Java packages</td></tr>
          <tr><td>CONSTANT_CASE</td><td>HELLO_WORLD</td><td>Environment variables, enums</td></tr>
        </tbody>
      </table>
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
    metaTitle: 'Lorem Ipsum Generator — Placeholder Text | clevr.tools',
    metaDescription:
      'Generate lorem ipsum placeholder text free. Choose paragraphs, sentences, or words. Copy instantly. No signup — generate realistic Latin filler text for design and development.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're building a landing page and the client hasn't sent the copy yet. The layout needs text — real-length text with paragraph breaks and varied sentence structure — so you can judge spacing, font sizing, and visual rhythm. That's what lorem ipsum is for. Generate it here by paragraph, sentence, or word count, then paste it into your design tool or codebase.</p>
      <p>Developers use it to seed database fixtures, populate demo environments, and stress-test layouts with realistic content volumes. If you've ever hard-coded "test test test" into a prototype, you know how distracting that is in a stakeholder review. Lorem ipsum signals "this is placeholder" immediately — nobody tries to proofread it or give feedback on word choice.</p>
      <p>Here's a detail most people don't know: lorem ipsum is scrambled Latin from Cicero's "de Finibus Bonorum et Malorum," written in 45 BC. The version we use today dates to the 1960s, when Letraset dry-transfer sheets needed filler text for their type specimen catalogs. It stuck because it looks like natural language without being readable — exactly what placeholder text should do.</p>

      <h2>Good to know</h2>
      <p><strong>Don't ship it.</strong> Search engines flag lorem ipsum as thin content. It's fine in staging, mockups, and dev environments, but scan your codebase before launch. A stray "Lorem ipsum dolor sit amet" on a production page can hurt your SEO and looks unprofessional.</p>
      <p><strong>Paragraph length matters for layout testing.</strong> A single paragraph won't reveal how your design handles content flow. Generate 3-5 paragraphs to test how headings, images, and sidebars interact with varying text blocks. If your layout breaks at 4 paragraphs, you'll want to know before real content goes in.</p>
      <p><strong>Word count mode is perfect for constrained UI.</strong> Need exactly 25 words for a card description or 50 for a product blurb? Word mode gives you precise control instead of trimming paragraphs down by hand.</p>
      <p><strong>It's not the only option.</strong> Some teams prefer "real-ish" placeholder text (like Hipster Ipsum or Corporate Ipsum) for presentations. But for pure layout work, classic lorem ipsum remains the standard because it doesn't distract or accidentally offend anyone in a client meeting.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Use case</th><th>Recommended amount</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>Card / preview snippet</td><td>1-2 sentences (15-30 words)</td><td>Tests truncation and overflow</td></tr>
          <tr><td>Blog post preview</td><td>1 paragraph (40-80 words)</td><td>Matches typical excerpt length</td></tr>
          <tr><td>Full page layout</td><td>3-5 paragraphs (200-400 words)</td><td>Reveals scroll behavior and spacing</td></tr>
          <tr><td>Long-form article</td><td>8-12 paragraphs (600-1000 words)</td><td>Stress-tests reading layouts</td></tr>
          <tr><td>Database seed</td><td>10-50 words per field</td><td>Simulates realistic record lengths</td></tr>
          <tr><td>Email template</td><td>2-3 paragraphs (100-200 words)</td><td>Tests rendering across clients</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>You copied text from a PDF and pasted it into an email — and every line is broken in the middle of a sentence. PDF viewers insert hard line breaks at the visual edge of each line, turning flowing paragraphs into fragmented messes. This is the single most common reason people need this tool, and it's the one that drives the most frustration.</p>
      <p>Forwarded email chains are the second culprit. Each forward adds quoting characters, indentation, and inconsistent spacing that accumulates into unreadable noise. Terminal output, OCR text, and spreadsheet exports all have their own flavors of whitespace chaos.</p>
      <p>The fix is usually one click. Paste your broken text, hit "Remove Line Breaks," and get clean continuous prose. For more control, the individual operations let you target exactly what's wrong without overcorrecting.</p>

      <h2>Good to know</h2>
      <p><strong>Hard breaks ≠ paragraph breaks.</strong> "Remove Line Breaks" joins lines within paragraphs while "Remove Empty Lines" eliminates the gaps between paragraphs. Used together, you get a continuous block. Used separately, you can fix the in-paragraph breaks while keeping intentional paragraph structure.</p>
      <p><strong>Extra spaces are the silent pest.</strong> Double spaces after periods (a typewriter-era habit), inconsistent indentation, and tab-space mixtures all hide in text that looks clean at first glance. "Remove Extra Spaces" catches all of these without altering your actual content.</p>
      <p><strong>"Trim Each Line" is for code and lists.</strong> If you have indented text where you want to normalize the leading whitespace without merging lines together, this is the operation. It strips leading and trailing spaces from each line while preserving the line structure itself.</p>
      <p><strong>"Clean All" does everything at once.</strong> If you just want clean, normal text and don't care about preserving any of the existing formatting, one click handles it. It removes line breaks, collapses spaces, strips empty lines, and trims whitespace in a single pass.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Operation</th><th>What It Does</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>Remove Line Breaks</td><td>Replaces newlines with spaces, collapses multiple spaces</td><td>PDF text, OCR output</td></tr>
          <tr><td>Remove Empty Lines</td><td>Strips blank lines between paragraphs</td><td>Double-spaced text, email chains</td></tr>
          <tr><td>Remove Extra Spaces</td><td>Collapses runs of spaces/tabs to single space</td><td>Sloppy formatting, tab-space mix</td></tr>
          <tr><td>Trim Each Line</td><td>Strips leading/trailing whitespace per line</td><td>Code indentation, data cleanup</td></tr>
          <tr><td>Clean All</td><td>All operations in one pass</td><td>"Just fix everything"</td></tr>
        </tbody>
      </table>
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
      <h2>When to use this</h2>
      <p>Every blog post, product page, and CMS entry needs a URL-safe identifier. You could hand-craft slugs by lowercasing, replacing spaces with hyphens, and stripping special characters — or you could paste the title here and get a clean slug instantly. It's one of those small tasks that's annoying to do manually and trivial to automate.</p>
      <p>Beyond URLs, slugs work well as filenames, database keys, CSS class names, and any identifier that needs to be human-readable without special characters. If you're building a CMS, static site, or API, slug generation is a constant need.</p>
      <p>Google recommends 3-5 word slugs for SEO. Shorter URLs get higher click-through rates in search results, and keyword-rich slugs help both users and search engines understand the page before clicking. Get the slug right before publishing — changing a URL after it's indexed means setting up 301 redirects to preserve link equity.</p>

      <h2>Good to know</h2>
      <p><strong>Accented characters get transliterated, not encoded.</strong> "Creme brulee" becomes "creme-brulee", not "cr%C3%A8me-br%C3%BBl%C3%A9e". The converter uses Unicode NFD decomposition to map accented letters to their ASCII equivalents. Clean output that works everywhere.</p>
      <p><strong>Consecutive hyphens collapse into one.</strong> Input like "hello - - world" produces "hello-world", not "hello---world". No stuttering hyphens cluttering up your URLs.</p>
      <p><strong>Leading and trailing hyphens are stripped.</strong> " — My Great Post — " becomes "my-great-post". No dangling punctuation on either end.</p>
      <p><strong>Numbers are preserved.</strong> "Top 10 Tips for 2024" becomes "top-10-tips-for-2024". Digits stay exactly where they are.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Input</th><th>Output</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>How to Make Sourdough Bread</td><td>how-to-make-sourdough-bread</td><td>Standard conversion</td></tr>
          <tr><td>Creme Brulee Recipe</td><td>creme-brulee-recipe</td><td>Accent transliteration</td></tr>
          <tr><td>Price: $9.99!!!</td><td>price-9-99</td><td>Symbols stripped, numbers kept</td></tr>
          <tr><td>  — Hello World —  </td><td>hello-world</td><td>Trimmed edges, collapsed hyphens</td></tr>
          <tr><td>React and Next.js Tutorial</td><td>react-and-next-js-tutorial</td><td>Dots removed</td></tr>
          <tr><td>Uber Cool Cafe</td><td>uber-cool-cafe</td><td>Transliteration</td></tr>
        </tbody>
      </table>
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
    metaTitle: 'Character Counter — Free Online Tool | clevr.tools',
    metaDescription: 'Free character counter. Count characters with and without spaces, words, and lines in real time. See limits for Twitter, Instagram, and SMS. No signup.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're drafting a tweet and you're at 274 characters — do you have room for that hashtag? You're writing a meta description and need to stay under 160 characters before Google truncates it with "..." in search results. You're composing an SMS for a marketing campaign and every character past 160 splits it into a second message that doubles your cost.</p>
      <p>Character limits are everywhere, and guessing wrong has real consequences. A truncated social media post loses its call-to-action. A meta description that runs long gets replaced by whatever snippet Google chooses. An SMS that overflows costs twice as much to send. This counter shows you exactly where you stand — in real time, as you type.</p>
      <p>It's also useful when you don't have a strict limit but need awareness. Writing a headline? Shorter is almost always better. Crafting a push notification? You've got about 50 characters before it gets cut on most lock screens. Filling out a form field that silently truncates at the database level? Knowing your character count prevents nasty surprises.</p>

      <h2>Good to know</h2>
      <p><strong>"Characters" and "characters without spaces" serve different purposes.</strong> Twitter counts spaces. SMS counts spaces. But if you're checking word-processor-style character counts (like for academic submissions), many institutions specify "characters excluding spaces." This tool shows both so you don't have to wonder which one you're looking at.</p>
      <p><strong>Emojis can count as more than one character.</strong> A simple smiley is 2 bytes in UTF-16, but compound emojis (like family emojis or flag emojis) can be 7+ code points joined by zero-width joiners. Platforms count these differently — Twitter counts most emojis as 2 characters regardless of visual complexity.</p>
      <p><strong>Meta descriptions aren't measured in characters — they're measured in pixels.</strong> Google's display width is about 920 pixels on desktop. A string of capital W's hits the limit at ~105 characters, while lowercase i's could run past 200. The 155-160 character guideline assumes average-width text. If your description is heavy on wide letters, aim shorter.</p>
      <p><strong>Line count matters for code.</strong> Many coding challenges, pull request guidelines, and style guides set maximum line counts. If you're cleaning up a function or splitting a file, knowing your line count saves you from counting manually in your editor.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Platform</th><th>Limit</th><th>What happens when exceeded</th></tr></thead>
        <tbody>
          <tr><td>Twitter / X post</td><td>280 characters</td><td>Can't post — hard limit</td></tr>
          <tr><td>Instagram caption</td><td>2,200 characters</td><td>Truncated with "...more"</td></tr>
          <tr><td>Meta description (SEO)</td><td>~155-160 characters</td><td>Google truncates or rewrites</td></tr>
          <tr><td>SMS (single segment)</td><td>160 characters</td><td>Splits into multiple messages</td></tr>
          <tr><td>YouTube title</td><td>100 characters</td><td>Truncated in search results</td></tr>
          <tr><td>LinkedIn post</td><td>3,000 characters</td><td>Can't post — hard limit</td></tr>
          <tr><td>Facebook post</td><td>63,206 characters</td><td>Truncated with "See more"</td></tr>
          <tr><td>Google Ads headline</td><td>30 characters</td><td>Rejected — won't run</td></tr>
          <tr><td>Push notification (iOS)</td><td>~110 characters</td><td>Truncated on lock screen</td></tr>
          <tr><td>Email subject line</td><td>~60 characters</td><td>Cut off in inbox preview</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free JSON formatter, validator, and minifier. Paste JSON to beautify with proper indentation or minify. Instant error detection with line numbers. No signup.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You just hit an API endpoint and the response came back as a single wall of text — thousands of characters with no whitespace. You need to find one nested field three levels deep, but scrolling through minified JSON is like reading a novel with no paragraphs. Paste it here and the structure appears instantly with proper indentation.</p>
      <p>Same story when you're debugging a webhook payload, inspecting a JWT body (decode the middle segment with Base64 first, then format the JSON here), or trying to make sense of a massive config file someone committed without formatting. If the JSON is broken, you'll get the exact line and character position of the error instead of a cryptic "Unexpected token" from your browser console.</p>
      <p>The minify direction is just as useful. You need to shove JSON into an environment variable, a URL parameter, or a single-line config field — compacting it down removes all whitespace while keeping the data intact.</p>

      <h2>Good to know</h2>
      <p><strong>JSON is not JavaScript.</strong> Despite the name, JSON is a strict subset. Trailing commas are illegal. Keys must be double-quoted strings. No comments allowed. Single quotes don't work. If you're used to writing JS objects, these are the rules that trip you up — and this validator catches all of them.</p>
      <p><strong>Indentation is a style choice, not a spec requirement.</strong> The JSON specification (RFC 8259) says nothing about whitespace formatting. Two spaces, four spaces, tabs — all produce identical data. This tool defaults to 2-space indentation because it's the most common convention in web development, but the minified output is what actually gets sent over the wire.</p>
      <p><strong>Large JSON files can crash browser dev tools.</strong> Chrome's console pretty-printer chokes on responses above ~5MB. Pasting into a dedicated formatter is often faster and more reliable for big payloads since it doesn't carry the overhead of the entire DevTools environment.</p>
      <p><strong>Power user tip: JSON5 isn't JSON.</strong> If you're getting validation errors on a file that "looks right," check whether it uses JSON5 extensions (comments, trailing commas, unquoted keys). Many config tools — including VS Code's settings.json — actually use JSON5 or JSONC under the hood, which won't validate as strict JSON per RFC 8259.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Common JSON Error</th><th>What It Means</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td>Unexpected token at position N</td><td>Invalid character at byte N</td><td>Check for trailing commas or missing quotes near that position</td></tr>
          <tr><td>Unterminated string</td><td>A string value was never closed</td><td>Look for a missing closing double quote</td></tr>
          <tr><td>Expected ':' after key</td><td>Object key without a value</td><td>Add a colon and value after the key</td></tr>
          <tr><td>Unexpected end of input</td><td>JSON is incomplete</td><td>Check for missing closing <code>}</code> or <code>]</code></td></tr>
          <tr><td>Duplicate key</td><td>Same key appears twice in one object</td><td>RFC 8259 says keys SHOULD be unique — rename or remove the duplicate</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free find and replace tool. Fix repeated typos and batch-edit text. Supports case-sensitive search, whole word matching, and regex. No signup required.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Someone changed their name and it appears 47 times in your document. The API base URL switched from staging to production and you've got 200 lines of config to update. A CSV export has semicolons where you need commas. These are find-and-replace problems, and doing them by hand is a recipe for missed instances and inconsistency.</p>
      <p>Plain text mode handles the obvious cases — swap one word for another, fix a repeated typo, change a domain name. But the real power is in regex mode. Regular expressions let you match patterns instead of exact strings: any date in MM/DD/YYYY format, any email address, any phone number with or without dashes. Match the pattern, replace it with the corrected version, and every instance updates at once.</p>
      <p>The match counter updates live as you type your search term. You'll see exactly how many replacements will happen before you commit — no surprises, no "undo 200 times" panic. And since everything runs in your browser, your text never leaves your machine.</p>

      <h2>Good to know</h2>
      <p><strong>Case-sensitive mode prevents false positives.</strong> Replacing "us" catches "US", "bus", "focus", and "mushroom" if you're not careful. Turn on case-sensitive matching and whole-word mode together to target exactly what you mean.</p>
      <p><strong>Regex capture groups let you rearrange, not just replace.</strong> Use parentheses to capture parts of a match, then reference them with $1, $2 in the replacement. "(\w+), (\w+)" replaced with "$2 $1" flips "Doe, John" to "John Doe" across your entire list.</p>
      <p><strong>Backslash-n inserts line breaks in the replacement.</strong> Replacing "; " with ";\n" splits semicolon-separated values into one-per-line — useful for reformatting compressed CSS, log entries, or data dumps into something readable.</p>
      <p><strong>Preview before committing.</strong> The live match count and highlighted matches show you exactly what will change. If you see 300 matches when you expected 30, your search term is probably too broad. Narrow it down before replacing.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Regex pattern</th><th>What it matches</th><th>Example use</th></tr></thead>
        <tbody>
          <tr><td>\\b\\w+@\\w+\\.\\w+\\b</td><td>Email addresses</td><td>Redact emails from a document</td></tr>
          <tr><td>\\d{3}[-.]?\\d{3}[-.]?\\d{4}</td><td>US phone numbers</td><td>Standardize phone format</td></tr>
          <tr><td>\\d{1,2}/\\d{1,2}/\\d{2,4}</td><td>Dates (M/D/YY or MM/DD/YYYY)</td><td>Convert date formats</td></tr>
          <tr><td>(\\w+), (\\w+)</td><td>"Last, First" names</td><td>Flip to "First Last" with $2 $1</td></tr>
          <tr><td>^\\s+</td><td>Leading whitespace</td><td>Strip indentation from pasted code</td></tr>
          <tr><td>https?://\\S+</td><td>URLs (http and https)</td><td>Extract or replace all links</td></tr>
          <tr><td>\\s{2,}</td><td>Multiple consecutive spaces</td><td>Collapse to single spaces</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You exported a list of 500 email addresses and need them alphabetized. You're cleaning up a keyword list for SEO and want duplicates removed. You pulled a column of product names from a spreadsheet and need them sorted by length so you can spot the outliers. These are all "sort lines" problems — and opening Excel or writing a Python script for them is overkill.</p>
      <p>Paste your list, pick a sort mode, and get the result instantly. Alphabetical sorting is case-insensitive by default, so "apple" and "Apple" end up next to each other instead of being separated by ASCII rules (where all uppercase letters come before any lowercase letter — "Z" before "a"). That one detail saves more headaches than you'd expect.</p>
      <p>The deduplicate option is quietly the most useful feature here. Combine it with alphabetical sort and you get a clean, unique, ordered list in one step — the same result that would take a spreadsheet formula, a Set() in JavaScript, or a "sort | uniq" pipe in the terminal.</p>

      <h2>Good to know</h2>
      <p><strong>Numeric sort treats "10" as ten, not as "1" followed by "0".</strong> Alphabetical sorting puts "10" before "2" because it compares character by character. Numeric sort understands that 2 < 10. If you're sorting version numbers, scores, prices, or any list with numbers in it, numeric mode is what you want.</p>
      <p><strong>Sort by length finds outliers fast.</strong> If you're reviewing a list of product titles, meta descriptions, or database entries, sorting by length immediately reveals the too-short and too-long entries. It's a quick quality check you can do without writing any code.</p>
      <p><strong>Random sort is fair randomization.</strong> It uses a proper shuffle algorithm, not a naive sort-by-random comparison (which produces biased results). Use it for raffle drawings, random quiz question order, or A/B test group assignments where fairness matters.</p>
      <p><strong>Reverse works with any sort mode.</strong> Sort Z-A, longest-to-shortest, or largest-to-smallest. Every sort mode has a reverse option, so you don't need to sort and then flip — just check the reverse box.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Sort mode</th><th>How it orders</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td>Alphabetical (A-Z)</td><td>Case-insensitive Unicode order</td><td>Name lists, glossaries, tags</td></tr>
          <tr><td>Alphabetical (Z-A)</td><td>Reverse alphabetical</td><td>Reverse lookups, inverted indexes</td></tr>
          <tr><td>Numeric (ascending)</td><td>Parses numbers, sorts by value</td><td>Scores, prices, version numbers</td></tr>
          <tr><td>Numeric (descending)</td><td>Largest numbers first</td><td>Leaderboards, top-N lists</td></tr>
          <tr><td>By length (short first)</td><td>Character count, ascending</td><td>Finding short entries, outlier detection</td></tr>
          <tr><td>By length (long first)</td><td>Character count, descending</td><td>Finding verbose entries, truncation checks</td></tr>
          <tr><td>Random</td><td>Fisher-Yates shuffle</td><td>Raffles, quiz order, test groups</td></tr>
          <tr><td>Remove duplicates</td><td>Preserves original order</td><td>Deduplicating any list</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free Base64 encoder and decoder. Encode text to Base64 or decode back to plain text. Handles Unicode. Instant, browser-based, no data sent to any server.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're debugging an API response and one of the fields is a blob of characters ending in "==" — that's Base64. You need to decode it to see the actual data inside. Or you're looking at a JWT token and want to read the payload: split the token on the dots, grab the middle segment, and paste it here to reveal the JSON claims.</p>
      <p>Encoding is just as common. You need to embed a small image directly in CSS or HTML as a data URI. You're setting up Basic Auth and need to encode "username:password" into the <code>Authorization</code> header value. You're stuffing binary data into a JSON field or an environment variable that only accepts text. Base64 is the standard way to make binary safe for text-only channels.</p>
      <p>In plain terms, Base64 takes every 3 bytes of input and represents them as 4 ASCII characters from a 64-character alphabet (A-Z, a-z, 0-9, +, /). The "==" padding at the end fills out the last group when the input isn't evenly divisible by 3. That's the entire trick — it's encoding, not encryption. Anyone can decode it.</p>

      <h2>Good to know</h2>
      <p><strong>Base64 is not encryption.</strong> It's a common misconception. Base64 is a reversible encoding — there's no key, no secret, no security. If you see credentials stored as Base64 "for security," that's a red flag. Anyone can decode it instantly. It exists purely to make binary data safe for text transport, not to hide anything.</p>
      <p><strong>JavaScript's <code>btoa()</code> breaks on Unicode.</strong> The built-in <code>btoa()</code> function only handles Latin-1 characters. Feed it an emoji, an accented character, or any multibyte UTF-8 and you'll get "Failed to execute 'btoa'." The correct approach — and what this tool uses — is to encode to UTF-8 bytes first, then Base64-encode those bytes. The <code>TextEncoder</code> API makes this clean.</p>
      <p><strong>Base64 increases size by ~33%.</strong> Every 3 bytes become 4 characters. A 1MB image becomes ~1.33MB as a data URI. For small assets (icons, tiny SVGs) the overhead is worth avoiding an extra HTTP request. For anything above a few KB, serve the file normally.</p>
      <p><strong>Power user tip: Base64url is a thing.</strong> Standard Base64 uses <code>+</code> and <code>/</code>, which are special characters in URLs. Base64url (RFC 4648 Section 5) swaps those for <code>-</code> and <code>_</code> and drops the padding. JWTs use Base64url, not standard Base64 — so if you're manually decoding a JWT segment and the output looks garbled, that's probably why.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Input</th><th>Base64 Output</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Hello</td><td>SGVsbG8=</td><td>Single <code>=</code> pad (5 bytes, 1 leftover)</td></tr>
          <tr><td>Hi</td><td>SGk=</td><td>One pad character</td></tr>
          <tr><td>ABC</td><td>QUJD</td><td>No padding needed (3 bytes divides evenly)</td></tr>
          <tr><td>user:pass</td><td>dXNlcjpwYXNz</td><td>HTTP Basic Auth format</td></tr>
          <tr><td>{"sub":"1234"}</td><td>eyJzdWIiOiIxMjM0In0=</td><td>JWT-style JSON payload</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Password Generator — Strong & Random | clevr.tools',
    metaDescription: 'Free secure password generator. Create strong random passwords with custom length and character sets. Uses crypto-grade randomness. Browser-based, no data sent.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're signing up for a new service and you need a password that isn't "Summer2024!" — which, by the way, appears in every major breach database. You need something truly random, something no human would think of, something that can't be guessed from your birthday, pet's name, or favorite band. That's what this generator does.</p>
      <p>It's also for the moments when you need a quick API key, a temporary shared secret for a staging environment, or a random token for a one-time link. Any time you need a string that's unpredictable and high-entropy, generating one here is faster than mashing your keyboard and hoping for the best.</p>
      <p>Every password is generated using your browser's <code>crypto.getRandomValues()</code> API — the same cryptographic random number generator that underpins TLS, SSH keys, and encryption software. Nothing is sent to any server. The password exists only in your browser until you copy it.</p>

      <h2>Good to know</h2>
      <p><strong>Length beats complexity, every time.</strong> A 20-character lowercase password (26^20 = ~95 bits of entropy) is harder to crack than a 10-character password using all character types (95^10 = ~66 bits). If a site lets you use long passwords, go long rather than short-and-complex. The math isn't close.</p>
      <p><strong><code>Math.random()</code> is not suitable for passwords.</strong> Most programming tutorials generate passwords with <code>Math.random()</code>, which uses a pseudo-random algorithm seeded by a predictable value. An attacker who knows the implementation can reduce the search space dramatically. <code>crypto.getRandomValues()</code> draws from the OS entropy pool — CPU jitter, interrupt timing, hardware noise — and is the only acceptable source for security-sensitive randomness in the browser.</p>
      <p><strong>The "exclude ambiguous characters" option exists for a reason.</strong> When you have to read a password aloud, type it on a TV remote, or enter it on a device without paste support, confusing <code>0</code> with <code>O</code> or <code>1</code> with <code>l</code> is infuriating. Excluding these look-alikes costs a tiny amount of entropy but saves real-world headaches.</p>
      <p><strong>Power user tip: entropy is what actually matters.</strong> A password's strength is measured in bits of entropy: <code>log2(pool_size ^ length)</code>. A 16-character password from a 95-character pool has ~105 bits. At 10 billion guesses per second (a well-funded attacker with GPUs), that takes longer than the age of the universe to brute-force. Aim for 80+ bits minimum for anything important.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Password Config</th><th>Pool Size</th><th>Entropy (16 chars)</th><th>Brute-force Time*</th></tr></thead>
        <tbody>
          <tr><td>Lowercase only</td><td>26</td><td>~75 bits</td><td>~1.2 million years</td></tr>
          <tr><td>Lower + upper</td><td>52</td><td>~91 bits</td><td>~78 billion years</td></tr>
          <tr><td>Lower + upper + digits</td><td>62</td><td>~95 bits</td><td>~1.4 trillion years</td></tr>
          <tr><td>All printable ASCII</td><td>95</td><td>~105 bits</td><td>~128 quadrillion years</td></tr>
          <tr><td>Lowercase only (8 chars)</td><td>26</td><td>~37 bits</td><td>~21 seconds</td></tr>
        </tbody>
      </table>
      <p>* At 10 billion guesses/second (modern GPU cluster)</p>
    `,
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
    metaDescription: 'Free random number generator. Pick numbers in any range, flip a coin, or roll dice. Uses cryptographic randomness for true fairness. No signup required.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Your team is running a giveaway and you need to pick a winner from 500 entries. Or you're a teacher assigning students to groups and want the selection to be genuinely unbiased. Maybe you're settling a friendly argument about who pays for dinner. Any time you need a number that nobody can predict or accuse of being rigged, you need a random number generator backed by real entropy — not a coin flip, not "just pick one," and not a PRNG seeded by the clock.</p>
      <p>Developers use this for generating test data, seeding sample databases, or simulating dice rolls in a board game prototype. Researchers use it for selecting random samples from a population. DMs use it for tabletop RPGs when their physical dice are across the room. The tool supports custom ranges, multiple results at once, and built-in dice and coin flip modes for the most common scenarios.</p>
      <p>This generator uses your browser's <code>crypto.getRandomValues()</code> API, which draws from hardware entropy collected by your operating system — CPU timing jitter, interrupt timing, and other physically unpredictable signals. Unlike <code>Math.random()</code>, which uses a deterministic PRNG seeded by the clock, these results cannot be predicted or reproduced.</p>

      <h2>Good to know</h2>
      <p><strong>Cryptographic randomness is overkill for most tasks — and that's fine.</strong> You don't strictly need hardware entropy to pick a restaurant. But using it means nobody can claim the result was biased, and it costs nothing extra. Better to over-deliver on fairness than to explain why <code>Math.random()</code> was "good enough."</p>
      <p><strong>Multiple results are independent.</strong> Generating 10 numbers between 1 and 100 can produce duplicates because each draw is independent. If you need unique numbers (like raffle picks), the tool removes duplicates from the result set automatically when you enable that option.</p>
      <p><strong>Dice notation maps to ranges.</strong> A d20 is just a random integer from 1 to 20. 2d6 is two independent rolls of 1-6, summed. The built-in dice mode handles standard polyhedral dice (d4, d6, d8, d10, d12, d20, d100) so you don't need to set ranges manually.</p>
      <p><strong>Coin flips are 50/50, not 51/49.</strong> Physical coins have a slight bias toward the side facing up at the start of the toss (about 51%). A cryptographic coin flip is exactly 50/50 — one bit of entropy, no physics involved.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Use Case</th><th>Range / Mode</th><th>Fairness Level</th></tr></thead>
        <tbody>
          <tr><td>Giveaway winner (500 entries)</td><td>1 – 500</td><td>Cryptographic — auditable</td></tr>
          <tr><td>Coin flip</td><td>Heads / Tails</td><td>Exactly 50/50</td></tr>
          <tr><td>D&D attack roll</td><td>d20 (1 – 20)</td><td>Uniform distribution</td></tr>
          <tr><td>Random group assignment</td><td>1 – N (multiple results)</td><td>Independent draws</td></tr>
          <tr><td>Lottery-style pick (no repeats)</td><td>1 – 49, 6 unique results</td><td>Cryptographic, deduplicated</td></tr>
          <tr><td>Test data seeding</td><td>Any range, bulk generation</td><td>CSPRNG-backed</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You found the perfect blue on a competitor's landing page with your browser's eyedropper, but it came back as an RGB value and your CSS file uses HEX. Or you're building a design system and need to generate lighter and darker variants of a brand color — easy in HSL (just change the lightness channel), nearly impossible to eyeball in HEX. This color picker lets you move fluidly between formats without manual math or switching between tools.</p>
      <p>It's also the tool you reach for when a designer hands you an HSB value from Figma and you need the HSL equivalent for your stylesheet, or when a print vendor asks for RGB breakdowns of a color you only have as a hex code. Every format has a one-click copy button, so you pick once and paste wherever you need it.</p>
      <p>The recently-used colors panel remembers up to 10 swatches per session, which is useful when you're comparing two near-identical blues or building a palette of complementary tones. Edit any input field directly — type a hex code, nudge an HSL hue slider, adjust a single RGB channel — and all other formats update in real time.</p>

      <h2>Good to know</h2>
      <p><strong>HSL is the friendliest format for creating variants.</strong> Need a hover state that's 10% darker? Subtract 10 from the lightness value. Need a muted version? Drop the saturation. HEX and RGB make these adjustments opaque because the channels don't map to human perception the way HSL does.</p>
      <p><strong>HEX shorthand works — but only for doubles.</strong> <code>#3B82F6</code> cannot be shortened, but <code>#FFFFFF</code> compresses to <code>#FFF</code>. The picker always outputs full six-character HEX so there's no ambiguity when pasting into tools that don't support shorthand.</p>
      <p><strong>HSB and HSL are not the same thing.</strong> Both use Hue, but HSB's "Brightness" channel behaves differently from HSL's "Lightness." A color at HSB 100% brightness can still be fully saturated; at HSL 100% lightness it's pure white. Figma and Photoshop use HSB, while CSS uses HSL — mixing them up shifts your colors.</p>
      <p><strong>RGB values are device-dependent.</strong> <code>rgb(59, 130, 246)</code> looks slightly different on a wide-gamut display versus an sRGB monitor. For web work this rarely matters, but for print or color-critical design, be aware that RGB is a relative color space.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Format</th><th>Syntax Example</th><th>Primary Use</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>HEX</td><td>#3B82F6</td><td>CSS, HTML, SVG</td><td>Web development, design handoffs</td></tr>
          <tr><td>RGB</td><td>rgb(59, 130, 246)</td><td>CSS, Canvas API, LED control</td><td>Programmatic color manipulation</td></tr>
          <tr><td>HSL</td><td>hsl(217, 91%, 60%)</td><td>CSS, design systems</td><td>Creating tints, shades, and palettes</td></tr>
          <tr><td>HSB / HSV</td><td>hsb(217, 76%, 96%)</td><td>Photoshop, Figma, Illustrator</td><td>Visual design tools and color pickers</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You're looking at a job listing that says "15% annual bonus" and want to know what that actually adds to a $72,000 salary. Or a store is running "35% off everything" and you need the real price before you get to checkout. Maybe your portfolio dropped from $12,400 to $10,800 and you want to know the exact percentage loss. Percentages are everywhere — tips, taxes, grades, discounts, returns — and the mental math is easy to get wrong.</p>
      <p>This calculator handles the three percentage problems that come up most often, all in one place. Enter your numbers and the result updates instantly, along with the formula used so you can verify the logic or do it yourself next time. No more Googling "how to calculate percentage change" and scrolling past five ads to find the formula.</p>
      <p>It's also a teaching tool. Students working through math or finance problems can see both the answer and the step-by-step calculation. Understanding that "percentage of" is multiplication, "what percent" is division, and "percentage change" is a ratio removes the mystery from a concept that trips people up well into adulthood.</p>

      <h2>Good to know</h2>
      <p><strong>Percentage change has a direction.</strong> Going from 100 to 150 is a 50% increase. Going from 150 back to 100 is a 33.3% decrease — not 50%. The denominator changes because percentage change is always relative to the starting value. This asymmetry surprises people and is the most common percentage mistake.</p>
      <p><strong>"Percentage of" and "percent off" are different operations.</strong> "20% of 80" is 16. "20% off 80" is 80 minus 16 = 64. The first is pure multiplication; the second is a discount calculation. Make sure you're solving the right problem.</p>
      <p><strong>Percentages can exceed 100%.</strong> If your stock went from $50 to $150, that's a 200% increase. If your website traffic tripled, that's a 200% increase too. "100% more" means doubled, not "all of it."</p>
      <p><strong>The formula is always the same pattern.</strong> Percentage = (Part / Whole) x 100. Every percentage problem is a rearrangement of this single equation. Finding the part? Multiply. Finding the whole? Divide. Finding the percent? Divide and multiply by 100.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Scenario</th><th>Formula</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td>What is X% of Y?</td><td>(X / 100) x Y</td><td>15% of 200 = 30</td></tr>
          <tr><td>X is what % of Y?</td><td>(X / Y) x 100</td><td>30 is 15% of 200</td></tr>
          <tr><td>% increase</td><td>((New - Old) / Old) x 100</td><td>200 to 250 = +25%</td></tr>
          <tr><td>% decrease</td><td>((Old - New) / Old) x 100</td><td>250 to 200 = -20%</td></tr>
          <tr><td>Sale price after discount</td><td>Price x (1 - Discount/100)</td><td>$80 at 25% off = $60</td></tr>
          <tr><td>Price before tax</td><td>Total / (1 + Tax/100)</td><td>$108 with 8% tax = $100</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You're following a European recipe that calls for 200 grams of flour and 180 ml of milk, but your kitchen has measuring cups and a pound scale. Or you're a developer and a client's API returns file sizes in bytes but your UI needs to display megabytes. Maybe you're training for a 10K and your treadmill shows pace in minutes per mile while your running app uses minutes per kilometer. Unit conversions are small problems that interrupt bigger tasks — this tool eliminates the interruption.</p>
      <p>The converter covers seven categories: length, weight, temperature, volume, area, speed, and digital storage. Each category includes the full range of units you'd realistically encounter — from millimeters to miles, milligrams to metric tons, bits to petabytes. Type a value on either side and the other updates instantly. No dropdowns to navigate, no "convert" button to click.</p>
      <p>It's especially useful when you're working across measurement systems. The US uses feet, pounds, Fahrenheit, and gallons; most of the world uses meters, kilograms, Celsius, and liters. International collaboration — whether in cooking, engineering, fitness, or software — means you'll hit this friction regularly. Bookmark the converter and it's always one tab away.</p>

      <h2>Good to know</h2>
      <p><strong>Temperature is the only non-linear conversion.</strong> Length, weight, and volume are all simple multiplication (1 inch is always 2.54 cm). Temperature requires both multiplication and addition because Fahrenheit and Celsius have different zero points. The formula is F = (C x 9/5) + 32. Kelvin is simpler: K = C + 273.15.</p>
      <p><strong>Digital storage has two standards.</strong> In the SI (decimal) system, 1 GB = 1,000 MB. In the binary (IEC) system used by operating systems, 1 GiB = 1,024 MiB. This is why a "500 GB" hard drive shows as ~465 GB in your file manager. This converter uses binary (1,024-based) values, which matches what your OS reports.</p>
      <p><strong>Fluid ounces and weight ounces are different units.</strong> A fluid ounce measures volume; a weight ounce measures mass. They happen to be close for water (1 fl oz of water weighs about 1 oz), but for other liquids the numbers diverge. Make sure you're converting the right type.</p>
      <p><strong>Bidirectional editing saves time.</strong> You don't need to swap "from" and "to" fields. Just type in whichever field you have the value for and the other field updates. This is faster than most converter tools that force a one-directional flow.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Factor</th></tr></thead>
        <tbody>
          <tr><td>1 inch</td><td>centimeters</td><td>2.54 cm</td></tr>
          <tr><td>1 foot</td><td>meters</td><td>0.3048 m</td></tr>
          <tr><td>1 mile</td><td>kilometers</td><td>1.60934 km</td></tr>
          <tr><td>1 pound</td><td>kilograms</td><td>0.45359 kg</td></tr>
          <tr><td>1 ounce</td><td>grams</td><td>28.3495 g</td></tr>
          <tr><td>1 gallon</td><td>liters</td><td>3.78541 L</td></tr>
          <tr><td>1 cup</td><td>milliliters</td><td>236.588 mL</td></tr>
          <tr><td>0 &deg;C</td><td>Fahrenheit</td><td>32 &deg;F</td></tr>
          <tr><td>1 GB</td><td>megabytes</td><td>1,024 MB</td></tr>
        </tbody>
      </table>
    `,
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
      'Free URL encoder and decoder. Encode special characters or decode URL-encoded strings. Supports encodeURI and encodeURIComponent modes. Browser-based, no signup.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're building a URL with query parameters and one of the values contains an ampersand, a space, or a non-English character. Without encoding, the URL breaks — the browser interprets that <code>&</code> as a parameter separator, the space terminates the URL, and the Unicode character gets mangled. Percent-encoding makes every character URL-safe so the full value arrives intact on the server side.</p>
      <p>Decoding is the mirror scenario. You're reading server logs or inspecting a redirect URL and it's full of <code>%20</code>, <code>%3D</code>, and <code>%26</code>. Paste the encoded string here to see the human-readable version. This comes up constantly when debugging OAuth callbacks, tracking parameters, and deep links.</p>
      <p>URL encoding (formally "percent-encoding" per RFC 3986) replaces unsafe characters with a <code>%</code> followed by two hex digits representing the character's byte value. A space becomes <code>%20</code>, an ampersand becomes <code>%26</code>, and a multi-byte emoji like a flag might become six or more percent-encoded bytes.</p>

      <h2>Good to know</h2>
      <p><strong><code>encodeURIComponent</code> vs. <code>encodeURI</code> — they're not interchangeable.</strong> <code>encodeURIComponent()</code> encodes almost everything except <code>A-Z a-z 0-9 - _ . ! ~ * ' ( )</code>. Use it for individual query string values. <code>encodeURI()</code> leaves URL-structural characters like <code>: / ? # [ ] @</code> alone, so it's safe for encoding a complete URL without destroying its structure. Using the wrong one is a top-5 URL bug.</p>
      <p><strong>Spaces can be <code>%20</code> or <code>+</code> — and it matters which.</strong> In URL query strings (the <code>application/x-www-form-urlencoded</code> format used by HTML forms), spaces are encoded as <code>+</code>. In the path segment and everywhere else in a URI, spaces are <code>%20</code>. JavaScript's <code>encodeURIComponent</code> always produces <code>%20</code>. If you need <code>+</code> for form data, you'll need to post-process.</p>
      <p><strong>Double-encoding is a silent data corrupter.</strong> If a value is already encoded and you encode it again, <code>%20</code> becomes <code>%2520</code>. The server decodes it once and gets the literal string "%20" instead of a space. Always check whether your input is already encoded before running it through an encoder.</p>
      <p><strong>Power user tip: RFC 3986 defines "unreserved" characters that never need encoding.</strong> These are <code>A-Z a-z 0-9 - . _ ~</code>. Everything else is either "reserved" (has structural meaning in URIs) or must be percent-encoded. Knowing this list saves you from over-encoding.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Character</th><th>Encoded</th><th>Why it needs encoding</th></tr></thead>
        <tbody>
          <tr><td>(space)</td><td>%20</td><td>Terminates URLs in many contexts</td></tr>
          <tr><td>&</td><td>%26</td><td>Separates query parameters</td></tr>
          <tr><td>=</td><td>%3D</td><td>Separates key from value in query strings</td></tr>
          <tr><td>?</td><td>%3F</td><td>Marks the start of the query string</td></tr>
          <tr><td>#</td><td>%23</td><td>Marks the start of the fragment</td></tr>
          <tr><td>/</td><td>%2F</td><td>Path separator (encode only inside values)</td></tr>
          <tr><td>@</td><td>%40</td><td>Used in userinfo (user@host)</td></tr>
          <tr><td>+</td><td>%2B</td><td>Interpreted as space in form data</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free countdown timer with sound alert. Set hours, minutes, and seconds with quick presets. Page title shows countdown so you can see time in your browser tab.',
    seoContent: `
      <h2>When to use this</h2>
      <p>The pasta needs exactly 8 minutes. Your presentation slot is 15 minutes and you need to know when to wrap up. You're doing interval training and need 45-second work periods with 15-second rest. A countdown timer is one of the simplest tools that exists — and one of the most universally useful.</p>
      <p>This timer lives in your browser tab, which means it works alongside whatever else you're doing. The tab title updates with the remaining time, so you can glance at your taskbar without switching windows. When time's up, you'll hear it — even if the tab is buried behind twelve others.</p>

      <h2>Good to know</h2>
      <p><strong>The tab title is your status bar.</strong> While the timer runs, your browser tab shows "05:23 — Timer" (or whatever's remaining). This means you never need to switch back to check — just glance at your taskbar or tab bar.</p>
      <p><strong>It works in background tabs.</strong> Modern browsers throttle JavaScript in inactive tabs, but this timer compensates by calculating elapsed time from timestamps rather than relying on setInterval accuracy. The display might update less frequently in the background, but the alarm fires on time.</p>
      <p><strong>Quick presets eliminate typing.</strong> The most common timer durations (1, 3, 5, 10, 15, 25, 30 minutes, 1 hour) are one click away. You'll use these 90% of the time. Custom hours/minutes/seconds input is there for everything else.</p>
      <p><strong>25 minutes is the Pomodoro default.</strong> If you're timing a focus session, the dedicated Pomodoro timer handles work/break cycling automatically. Use this plain timer when you just need a one-off countdown without the structure.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Activity</th><th>Typical Duration</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Soft-boiled egg</td><td>6–7 min</td><td>From boiling water</td></tr>
          <tr><td>Pasta (al dente)</td><td>8–10 min</td><td>Check package instructions</td></tr>
          <tr><td>Power nap</td><td>20 min</td><td>Longer risks grogginess</td></tr>
          <tr><td>Pomodoro session</td><td>25 min</td><td>Standard focus block</td></tr>
          <tr><td>Presentation practice</td><td>5–15 min</td><td>Match your time slot</td></tr>
          <tr><td>HIIT interval</td><td>30–45 sec</td><td>Work period</td></tr>
          <tr><td>Meditation</td><td>10–20 min</td><td>Start short, build up</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You're timing laps at the track and need to compare splits. You're running a science experiment and need precise elapsed time. You're a coach timing relay legs, or a debater tracking speaking time, or a game master managing turns. Anywhere you need to measure how long something takes — with the ability to mark intermediate points — a stopwatch with lap recording is the tool.</p>
      <p>The lap feature is what separates a stopwatch from a timer. Recording splits lets you see not just total time, but pacing — are your laps getting faster or slower? The automatic green/red highlighting on fastest and slowest laps gives you that answer at a glance.</p>

      <h2>Good to know</h2>
      <p><strong>Hundredths-of-a-second precision.</strong> The display updates at 60fps using requestAnimationFrame, giving you smooth, responsive time reading. For practical purposes, human reaction time to press the lap button adds ~150-300ms of variance, so the display precision exceeds your input precision.</p>
      <p><strong>Fastest and slowest laps are auto-highlighted.</strong> Green marks your best split, red marks your worst. After 3+ laps, this instantly shows whether you're fading or accelerating — no mental math needed.</p>
      <p><strong>Lap time vs. split time.</strong> Lap time is the duration of that individual segment. Split time (cumulative) is the total elapsed time at that point. Both are useful — lap time for pacing, split time for overall progress.</p>
      <p><strong>Copy all laps as text.</strong> One click exports your entire lap history as plain text for pasting into a spreadsheet, training log, or lab notebook. Much faster than writing times down by hand.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Use Case</th><th>What to Track</th><th>Typical Precision Needed</th></tr></thead>
        <tbody>
          <tr><td>Track/running laps</td><td>Lap splits, pacing</td><td>Seconds</td></tr>
          <tr><td>Swimming intervals</td><td>Lap time per length</td><td>Tenths</td></tr>
          <tr><td>Lab experiments</td><td>Reaction time, elapsed</td><td>Seconds</td></tr>
          <tr><td>Cooking stages</td><td>Phase duration</td><td>Minutes</td></tr>
          <tr><td>Debate/speech timing</td><td>Speaker duration</td><td>Seconds</td></tr>
          <tr><td>Board game turns</td><td>Per-player time</td><td>Seconds</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free Pomodoro timer. Customize focus sessions and break lengths. Sound alerts, session tracking, and auto-start. Boost productivity with proven technique.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have a task you've been avoiding all week. You know you should start, but the scope feels overwhelming. The Pomodoro Technique's genius isn't the timer — it's the reframing. You're not committing to finishing the task. You're committing to 25 minutes. That's it. Anyone can do 25 minutes.</p>
      <p>It works because sustained attention is a finite resource. Research in cognitive psychology consistently shows that focus degrades after 20-40 minutes of uninterrupted mental effort. The 25/5 work/break cycle keeps you in the high-performance zone rather than grinding through diminishing returns. The breaks aren't wasted time — they're when your brain consolidates what you just worked on.</p>
      <p>The technique was developed by Francesco Cirillo in the late 1980s, named after the tomato-shaped kitchen timer he used as a university student. It's since become one of the most widely adopted productivity methods in the world, particularly among developers, writers, and students.</p>

      <h2>Good to know</h2>
      <p><strong>25 minutes isn't sacred.</strong> The original technique prescribes 25-minute focus blocks, but research suggests optimal focus duration varies by person and task. Writing and design often benefit from longer 45-50 minute blocks. Repetitive tasks do well at 25. Experiment — the principle (focused work + deliberate rest) matters more than the specific numbers.</p>
      <p><strong>The break is mandatory, not optional.</strong> Skipping breaks to "stay in flow" defeats the purpose. The break prevents the gradual attention degradation that makes hour 3 of continuous work dramatically less productive than hour 1. Stand up, stretch, look at something far away. Don't check email — that's a different kind of work, not rest.</p>
      <p><strong>Four pomodoros, then a long break.</strong> After four focus sessions, take a 15-30 minute break. This cycle (about 2.5 hours of focused work) maps well to a productive morning or afternoon. Most people find 6-8 pomodoros is a realistic daily maximum for deep work.</p>
      <p><strong>Track your completed sessions.</strong> Counting pomodoros gives you an objective measure of focused work. "I did 6 pomodoros today" is more honest and useful than "I worked for 8 hours" — because it counts only the time you were actually focused.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Task Type</th><th>Focus Length</th><th>Short Break</th><th>Long Break</th></tr></thead>
        <tbody>
          <tr><td>Writing / content creation</td><td>45–50 min</td><td>10 min</td><td>20–30 min</td></tr>
          <tr><td>Programming / debugging</td><td>25–30 min</td><td>5 min</td><td>15–20 min</td></tr>
          <tr><td>Studying / reading</td><td>25 min</td><td>5 min</td><td>15 min</td></tr>
          <tr><td>Email / admin tasks</td><td>15–25 min</td><td>3–5 min</td><td>10 min</td></tr>
          <tr><td>Creative brainstorming</td><td>20–25 min</td><td>5 min</td><td>15 min</td></tr>
          <tr><td>Data entry / repetitive</td><td>25 min</td><td>5 min</td><td>15 min</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free age calculator. Enter your birth date to find exact age in years, months, days, and hours. Shows next birthday, zodiac sign, and generation. No signup.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You need your exact age for a visa application and the form wants years, months, and days — not just the year you were born. Or you're enrolling a child in school and the cutoff is "must be 5 by September 1st," and you need to verify down to the day. Maybe you're checking whether you qualify for Medicare (65), full Social Security benefits (66–67 depending on birth year), or a senior discount (varies by business). Legal and administrative thresholds are surprisingly precise.</p>
      <p>Beyond paperwork, this calculator is useful for milestone tracking. How many days have you been alive? What day of the week were you born? How many days until your next birthday? It answers the questions that are simple to ask but surprisingly annoying to calculate by hand — especially when months have different lengths and leap years get involved.</p>
      <p>Parents use it to track a child's exact age in months (pediatricians ask this constantly for the first few years). Genealogy researchers use it to calculate ancestors' ages from historical records. And sometimes you just want to settle a debate about whether you're technically still 34 or already 35.</p>

      <h2>Good to know</h2>
      <p><strong>Age calculation isn't as simple as subtraction.</strong> If you were born on March 15 and today is February 10, you're not just "this year minus birth year." The calculator handles month and day boundaries correctly, which matters when precision counts.</p>
      <p><strong>Leap year birthdays create an edge case.</strong> If you were born on February 29, your "birthday" technically only occurs every four years. Most legal systems treat March 1 as your birthday in non-leap years, but some jurisdictions use February 28. This calculator shows both your actual and legal age.</p>
      <p><strong>Generational cutoffs are approximate.</strong> There's no official governing body that defines when Gen Z ends and Gen Alpha begins. The ranges used here follow the Pew Research Center definitions, which are the most widely cited: Boomers (1946–1964), Gen X (1965–1980), Millennials (1981–1996), Gen Z (1997–2012), Gen Alpha (2013+).</p>
      <p><strong>Your zodiac sign depends on the year, not just the date range.</strong> The Western zodiac dates shift slightly year to year because the Earth's orbit isn't exactly 365.25 days. If you're born on a cusp date, the sign shown here uses the standard date ranges, which are accurate for the vast majority of people.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Milestone</th><th>Age</th><th>Why It Matters</th></tr></thead>
        <tbody>
          <tr><td>Driving (US)</td><td>16</td><td>Learner's permit in most states</td></tr>
          <tr><td>Voting / Legal adult</td><td>18</td><td>Federal voting age, sign contracts</td></tr>
          <tr><td>Drinking (US)</td><td>21</td><td>Legal purchase of alcohol</td></tr>
          <tr><td>Car rental (standard)</td><td>25</td><td>No young-driver surcharge</td></tr>
          <tr><td>Run for US President</td><td>35</td><td>Constitutional minimum</td></tr>
          <tr><td>Catch-up 401(k)</td><td>50</td><td>Extra $7,500/year contribution allowed</td></tr>
          <tr><td>Early Social Security</td><td>62</td><td>Reduced benefits available</td></tr>
          <tr><td>Medicare eligible</td><td>65</td><td>Federal health insurance</td></tr>
          <tr><td>Full Social Security</td><td>66–67</td><td>Depends on birth year</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Date Difference Calculator — Days Between | clevr.tools',
    metaDescription: 'Free date difference calculator. Find the exact number of days, weeks, months, and business days between any two dates. Includes weekday count and weekend count.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Your lease ends on August 14 and you need to know exactly how many days you have to find a new place. A contract specifies "delivery within 90 business days" and you need to pin down the actual calendar date. You're planning a trip and want to know if 17 days is enough to do everything you have in mind. Date math sounds trivial until you try to account for months with different lengths, leap years, and weekends.</p>
      <p>Project managers use this constantly — estimating sprints, calculating buffer time, and converting between calendar days and business days. HR departments need it for probation periods, benefits eligibility dates, and FMLA calculations. Real estate closings, legal filing deadlines, and insurance waiting periods all hinge on precise day counts.</p>
      <p>It's also the quick answer to casual questions: how many days until Christmas, how long until summer break, or how many weekends are left before a deadline. The business-day count is especially useful because manually counting while skipping Saturdays and Sundays is tedious and error-prone.</p>

      <h2>Good to know</h2>
      <p><strong>Business days and calendar days diverge fast.</strong> A 30-calendar-day window contains only about 22 business days. Over 90 calendar days, you lose roughly 26 days to weekends. If a deadline is in "business days," always convert to calendar days so you don't underestimate the timeline.</p>
      <p><strong>This calculator does not account for public holidays.</strong> Business days here means weekdays (Monday–Friday). Federal holidays, state holidays, and company-specific closures aren't subtracted because they vary by location and employer. For precise SLA or legal deadline calculations, subtract holidays manually from the business day count.</p>
      <p><strong>"Inclusive" vs. "exclusive" counting matters.</strong> If an event starts on January 1 and ends on January 31, is that 30 days or 31? It depends on whether you count the start date. This calculator uses exclusive counting (the standard for durations) — January 1 to January 31 = 30 days. Legal and medical contexts sometimes use inclusive counting, so verify which convention applies.</p>
      <p><strong>Months are not equal units.</strong> "Three months from January 31" could be April 30 or May 1 depending on interpretation, because February has fewer days. This calculator handles month math by adjusting to the last valid day of the target month when needed.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Duration</th><th>Calendar Days</th><th>Business Days (approx.)</th></tr></thead>
        <tbody>
          <tr><td>1 week</td><td>7</td><td>5</td></tr>
          <tr><td>2 weeks</td><td>14</td><td>10</td></tr>
          <tr><td>1 month</td><td>28–31</td><td>20–23</td></tr>
          <tr><td>90 days</td><td>90</td><td>~64</td></tr>
          <tr><td>6 months</td><td>181–184</td><td>~130</td></tr>
          <tr><td>1 year</td><td>365 (366 leap)</td><td>~261</td></tr>
          <tr><td>Common notice period</td><td>30 days</td><td>~22</td></tr>
          <tr><td>Typical probation</td><td>90 days</td><td>~64</td></tr>
        </tbody>
      </table>
    `,
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
    metaDescription: 'Free UUID generator. Create UUID v4 (random) or v7 (timestamp) identifiers. Bulk generate up to 100 at once. Uppercase, lowercase, and no-hyphens formats.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're spinning up a new database table and need primary keys that won't collide across servers, regions, or even completely independent systems — without any coordination. That's the entire point of UUIDs. Generate one anywhere, anytime, and you can be statistically certain it's unique across every UUID ever created. No central registry, no auto-increment sequence to manage, no distributed lock.</p>
      <p>Beyond database keys, UUIDs show up as request IDs for distributed tracing (attach one to every API call and follow it through your logs), idempotency keys for payment APIs (Stripe requires one), file names that won't collide in object storage, and session tokens. Any time you need a unique identifier that doesn't leak information about your system's internals (unlike sequential IDs), a UUID is the standard answer.</p>
      <p>Need a batch? The bulk generator creates up to 100 UUIDs at once — useful for seeding test data, pre-generating IDs for a migration script, or populating a staging database.</p>

      <h2>Good to know</h2>
      <p><strong>v4 is random. v7 is time-sorted. Pick based on your use case.</strong> UUID v4 (RFC 9562) is 122 bits of pure randomness — great for general-purpose unique IDs. UUID v7 embeds a Unix timestamp in the first 48 bits, making them sort chronologically. If you're using UUIDs as database primary keys, v7 is the better choice — it avoids the random-write performance problem that v4 causes in B-tree indexes.</p>
      <p><strong>The collision probability is vanishingly small.</strong> With 122 random bits, you'd need to generate about 2.7 x 10^18 (2.7 quintillion) v4 UUIDs before hitting a 50% chance of a single collision. For practical purposes, it won't happen. The odds of a collision in a billion UUIDs are about 1 in 10^21.</p>
      <p><strong>UUID vs. GUID — same thing, different name.</strong> Microsoft calls them GUIDs (Globally Unique Identifiers), everyone else calls them UUIDs. The format is identical: 32 hex digits in 8-4-4-4-12 grouping. If a system asks for a GUID, generate a UUID.</p>
      <p><strong>Power user tip: the version and variant bits are fixed positions.</strong> In <code>xxxxxxxx-xxxx-<strong>4</strong>xxx-<strong>a</strong>xxx-xxxxxxxxxxxx</code>, the "4" is the version nibble (always 4 for v4, 7 for v7) and the leading bits of the next group set the variant to RFC 9562. This means not all 128 bits are random — v4 has 122 random bits, and v7 has 74 random bits plus a 48-bit timestamp. Knowing this matters when calculating collision probabilities.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>UUID Version</th><th>Based On</th><th>Sortable?</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>v1</td><td>Timestamp + MAC address</td><td>Yes (with caveats)</td><td>Legacy systems (leaks hardware info)</td></tr>
          <tr><td>v4</td><td>Random</td><td>No</td><td>General-purpose unique IDs</td></tr>
          <tr><td>v5</td><td>SHA-1 hash of namespace + name</td><td>No</td><td>Deterministic IDs from known inputs</td></tr>
          <tr><td>v7</td><td>Unix timestamp + random</td><td>Yes</td><td>Database primary keys, time-ordered IDs</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You step on a scale at the doctor's office and hear the number, but a number without context is meaningless. BMI exists to give that weight a rough frame of reference — it compares your weight to your height and places the result on a standardized scale used by clinicians worldwide. If you are curious where you fall on that scale before an appointment, or tracking changes over months of lifestyle adjustments, this calculator gives you an instant answer in both imperial and metric units.</p>
      <p>BMI is also commonly requested on health insurance applications, military and law enforcement fitness screenings, and certain employment physicals. If a form asks for your BMI and you do not have it memorized, plug in your height and weight here and you will have it in seconds. It is faster than doing the math manually (weight in kg divided by height in meters squared) and eliminates unit-conversion errors.</p>
      <p>That said, BMI is a population-level screening tool, not a diagnosis. It cannot distinguish between muscle and fat, does not account for bone density, and was originally designed using data from European populations. A bodybuilder and a sedentary person of the same height and weight will get the same BMI. If your result surprises you — in either direction — talk to a healthcare provider who can assess body composition, waist circumference, blood markers, and the full picture that a single number cannot capture.</p>

      <h2>Good to know</h2>
      <p><strong>The formula is simple but the interpretation is not.</strong> BMI equals weight in kilograms divided by height in meters squared (kg/m²). The math is straightforward, but the WHO category boundaries — 18.5, 25, 30 — are statistical thresholds, not cliff edges. A BMI of 24.9 and 25.1 are clinically almost identical, even though they fall in different categories.</p>
      <p><strong>Athletes routinely score "overweight" or "obese."</strong> Muscle is denser than fat. Rugby players, powerlifters, and even recreational CrossFitters often have BMIs above 25 while carrying very little body fat. If you train with weights regularly, BMI alone is not a useful health metric for you — consider a body fat percentage measurement instead.</p>
      <p><strong>BMI underestimates risk in some groups.</strong> Research shows that people of South Asian descent may face elevated metabolic risk at BMIs below 25, leading some health organizations to use lower thresholds for those populations. Age also matters — older adults tend to lose muscle mass, so a "normal" BMI may mask a higher body fat percentage.</p>
      <p><strong>Children and teens use a different system.</strong> Pediatric BMI is expressed as a percentile relative to age and sex rather than the fixed adult categories. This calculator uses the adult formula, so it is not appropriate for anyone under 18.</p>
      <p><strong>It is one data point, not a verdict.</strong> BMI correlates with health outcomes at a population level, but individual health depends on dozens of factors: blood pressure, cholesterol, blood sugar, fitness level, sleep, stress, and genetics. Use BMI as a starting point for a conversation with your doctor, not as the final word.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>BMI Range</th><th>WHO Category</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Below 16.0</td><td>Severe Underweight</td><td>Medical attention recommended</td></tr>
          <tr><td>16.0 – 16.9</td><td>Moderate Underweight</td><td>May indicate nutritional deficiency</td></tr>
          <tr><td>17.0 – 18.4</td><td>Mild Underweight</td><td>Monitor trends over time</td></tr>
          <tr><td>18.5 – 24.9</td><td>Normal Weight</td><td>Statistically lowest health risk</td></tr>
          <tr><td>25.0 – 29.9</td><td>Overweight</td><td>Risk depends on other factors</td></tr>
          <tr><td>30.0 – 34.9</td><td>Obese Class I</td><td>Increased metabolic risk</td></tr>
          <tr><td>35.0 – 39.9</td><td>Obese Class II</td><td>Significantly increased risk</td></tr>
          <tr><td>40.0 and above</td><td>Obese Class III</td><td>Highest risk category</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Mortgage Calculator — Monthly Payment Free | clevr.tools',
    metaDescription: 'Free mortgage calculator. Estimate monthly mortgage payments including principal, interest, property tax, insurance, and PMI. View full amortization schedule.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You found a house listed at $425,000 and you need to know what you'd actually pay each month. Not the sticker price — the real number, with taxes, insurance, and PMI factored in. That's the calculation that determines whether a home is affordable or aspirational.</p>
      <p>Mortgage calculators are also essential for comparing scenarios. What happens if you put 10% down instead of 20%? How much does a 0.5% rate difference cost over 30 years? What if you choose a 15-year term instead of 30? The monthly payment is just the starting point — the total interest paid is where the real surprises are.</p>
      <p>Run the numbers before you talk to a lender. Walking into a pre-approval meeting with a clear picture of your budget puts you in a stronger position — and prevents you from being steered toward the maximum loan amount you qualify for rather than the amount you're comfortable with.</p>

      <h2>Good to know</h2>
      <p><strong>In year 1, most of your payment is interest.</strong> On a $350,000 loan at 6.5%, your monthly payment is ~$2,212. In the first month, $1,896 goes to interest and only $316 goes to principal. By year 20, it flips — $1,650 to principal and $562 to interest. This is how amortization works, and it's why extra payments early in the loan save far more than extra payments later.</p>
      <p><strong>PMI disappears at 20% equity.</strong> If your down payment is less than 20%, lenders require Private Mortgage Insurance — typically 0.5–1% of the loan amount per year. On a $350,000 loan, that's $145–$290/month added to your payment. It drops off once you've built 20% equity, either through payments or appreciation.</p>
      <p><strong>A 15-year mortgage isn't double the payment.</strong> Halving the term roughly increases the monthly payment by 40-50%, not 100%. But you'll pay dramatically less total interest. A $350,000 loan at 6.5% costs $446,000 in interest over 30 years but only $196,000 over 15 years — a $250,000 difference.</p>
      <p><strong>Property tax varies wildly by location.</strong> Texas averages 1.8% of home value annually. Hawaii averages 0.28%. On a $400,000 home, that's the difference between $600/month and $93/month in taxes alone. Always include local tax rates in your calculation.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Scenario ($350K loan, 30yr)</th><th>Rate</th><th>Monthly P&I</th><th>Total Interest</th></tr></thead>
        <tbody>
          <tr><td>Current market (high)</td><td>7.0%</td><td>$2,329</td><td>$488,281</td></tr>
          <tr><td>Recent average</td><td>6.5%</td><td>$2,212</td><td>$446,247</td></tr>
          <tr><td>Moderate rate</td><td>5.5%</td><td>$1,987</td><td>$365,460</td></tr>
          <tr><td>Low rate era</td><td>3.5%</td><td>$1,572</td><td>$215,799</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>The check arrives and six people are staring at it. Someone suggests splitting evenly, someone else only had a salad, and nobody can agree on what percentage to tip. This calculator kills the awkwardness in five seconds — enter the bill, pick the tip, set the number of people, done.</p>
      <p>It's also useful when you're dining alone and want to double-check the math. Tipping on the pre-tax total vs. post-tax total can make a meaningful difference on a $200 dinner. And delivery app "suggested tips" are often calculated on inflated totals that include fees — it's worth knowing the real number.</p>

      <h2>Good to know</h2>
      <p><strong>20% is the new 15%.</strong> US tipping norms have shifted. What was considered generous a decade ago is now the baseline for good service at sit-down restaurants. 15% signals dissatisfaction to many servers. 18% is fine, 20% is standard, 25% is generous.</p>
      <p><strong>Tip on pre-tax, not post-tax.</strong> The tip is for service, not for sales tax. On a $100 meal with 10% tax, tipping 20% on $100 ($20) vs. $110 ($22) is a small difference — but it adds up over a year of dining out.</p>
      <p><strong>Delivery tips are separate from service fees.</strong> Most delivery apps charge a "service fee" that doesn't go to the driver. The tip is the driver's primary compensation. $3–5 for short deliveries, $5–8+ for longer ones is reasonable.</p>
      <p><strong>International tipping varies dramatically.</strong> Japan considers tipping rude. Most of Europe includes service in the price (round up or leave 5–10% for exceptional service). Australia doesn't expect tips. The US and Canada are outliers where tips are a major part of server compensation.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Service</th><th>US Standard</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Sit-down restaurant</td><td>18–20%</td><td>On pre-tax total</td></tr>
          <tr><td>Bartender</td><td>$1–2/drink or 15–20%</td><td>Per drink for simple orders</td></tr>
          <tr><td>Food delivery</td><td>$3–5+ or 15–20%</td><td>Tip goes directly to driver</td></tr>
          <tr><td>Coffee / counter service</td><td>$0–1 or 0–10%</td><td>Optional, not expected</td></tr>
          <tr><td>Hair stylist</td><td>15–20%</td><td>On total service cost</td></tr>
          <tr><td>Hotel housekeeping</td><td>$2–5/night</td><td>Left daily, not at checkout</td></tr>
          <tr><td>Taxi / rideshare</td><td>15–20%</td><td>Round up for short rides</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Discount Calculator — Percent Off Free | clevr.tools',
    metaDescription: 'Free discount calculator. Find the final sale price after any percentage discount. Supports stacked discounts (e.g., 20% off + extra 10% off) and reverse calculation from sale price.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're standing in a store staring at a $249 jacket with a "40% off" sign and you want to know the actual price before you get to the register. Or an online retailer is running "25% off sitewide + extra 15% for members" and you need to know if the final price is really worth it. Maybe you found an item for $67 that was originally $89 and you want to know the discount percentage for comparison shopping. These are all the same problem: translating a percentage into real dollars.</p>
      <p>The stacked discount feature is where most people get tripped up. "20% off plus an extra 20% off" sounds like 40% off, but it's actually 36% off. The second discount applies to the already-reduced price, not the original. Retailers know this math is confusing — this calculator makes it transparent so you can see exactly what each layer of discount does to the final price.</p>
      <p>The reverse calculator solves the opposite problem: you know the original price and the sale price, and you want the percentage discount. This is useful for comparing deals across different stores where one lists the sale price and the other lists the discount percentage.</p>

      <h2>Good to know</h2>
      <p><strong>Stacked discounts are multiplicative, not additive.</strong> Two 20% discounts don't equal 40% off. The math: $100 x 0.80 x 0.80 = $64, which is 36% off. Three 10% discounts yield 27.1% off, not 30%. The gap between the "sounds like" number and the real number grows with each additional discount layer.</p>
      <p><strong>Order doesn't matter for stacked percentages.</strong> 30% off then 20% off gives the same result as 20% off then 30% off. Multiplication is commutative: 0.70 x 0.80 = 0.80 x 0.70. This only applies to percentage discounts — if one discount is a fixed dollar amount, order matters.</p>
      <p><strong>Tax applies after the discount.</strong> Sales tax is calculated on the discounted price, not the original price. A $100 item at 25% off with 8% tax costs $81.00, not $83.00. The discount saves you money on tax too.</p>
      <p><strong>"Up to X% off" means the maximum discount.</strong> Most items in the sale will be discounted less. Retailers use the highest discount in marketing but most inventory is at the lower end. Always check the actual percentage on the item you want.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Stacked Discounts</th><th>Sounds Like</th><th>Actual Total Discount</th><th>$100 Item Final Price</th></tr></thead>
        <tbody>
          <tr><td>10% + 10%</td><td>20% off</td><td>19.0% off</td><td>$81.00</td></tr>
          <tr><td>20% + 10%</td><td>30% off</td><td>28.0% off</td><td>$72.00</td></tr>
          <tr><td>20% + 20%</td><td>40% off</td><td>36.0% off</td><td>$64.00</td></tr>
          <tr><td>30% + 20%</td><td>50% off</td><td>44.0% off</td><td>$56.00</td></tr>
          <tr><td>25% + 25%</td><td>50% off</td><td>43.75% off</td><td>$56.25</td></tr>
          <tr><td>50% + 20%</td><td>70% off</td><td>60.0% off</td><td>$40.00</td></tr>
          <tr><td>30% + 20% + 10%</td><td>60% off</td><td>49.6% off</td><td>$50.40</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Compound Interest Calculator — Free Tool | clevr.tools',
    metaDescription: 'Free compound interest calculator. Enter investment, contributions, rate, and time. See final balance and growth chart. Daily, monthly, or annual compounding.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You want to know what happens if you invest $500/month for 25 years. Or you're trying to show a teenager why starting a Roth IRA at 18 instead of 30 means retiring with twice the money despite contributing less. Compound interest is the single most important concept in personal finance, and this calculator makes it visual.</p>
      <p>It's also the tool that settles debates. "Should I invest a lump sum or dollar-cost average?" "Does compounding frequency actually matter?" "How much does a 1% fee drag on returns over 30 years?" Plug in the numbers and see for yourself — the chart makes the answer obvious in a way that formulas don't.</p>
      <p>The growth chart is the key feature. Watching the gap widen between your contributions (the money you put in) and your total balance (what compounding grew it to) is the most powerful financial visualization there is.</p>

      <h2>Good to know</h2>
      <p><strong>Starting early beats investing more.</strong> $200/month from age 22 to 65 at 8% grows to ~$940,000. $400/month from age 32 to 65 (same total contributed: ~$158,000 vs ~$103,000) grows to only ~$680,000. The 10 extra years of compounding are worth more than doubling your contribution.</p>
      <p><strong>Compounding frequency barely matters.</strong> Monthly vs. daily vs. continuous compounding on a $10,000 investment at 7% over 30 years differs by less than $500. Don't let anyone sell you a product based on "daily compounding" — the edge is trivial.</p>
      <p><strong>The Rule of 72 is your mental shortcut.</strong> Divide 72 by the annual return rate to estimate how many years it takes to double your money. At 8%, money doubles every 9 years. At 6%, every 12 years. At 10%, every 7.2 years.</p>
      <p><strong>Fees compound too — in reverse.</strong> A 1% annual fee doesn't sound like much, but on a $500,000 portfolio over 30 years at 8%, it costs you roughly $300,000 in lost growth. Compound interest giveth, and compound fees taketh away.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Monthly Investment</th><th>Years</th><th>Return</th><th>Total Contributed</th><th>Final Balance</th></tr></thead>
        <tbody>
          <tr><td>$200</td><td>10</td><td>8%</td><td>$24,000</td><td>$36,589</td></tr>
          <tr><td>$200</td><td>20</td><td>8%</td><td>$48,000</td><td>$117,804</td></tr>
          <tr><td>$200</td><td>30</td><td>8%</td><td>$72,000</td><td>$298,072</td></tr>
          <tr><td>$500</td><td>20</td><td>7%</td><td>$120,000</td><td>$260,464</td></tr>
          <tr><td>$500</td><td>30</td><td>7%</td><td>$180,000</td><td>$610,729</td></tr>
          <tr><td>$1,000</td><td>30</td><td>8%</td><td>$360,000</td><td>$1,490,359</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'GPA Calculator — Semester & Cumulative | clevr.tools',
    metaDescription: 'Free GPA calculator. Add courses with credits and grades to find semester GPA. Includes cumulative GPA and Dean\'s List coding. No signup required.',
    seoContent: `
      <h2>When to use this</h2>
      <p>It's midway through the semester and you're trying to figure out what you need on your remaining finals to hit a 3.5 for Dean's List. Or you just got your grades back and want to see how this semester affects your cumulative GPA. Maybe you're applying to graduate school and need to verify your GPA calculation matches what your transcript will show. This calculator handles all of it.</p>
      <p>The semester calculator lets you enter each course with its credit hours and letter grade. The cumulative calculator takes your existing GPA and total credit hours, then adds this semester's results to project your new overall GPA. Use it to plan ahead: if you're sitting at a 3.4 cumulative with 90 credits, what does this semester need to look like to push you over 3.5?</p>
      <p>It's also useful for transfer students figuring out how their GPA translates, students considering retaking a course to replace a grade, or parents trying to understand how the GPA system works. The math is simple in concept but tedious to do by hand when you have five or six courses with different credit weights.</p>

      <h2>Good to know</h2>
      <p><strong>The formula is a weighted average: GPA = Sum(credits x grade points) / Sum(credits).</strong> A 4-credit A (4.0) contributes 16 quality points. A 3-credit B+ (3.3) contributes 9.9 quality points. Add all quality points, divide by total credits. This means a high-credit course has a bigger impact on your GPA — getting an A in a 4-credit class matters more than getting an A in a 1-credit elective.</p>
      <p><strong>Plus/minus grades make a real difference.</strong> The gap between a B+ (3.3) and a B- (2.7) is 0.6 points — in a 4-credit course, that's 2.4 quality points. Over a college career of 120+ credits, these fractional differences accumulate and can determine whether you graduate with honors or just miss the cutoff.</p>
      <p><strong>Your cumulative GPA gets harder to move over time.</strong> With 30 credits completed, one bad semester can drop your GPA significantly. With 100 credits completed, the same bad semester barely moves the needle — but it also means recovering from a low GPA takes multiple strong semesters. This is the "GPA momentum" effect that makes early performance disproportionately important.</p>
      <p><strong>Some schools use a different scale.</strong> The standard 4.0 scale is most common in the US, but some institutions cap A+ at 4.0 (same as A), while others give A+ a 4.3. This calculator uses the most common scale where A and A+ both equal 4.0.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Letter Grade</th><th>Grade Points</th><th>Typical Percentage</th></tr></thead>
        <tbody>
          <tr><td>A / A+</td><td>4.0</td><td>93–100%</td></tr>
          <tr><td>A-</td><td>3.7</td><td>90–92%</td></tr>
          <tr><td>B+</td><td>3.3</td><td>87–89%</td></tr>
          <tr><td>B</td><td>3.0</td><td>83–86%</td></tr>
          <tr><td>B-</td><td>2.7</td><td>80–82%</td></tr>
          <tr><td>C+</td><td>2.3</td><td>77–79%</td></tr>
          <tr><td>C</td><td>2.0</td><td>73–76%</td></tr>
          <tr><td>D</td><td>1.0</td><td>60–69%</td></tr>
          <tr><td>F</td><td>0.0</td><td>Below 60%</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You want to know where you actually stand. Maybe you are applying for a job that lists "60+ WPM" as a requirement. Maybe you have been practicing touch typing for a month and want to see if it is paying off. Or maybe you just got a new keyboard and want to see how it feels at speed. A typing test gives you a number you can track over time — and that number is more useful than you might think.</p>
      <p>Take the test at the start of a practice session to establish your baseline, then again at the end. Most people see a 10-15% improvement just from warming up, which tells you something important: your "true" speed is closer to your warmed-up score than your cold start. If you are preparing for a typing requirement, test yourself after a 5-minute warm-up to get the score that reflects your actual ability.</p>
      <p>Consistency matters as much as peak speed. A typist who holds a steady 65 WPM is more productive than one who spikes to 85 and crashes to 40. The performance chart shows your speed over time within the test — flat lines are better than rollercoasters.</p>

      <h2>Good to know</h2>
      <p><strong>65 WPM puts you ahead of roughly 70% of typists.</strong> Most people overestimate the average. The true average for adults is around 40 WPM. If you hit 50, you are already above average. At 65, you are faster than most office workers. At 80+, you are in professional territory. Do not feel bad about a "low" score — the bar is lower than the internet makes it seem.</p>
      <p><strong>Accuracy is the speed multiplier.</strong> Backspacing to fix errors costs roughly 2x the time of typing the character correctly. A typist at 60 WPM with 98% accuracy produces more correct text per minute than one at 75 WPM with 90% accuracy. If you want to get faster, get more accurate first — the speed follows.</p>
      <p><strong>The home row is not optional.</strong> Hunt-and-peck typists hit a hard ceiling around 35-40 WPM because their eyes become the bottleneck. Touch typing (fingers on ASDF JKL;, each finger responsible for a column of keys) removes that ceiling entirely. The transition is painful for about two weeks, then your speed starts climbing past where it was before.</p>
      <p><strong>Short sessions beat long ones.</strong> Fifteen minutes of focused practice daily improves speed faster than a two-hour marathon once a week. Your fingers build muscle memory through repetition across days, not within a single session. Set a daily reminder, do three tests, and move on.</p>
      <p><strong>Your keyboard matters (a little).</strong> Mechanical keyboards with tactile switches tend to produce slightly higher speeds than mushy membrane boards, mostly because the tactile feedback helps your fingers confirm key presses without bottoming out. But technique matters 10x more than hardware — do not blame the keyboard.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>WPM Range</th><th>Percentile (approx.)</th><th>Typical profile</th></tr></thead>
        <tbody>
          <tr><td>20-30</td><td>Bottom 20%</td><td>Beginner or hunt-and-peck typist</td></tr>
          <tr><td>30-40</td><td>30th-45th</td><td>Average adult, casual computer user</td></tr>
          <tr><td>40-55</td><td>45th-65th</td><td>Regular computer user, most students</td></tr>
          <tr><td>55-70</td><td>65th-80th</td><td>Solid office worker, intermediate touch typist</td></tr>
          <tr><td>70-85</td><td>80th-90th</td><td>Experienced typist, programmer</td></tr>
          <tr><td>85-100</td><td>90th-96th</td><td>Professional typist, transcriptionist</td></tr>
          <tr><td>100-120</td><td>96th-99th</td><td>Advanced typist, competitive level</td></tr>
          <tr><td>120+</td><td>Top 1%</td><td>Competitive typist, stenographer-level</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['word-counter', 'character-counter', 'stopwatch'],
    badge: 'popular',
  },
  {
    slug: 'wpm-test',
    name: 'WPM Test',
    shortDescription: 'Measure your typing speed in 60 seconds.',
    category: 'type',
    route: '/type/wpm-test',
    acceptedFormats: [],
    icon: 'Gauge',
    metaTitle: 'WPM Test — Check Your Typing Speed | clevr.tools',
    metaDescription: 'Free online WPM typing test. Find out how fast you type in 60 seconds with our clean, distraction-free speed test.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You want a quick, no-nonsense speed check. This is a 60-second sprint — start typing and get your WPM when the clock runs out. No settings to fiddle with, no modes to choose. Just you, a passage, and one minute on the clock.</p>
      <p>Use it to benchmark yourself before and after a practice session, to settle a friendly bet about who types faster, or to check whether you hit the WPM requirement for a job posting. The 60-second format is the industry standard for typing speed assessments — it is long enough to be meaningful but short enough that you can take it three times in a row and track your improvement.</p>
      <p>It is also a surprisingly effective warm-up. Take one WPM test before a long writing session and your fingers will be primed for the next hour. Think of it as stretching before a run.</p>

      <h2>Good to know</h2>
      <p><strong>Net WPM is the only number that matters.</strong> Gross WPM counts everything you typed. Net WPM subtracts your errors. If you type 80 gross WPM but make 15 errors per minute, your net WPM is 65. This test reports Net WPM because it reflects how much correct text you actually produce — which is what employers, schools, and certification exams care about.</p>
      <p><strong>One word = 5 characters.</strong> This is not arbitrary. The 5-character standard (including spaces) normalizes scores across different texts. Typing "I am" counts the same as typing "comp" because both are 4 characters toward the next "word." This means your score is comparable regardless of whether the passage uses short or long words.</p>
      <p><strong>Your first test of the day is not your real speed.</strong> Cold fingers, cold brain. Most typists are 10-15% slower on their first attempt than their third. If you are testing for a job application, do two warm-up rounds first and submit the third.</p>
      <p><strong>Plateau? Change your practice, not your effort.</strong> If you have been stuck at the same WPM for weeks, you are probably practicing what you are already good at. Target your weak spots: words with uncommon letter pairs (like "rhythm" or "queue"), numbers and punctuation, or capital letters. Deliberate practice on weaknesses breaks plateaus faster than grinding more of the same.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>WPM</th><th>What it means</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>Under 30</td><td>Below average</td><td>Likely a hunt-and-peck typist — learning touch typing would unlock major gains</td></tr>
          <tr><td>30-45</td><td>Average</td><td>Typical adult speed, enough for casual use</td></tr>
          <tr><td>45-60</td><td>Above average</td><td>Standard office worker range, meets most job requirements</td></tr>
          <tr><td>60-80</td><td>Fast</td><td>Programmer, writer, or experienced office worker</td></tr>
          <tr><td>80-100</td><td>Professional</td><td>Transcriptionist, court reporter trainee, data entry specialist</td></tr>
          <tr><td>100-120</td><td>Elite</td><td>Competitive typist or highly experienced professional</td></tr>
          <tr><td>120+</td><td>Exceptional</td><td>Competition-level speed, top 1% of all typists worldwide</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['typing-test', 'typing-practice', 'keyboard-tester'],
    badge: 'popular' as const,
    live: true,
  },
  {
    slug: 'keyboard-tester',
    name: 'Keyboard Tester',
    shortDescription: 'Press any key to verify it registers correctly.',
    category: 'type',
    route: '/type/keyboard-tester',
    acceptedFormats: [],
    icon: 'Keyboard',
    metaTitle: 'Keyboard Tester — Test Every Key Online | clevr.tools',
    metaDescription: 'Free online keyboard tester. Press any key to check it works. See key code, event details, and track which keys have been tested.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>Just unboxed a new mechanical keyboard? This is the first thing to open. Press every single key and watch it light up on the virtual layout — if a key does not register, you know before the return window closes. It is the fastest way to confirm that every switch is working and nothing got damaged in shipping.</p>
      <p>The Keyboard Tester is equally useful for diagnosing problems on a keyboard you have been using for a while. Spilled coffee and worried about dead keys? Noticing double-typed characters (chattering)? Suspicious that your Ctrl+Shift+Z shortcut keeps dropping inputs? Fire up the tester and press the suspect keys — you will see exactly what the browser receives. Gamers use it to verify N-key rollover (NKRO) by holding down multiple keys simultaneously and confirming every one registers.</p>
      <p>It is also a surprisingly handy tool for developers. You can see the exact event.key, event.code, and legacy keyCode values for any key press, which is invaluable when building keyboard shortcuts or custom key bindings in your applications.</p>

      <h2>Good to Know</h2>
      <p><strong>Ghosting vs. rollover matters for gaming.</strong> Ghosting is when pressing three or more keys simultaneously causes a phantom fourth key to register. N-key rollover (NKRO) keyboards let you press every key at once without ghosting. Most gaming keyboards offer NKRO over USB; cheaper membrane boards often limit you to 6-key rollover (6KRO).</p>
      <p><strong>Chattering means a switch is failing.</strong> If you press a key once and it registers two or three times, the switch contacts are bouncing. On mechanical keyboards, this can sometimes be fixed by adjusting debounce settings in firmware. On membrane keyboards, it usually means the board is wearing out.</p>
      <p><strong>event.code is layout-independent.</strong> It always reflects the physical key position, so "KeyA" is the same physical key whether you use QWERTY, Dvorak, or AZERTY. This is the value developers should use for game controls and keyboard shortcuts.</p>
      <p><strong>Some keys are browser-restricted.</strong> Certain keys like PrintScreen, the Windows/Super key, and some function keys may be intercepted by the operating system before the browser sees them. If a key does not register here, it may still work fine in native applications.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Switch Type</th><th>Feel</th><th>Actuation Force</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>Linear (Red)</td><td>Smooth, no bump</td><td>~45g</td><td>Gaming, speed typing</td></tr>
          <tr><td>Tactile (Brown)</td><td>Bump, no click</td><td>~55g</td><td>All-purpose typing and coding</td></tr>
          <tr><td>Clicky (Blue)</td><td>Bump + audible click</td><td>~60g</td><td>Typing enthusiasts (loud!)</td></tr>
          <tr><td>Membrane</td><td>Mushy, quiet</td><td>~55g</td><td>Budget boards, quiet offices</td></tr>
          <tr><td>Topre</td><td>Smooth thock</td><td>~45g</td><td>Premium typing experience</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['typing-test', 'wpm-test', 'typing-practice'],
    live: true,
  },
  {
    slug: 'typing-practice',
    name: 'Typing Practice',
    shortDescription: 'Structured typing lessons with per-key performance tracking.',
    category: 'type',
    route: '/type/typing-practice',
    acceptedFormats: [],
    icon: 'BookOpen',
    metaTitle: 'Typing Practice — Improve Your Typing Skills | clevr.tools',
    metaDescription: 'Free typing practice with lessons for common words, programming syntax, and more. Track per-key accuracy with a keyboard heatmap.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>Typing Practice is your training ground — the place where you build the fundamentals that make every other typing tool on this site easier. Whether you are learning to touch type for the first time, retraining bad habits like looking at the keyboard, or drilling weak keys that keep tripping you up, structured practice is the fastest path to real improvement.</p>
      <p>Use this when you want deliberate, focused training rather than just a speed test. The per-key accuracy heatmap shows you exactly which keys are slowing you down, so you can target your weakest links instead of just grinding the same words over and over. Most people discover they have two or three problem keys that account for the majority of their errors — fixing those keys alone can boost overall WPM by 10-15%.</p>
      <p>It is also the ideal warm-up tool. Professional typists and competitive speed typers rarely jump straight into a test cold — they run a few minutes of practice first to get their fingers loose and their brain in typing mode. Think of it like stretching before a run.</p>

      <h2>Good to Know</h2>
      <p><strong>Home row is everything.</strong> Your fingers should rest on ASDF (left) and JKL; (right). Every key on the keyboard is assigned to a specific finger, and returning to home row between words is what makes touch typing work. If you are still looking at the keyboard, start with home row drills only — speed comes later.</p>
      <p><strong>Accuracy first, speed second.</strong> Practicing at 30 WPM with 98% accuracy builds better muscle memory than 50 WPM with 85% accuracy. Your brain reinforces whatever you repeat, including mistakes. Slow down until errors drop below 3%, then gradually push faster.</p>
      <p><strong>The heatmap reveals your bottlenecks.</strong> Red keys are the ones you miss most often. Drill those specific keys until they cool down to green. Common trouble spots include P, Q, Z, and the semicolon — keys that require pinky stretches most people rarely practice.</p>
      <p><strong>15 minutes a day beats 2 hours on weekends.</strong> Motor skills are built through spaced repetition, not marathon sessions. Your brain consolidates muscle memory during sleep, so daily short sessions produce dramatically faster improvement than infrequent long ones.</p>
      <p><strong>Programming mode is a separate skill.</strong> If you code for a living, practice the programming lessons too. Brackets, operators, and special characters use completely different finger patterns than prose typing, and they need their own dedicated training.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>WPM Range</th><th>Level</th><th>Typical Timeline to Reach</th></tr></thead>
        <tbody>
          <tr><td>20–30</td><td>Beginner</td><td>Starting point for new touch typists</td></tr>
          <tr><td>30–45</td><td>Developing</td><td>2–4 weeks of daily practice</td></tr>
          <tr><td>45–60</td><td>Intermediate</td><td>1–2 months — faster than most office workers</td></tr>
          <tr><td>60–80</td><td>Advanced</td><td>3–6 months — top 20% of all typists</td></tr>
          <tr><td>80–100</td><td>Expert</td><td>6–12 months — professional-level speed</td></tr>
          <tr><td>100+</td><td>Elite</td><td>1+ year of dedicated practice — top 1%</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['typing-test', 'wpm-test', 'keyboard-tester'],
    live: true,
  },
  {
    slug: 'race',
    name: 'Typing Race',
    shortDescription: 'Race against ghost opponents at different skill levels.',
    category: 'type',
    route: '/type/race',
    acceptedFormats: [],
    icon: 'Flag',
    metaTitle: 'Typing Race — Race Against the Clock | clevr.tools',
    metaDescription: 'Free typing race game. Compete against ghost opponents at five difficulty levels. Track your progress and beat your best time.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>Nothing pushes your typing speed like a visible opponent pulling ahead of you. The Typing Race puts a ghost racer on screen that types at a fixed WPM, and your job is simple: finish the passage before they do. It turns a solo practice session into a head-to-head competition, which is exactly the kind of pressure that forces breakthroughs in speed.</p>
      <p>Use the race when you feel stuck at a plateau. Typing drills build accuracy, but racing builds urgency — the combination is what pushes you past the WPM ceiling you have been bumping against. It is also a great warm-up before a typing test, pair programming session, or a long writing sprint. Pick the difficulty one level above your comfort zone and chase the ghost.</p>
      <p>The five difficulty brackets — Casual (40 WPM), Average (60 WPM), Fast (80 WPM), Pro (100 WPM), and Expert (120 WPM) — correspond to real-world typing speed percentiles. Beating the Average ghost puts you ahead of roughly 60% of computer users. Beating Pro means you type faster than 95% of people. Expert is the top 1% — the territory of competitive speed typists.</p>

      <h2>Good to Know</h2>
      <p><strong>Accuracy wins races, not raw speed.</strong> Every backspace costs you roughly half a second. At 80 WPM, a single corrected error wipes out the time you saved typing three words fast. Keep your error rate below 3% and your speed will climb naturally.</p>
      <p><strong>Read ahead, not behind.</strong> Train your eyes to stay two or three words ahead of where your fingers are. This gives your brain processing time and lets your fingers flow instead of stopping at each word boundary.</p>
      <p><strong>Rhythm beats bursting.</strong> Trying to sprint through easy words and then stumbling on hard ones produces a worse average WPM than maintaining a steady, consistent pace throughout the passage. Think metronome, not drag race.</p>
      <p><strong>Level up when you win 3 in a row.</strong> If you consistently beat a ghost by a wide margin, the difficulty is too low to push growth. Move up a bracket as soon as you can win three consecutive races at your current level.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Ghost Speed</th><th>Difficulty</th><th>Percentile If You Win</th></tr></thead>
        <tbody>
          <tr><td>40 WPM</td><td>Casual</td><td>~50th percentile — average adult typing speed</td></tr>
          <tr><td>60 WPM</td><td>Average</td><td>~70th percentile — regular computer user</td></tr>
          <tr><td>80 WPM</td><td>Fast</td><td>~90th percentile — experienced typist</td></tr>
          <tr><td>100 WPM</td><td>Pro</td><td>~96th percentile — professional-level speed</td></tr>
          <tr><td>120 WPM</td><td>Expert</td><td>~99th percentile — competitive typist territory</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['wpm-test', 'typing-practice', 'word-blitz'],
    live: true,
  },
  {
    slug: 'word-blitz',
    name: 'Word Blitz',
    shortDescription: 'Fast-paced word typing game with streak multipliers.',
    category: 'type',
    route: '/type/word-blitz',
    acceptedFormats: [],
    icon: 'Zap',
    metaTitle: 'Word Blitz — Fast-Paced Typing Game | clevr.tools',
    metaDescription: 'Free typing speed game. Type words fast to build streaks and rack up high scores. Three difficulty levels with 30, 60, and 90 second rounds.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>Word Blitz is typing practice disguised as an arcade game. Words fly at you one at a time, you type them as fast as you can, and a streak multiplier rewards you for keeping your accuracy up. It is the perfect tool when you want to improve your typing speed but a plain typing test feels like homework. The score chasing and multiplier system create a "just one more round" loop that keeps you practicing without it feeling like practice.</p>
      <p>It is especially effective as a warm-up before a formal typing test or a long writing session. A couple of 30-second rounds on Easy mode gets your fingers loose and your brain into typing mode. For a real challenge, try Hard mode with a 90-second timer — maintaining a high streak multiplier on 10-letter words requires both speed and intense focus.</p>
      <p>Word Blitz also trains a specific skill that standard typing tests do not: fast word recognition. Because each word appears individually and you need to type it before the next one arrives, your brain learns to process and execute words as single units rather than letter-by-letter. This "chunking" skill directly transfers to faster prose typing.</p>

      <h2>Good to Know</h2>
      <p><strong>The multiplier is everything.</strong> Your streak multiplier scales from 1x up to 5x at 30+ consecutive correct words. A single mistake resets it to 1x. This means one error on word 29 costs you far more points than the same error on word 2. Protect your streak — slow down slightly on hard words rather than rushing and breaking it.</p>
      <p><strong>Easy mode is not just for beginners.</strong> Short, common words let you build massive streaks and practice rapid-fire execution. Even fast typists use Easy mode to warm up and train their burst speed on familiar words.</p>
      <p><strong>Hard mode trains vocabulary recognition.</strong> Longer, less common words force your brain to process unfamiliar letter combinations. This is great training for improving your reading speed alongside your typing speed.</p>
      <p><strong>Watch your WPM trend, not your score.</strong> The score is fun, but the WPM counter tells you if you are actually getting faster. A high score with low WPM means you are playing it safe — push yourself to type faster even if your streak breaks occasionally.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Score Range (60s)</th><th>Level</th><th>What It Means</th></tr></thead>
        <tbody>
          <tr><td>0–500</td><td>Warming Up</td><td>Getting familiar with the game — focus on accuracy first</td></tr>
          <tr><td>500–1,500</td><td>Solid</td><td>Good accuracy with developing speed, building streak consistency</td></tr>
          <tr><td>1,500–3,000</td><td>Strong</td><td>Sustaining multipliers, typing faster than most — around 60-80 WPM</td></tr>
          <tr><td>3,000–5,000</td><td>Excellent</td><td>Long streaks with high multipliers — 80-100 WPM territory</td></tr>
          <tr><td>5,000+</td><td>Elite</td><td>Consistently high multiplier with fast execution — 100+ WPM</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['wpm-test', 'race', 'typing-practice'],
    live: true,
  },
  {
    slug: 'code-challenge',
    name: 'Code Typing Challenge',
    shortDescription: 'Practice typing real code in JS, Python, TypeScript, and more.',
    category: 'type',
    route: '/type/code-challenge',
    acceptedFormats: [],
    icon: 'Code2',
    metaTitle: 'Code Typing Challenge — Practice for Devs | clevr.tools',
    metaDescription: 'Practice typing real code snippets in JavaScript, Python, TypeScript, HTML, SQL, Go, and Rust. Track your coding WPM and special character accuracy.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>Regular typing tests measure how fast you can blaze through English sentences, but that skill only gets you halfway as a developer. Code is a completely different beast — curly braces, arrow functions, angle brackets, pipes, semicolons, and triple equals signs all demand finger patterns that everyday typing never trains. If you have ever felt like your brain works faster than your fingers during a coding session, this is where you close the gap.</p>
      <p>The Code Typing Challenge is perfect for developers prepping for pair programming interviews, hackathon competitors who need to ship fast under pressure, or anyone switching to a new language and wanting to build muscle memory for its syntax patterns. Whether you write JavaScript every day or you are picking up Rust for the first time, practicing actual code snippets beats generic typing drills every time.</p>
      <p>Even experienced developers are often surprised by their results. Most find their code WPM is 20-40% lower than their prose WPM, and their special character accuracy trails letter accuracy by 10-20 percentage points. Targeted practice can close both gaps in just a few weeks of short daily sessions.</p>

      <h2>Good to Know</h2>
      <p><strong>Special characters are your bottleneck.</strong> Brackets, semicolons, arrow operators, and template literals require awkward finger stretches that slow everyone down. The challenge tracks your special character accuracy separately so you can see exactly where to focus.</p>
      <p><strong>Each language has its own rhythm.</strong> Python leans on indentation and colons, JavaScript is heavy on braces and arrows, Rust demands lifetimes and match arms. Practicing each language individually builds distinct muscle memory patterns.</p>
      <p><strong>Difficulty levels mirror real codebases.</strong> Beginner snippets cover variable declarations and simple functions. Intermediate introduces real-world patterns like debounce, decorators, and error handling. Advanced throws you into generic builders, event emitters, and complex type signatures.</p>
      <p><strong>Short sessions beat long grinds.</strong> Ten minutes a day of focused code typing practice is more effective than an hour-long session once a week. Consistency builds the neural pathways that make special characters feel automatic.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Code WPM</th><th>Level</th><th>What It Means</th></tr></thead>
        <tbody>
          <tr><td>15–25</td><td>Beginner</td><td>Still hunting for special character keys — totally normal when starting out</td></tr>
          <tr><td>25–40</td><td>Developing</td><td>Comfortable with basic syntax, building speed on brackets and operators</td></tr>
          <tr><td>40–55</td><td>Proficient</td><td>Solid coding speed — you can keep up with your thinking for most tasks</td></tr>
          <tr><td>55–70</td><td>Advanced</td><td>Fast enough that typing is rarely the bottleneck, even during pair programming</td></tr>
          <tr><td>70+</td><td>Expert</td><td>Elite code typing speed — top 5% of developers, hackathon-ready</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['typing-practice', 'wpm-test', 'keyboard-tester'],
    live: true,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You took a great group photo but one edge has a stranger walking through the frame. Or you need to turn a landscape shot into a square for your Instagram feed without the platform deciding what gets cut. Maybe you're preparing headshots for a team page and every image needs to be the same 1:1 square with the face centered. Cropping is about choosing what stays in the frame — and just as importantly, what doesn't.</p>
      <p>Unlike resizing, which scales the entire image up or down, cropping removes content from the edges. A 4000 x 3000 photo cropped to 16:9 becomes 4000 x 2250 — the sides stay sharp, but the top and bottom are gone. This makes cropping the right tool when you need to recompose a shot, eliminate distractions, or fit an image into a specific aspect ratio for a platform or layout.</p>
      <p>The circle crop option is specifically for profile pictures. Facebook, LinkedIn, Twitter, and Google all display avatars as circles. Rather than uploading a square and hoping the platform's cropper centers your face correctly, crop it yourself with a circular mask that exports as a PNG with transparent corners. You control exactly what appears inside the circle.</p>

      <h2>Good to know</h2>
      <p><strong>Freeform crop gives you total control.</strong> When no aspect ratio is locked, you can drag the crop box to any rectangular shape. This is useful for cutting out a specific section of a screenshot, removing a watermark area, or isolating a region of interest from a larger image.</p>
      <p><strong>Locking an aspect ratio prevents accidental distortion.</strong> When you set 16:9, the crop box can only be resized proportionally. This guarantees the output fits perfectly into a YouTube thumbnail, presentation slide, or widescreen banner without letterboxing.</p>
      <p><strong>Circle crop outputs a PNG, not a JPG.</strong> JPEG doesn't support transparency, so the circular mask requires PNG format. If the original was a JPG, the cropped output will be a PNG file — slightly larger, but with clean transparent corners instead of white or black fill.</p>
      <p><strong>Crop before you resize.</strong> Cropping first means you're working with the full-resolution original. If you resize down first and then crop, you're throwing away pixels you already paid for. The optimal workflow is crop, then resize to your target dimensions.</p>
      <p><strong>All processing happens in your browser.</strong> Your images are drawn to an HTML5 Canvas element and cropped locally. No pixel data leaves your device at any point.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Aspect Ratio</th><th>Dimensions Example</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1:1</td><td>1080 x 1080</td><td>Instagram posts, profile pictures, app icons</td></tr>
          <tr><td>4:3</td><td>2000 x 1500</td><td>Traditional photography, iPad displays</td></tr>
          <tr><td>3:2</td><td>1800 x 1200</td><td>DSLR photos, 6x4 prints</td></tr>
          <tr><td>16:9</td><td>1920 x 1080</td><td>YouTube thumbnails, presentations, TV</td></tr>
          <tr><td>9:16</td><td>1080 x 1920</td><td>Instagram Stories, TikTok, Reels</td></tr>
          <tr><td>2:3</td><td>1000 x 1500</td><td>Pinterest pins, book covers, posters</td></tr>
          <tr><td>Circle</td><td>500 x 500 (masked)</td><td>Profile pictures (Facebook, LinkedIn, Google)</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Invoice Generator — Free PDF Invoices | clevr.tools',
    metaDescription: 'Generate professional PDF invoices for free. Add line items, taxes, discounts, and your logo. Download instantly. No sign-up required.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You just finished a freelance project and the client is waiting for an invoice before they can process payment. Or you run a small business and need to send professional-looking invoices without paying for QuickBooks or FreshBooks. Maybe you're a contractor who invoices different clients each month and wants a fast way to generate a clean PDF with your logo, line items, and payment details — without fiddling with a Word template every time.</p>
      <p>This tool is built for the moment between "work is done" and "I need to get paid." Fill in your business details, add the client's information, list your line items with quantities and rates, apply tax if needed, and download a polished PDF invoice. The entire process takes under two minutes, and the result looks like it came from dedicated accounting software.</p>
      <p>It's also useful for one-off situations that don't justify setting up invoicing software — selling a piece of furniture, billing for a speaking engagement, or invoicing a friend's business for consulting. You need a real invoice with a number, date, and total, not a Venmo request.</p>

      <h2>Good to know</h2>
      <p><strong>Invoice numbers create an audit trail.</strong> Use a consistent numbering system — sequential (INV-001, INV-002) or year-prefixed (2026-001). Many accounting departments and tax authorities require unique invoice numbers to process payments and validate deductions. Skipping or duplicating numbers creates reconciliation headaches.</p>
      <p><strong>Payment terms set expectations.</strong> "Net 30" means the client has 30 days to pay. "Due on receipt" means you expect immediate payment. "Net 15" splits the difference. Stating terms clearly on the invoice is not aggressive — it's professional, and it gives the client's accounts payable team the information they need to schedule your payment.</p>
      <p><strong>Include your payment methods.</strong> The fewer obstacles between the client and your bank account, the faster you get paid. List bank transfer details, PayPal, Venmo, or any other method you accept. Clients who can't figure out how to pay you will deprioritize your invoice.</p>
      <p><strong>Your data stays in your browser.</strong> Invoice details are used to generate a PDF locally. No business information, client data, or financial details are transmitted to any server. The PDF is created entirely on your device.</p>
      <p><strong>Add your logo for a professional touch.</strong> A logo in the header immediately distinguishes your invoice from a generic template. Upload a PNG or JPG and it's embedded directly in the PDF.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Payment Term</th><th>Meaning</th><th>Typical Use</th></tr></thead>
        <tbody>
          <tr><td>Due on receipt</td><td>Payment expected immediately</td><td>Small jobs, one-time services</td></tr>
          <tr><td>Net 15</td><td>Due within 15 days</td><td>Ongoing freelance work</td></tr>
          <tr><td>Net 30</td><td>Due within 30 days</td><td>Standard business invoicing</td></tr>
          <tr><td>Net 60</td><td>Due within 60 days</td><td>Large contracts, enterprise clients</td></tr>
          <tr><td>2/10 Net 30</td><td>2% discount if paid within 10 days, otherwise due in 30</td><td>Incentivizing early payment</td></tr>
          <tr><td>50% upfront</td><td>Half due before work begins</td><td>Large projects, new client relationships</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Salary Calculator — Hourly to Annual Free | clevr.tools',
    metaDescription: 'Free salary calculator. Convert hourly wage to annual salary or annual salary to hourly rate. See daily, weekly, bi-weekly, semi-monthly, and monthly breakdowns instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're looking at a job posting that pays $28/hour and want to know the annual equivalent. Or you're comparing two offers — one salaried at $68,000 and one hourly at $34/hour — and need an apples-to-apples comparison. This calculator converts between hourly, daily, weekly, biweekly, semi-monthly, monthly, and annual pay in both directions, so you can evaluate any compensation in the format that makes sense to you.</p>
      <p>It's also useful for freelancers and contractors setting their rates. If you want to earn the equivalent of a $90,000 salary but you're only billing 48 weeks a year (accounting for vacation and holidays), your hourly rate needs to be higher than simply $90,000 / 2,080 hours. Adjusting the weeks-per-year and hours-per-week fields gives you the accurate number.</p>
      <p>Part-time workers, people considering overtime, and anyone negotiating a raise benefit from seeing every time-period breakdown at once. A $2/hour raise doesn't sound life-changing, but it's $4,160/year at full-time — which might cover a car payment or fund an IRA contribution.</p>

      <h2>Good to know</h2>
      <p><strong>The standard conversion: Annual = Hourly x Hours/Week x Weeks/Year.</strong> At 40 hours/week and 52 weeks/year, that's 2,080 hours. So $25/hour = $52,000/year. But if you take 2 weeks unpaid vacation, your actual annual earnings are $25 x 40 x 50 = $50,000. The calculator lets you adjust both variables for precision.</p>
      <p><strong>Salaried doesn't always mean more stable.</strong> Hourly workers get overtime (1.5x) for hours over 40/week under the FLSA. A salaried employee earning $60,000 who works 50 hours/week effectively earns $23.08/hour — less than someone making $25/hour with overtime. When comparing offers, calculate the effective hourly rate based on actual expected hours.</p>
      <p><strong>Total compensation is what matters.</strong> A job paying $65,000 with employer-paid health insurance ($7,000 value), 6% 401(k) match ($3,900), and 4 weeks PTO is worth roughly $80,000+ in total compensation. A competing offer at $75,000 with no benefits might actually be the worse deal. Always look beyond the base number.</p>
      <p><strong>Biweekly and semi-monthly are not the same.</strong> Biweekly means every two weeks (26 paychecks/year). Semi-monthly means twice a month, usually the 1st and 15th (24 paychecks/year). On a $60,000 salary, biweekly = $2,308/paycheck, semi-monthly = $2,500/paycheck. The annual total is the same, but the per-check amount differs.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Hourly Rate</th><th>Weekly (40 hrs)</th><th>Biweekly</th><th>Monthly</th><th>Annual</th></tr></thead>
        <tbody>
          <tr><td>$15.00</td><td>$600</td><td>$1,200</td><td>$2,600</td><td>$31,200</td></tr>
          <tr><td>$20.00</td><td>$800</td><td>$1,600</td><td>$3,467</td><td>$41,600</td></tr>
          <tr><td>$25.00</td><td>$1,000</td><td>$2,000</td><td>$4,333</td><td>$52,000</td></tr>
          <tr><td>$35.00</td><td>$1,400</td><td>$2,800</td><td>$6,067</td><td>$72,800</td></tr>
          <tr><td>$50.00</td><td>$2,000</td><td>$4,000</td><td>$8,667</td><td>$104,000</td></tr>
          <tr><td>$75.00</td><td>$3,000</td><td>$6,000</td><td>$13,000</td><td>$156,000</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Take-Home Pay Calculator — After-Tax Pay | clevr.tools',
    metaDescription: 'Free take-home pay calculator. Estimate your paycheck after federal income tax, state tax, Social Security, and Medicare deductions. All 50 states supported.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have just received a job offer for $85,000 a year and you want to know what that actually means in your bank account every two weeks. Or you are comparing offers in different states and need to understand how state income tax changes the picture. The gap between gross salary and net pay is significant — federal income tax, state tax, Social Security, and Medicare collectively take 25–40% of most paychecks, and the exact amount depends on your filing status, state of residence, and pre-tax deductions.</p>
      <p>This calculator breaks down each deduction line by line so you can see exactly where your money goes. Enter your gross annual salary, select your pay frequency (weekly, biweekly, semi-monthly, or monthly), choose your filing status, and pick your state. The result shows federal income tax, state income tax, Social Security, Medicare, and your final take-home amount per paycheck and per year.</p>
      <p>Pre-tax deductions like 401(k) contributions, HSA contributions, and health insurance premiums reduce your taxable income before the tax calculations run. Contributing 6% to a 401(k) on an $85,000 salary does not reduce your paycheck by the full $5,100 — it saves you taxes on that amount too, making the actual paycheck impact smaller than the contribution. This calculator lets you model those scenarios so you can make informed decisions about retirement savings and benefits enrollment.</p>

      <h2>Good to know</h2>
      <p><strong>Progressive brackets mean your marginal rate is not your effective rate.</strong> If your taxable income puts you in the 22% federal bracket, you are not paying 22% on all your income — only on the portion above the 12% bracket threshold. Your effective federal tax rate is the blended average across all brackets, which is always lower than your marginal rate.</p>
      <p><strong>FICA taxes are flat and have a ceiling.</strong> Social Security tax is 6.2% on the first $176,100 of earnings (2025). Once you earn above that threshold, Social Security tax stops — you will notice a bump in your paychecks later in the year if your salary exceeds this amount. Medicare tax is 1.45% with no cap, plus an additional 0.9% on earnings above $200,000 (single) or $250,000 (married filing jointly).</p>
      <p><strong>Nine states have no income tax.</strong> Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming do not tax wage income. Living and working in one of these states means your take-home pay is meaningfully higher — for an $85,000 salary, the difference versus a high-tax state like California can be $3,000–5,000 per year.</p>
      <p><strong>Your W-4 controls withholding, not actual tax owed.</strong> The amount withheld from each paycheck is an estimate. If too little is withheld, you will owe at tax time. If too much is withheld, you get a refund — which means you gave the government an interest-free loan. Adjust your W-4 to match your actual situation as closely as possible.</p>
      <p><strong>Pre-tax retirement contributions are a double win.</strong> A 401(k) contribution lowers your taxable income now and grows tax-deferred. At a 22% marginal rate, a $500 monthly contribution only reduces your paycheck by about $390 after the tax savings. Few financial moves offer this kind of leverage.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Tax / Deduction</th><th>Rate</th><th>Threshold / Notes</th></tr></thead>
        <tbody>
          <tr><td>Federal 10% bracket</td><td>10%</td><td>First $11,925 (single, 2025)</td></tr>
          <tr><td>Federal 12% bracket</td><td>12%</td><td>$11,926 – $48,475</td></tr>
          <tr><td>Federal 22% bracket</td><td>22%</td><td>$48,476 – $103,350</td></tr>
          <tr><td>Federal 24% bracket</td><td>24%</td><td>$103,351 – $197,300</td></tr>
          <tr><td>Social Security</td><td>6.2%</td><td>Up to $176,100</td></tr>
          <tr><td>Medicare</td><td>1.45%</td><td>No cap (+ 0.9% above $200K)</td></tr>
          <tr><td>Standard Deduction (single)</td><td>—</td><td>$15,000 (2025)</td></tr>
          <tr><td>Standard Deduction (married)</td><td>—</td><td>$30,000 (2025)</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Loan Calculator — Monthly Payment & Schedule | clevr.tools',
    metaDescription: 'Free loan calculator. Calculate monthly payments for any loan amount, interest rate, and term. View a full amortization schedule showing principal and interest breakdown.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're comparing two loan offers and they both look reasonable — until you calculate the total interest. A $25,000 personal loan at 8% over 5 years costs $5,416 in interest. The same loan at 10% costs $6,872. That 2% difference is $1,456 you'll never see again. This calculator shows you those numbers before you sign anything.</p>
      <p>It's also the right tool when you're deciding between loan terms. A longer term means lower monthly payments but dramatically more interest. A shorter term means higher payments but you're debt-free sooner and pay less overall. The amortization schedule makes the tradeoff concrete — you can see exactly how much of each payment goes to principal vs. interest, month by month.</p>
      <p>Use it for any fixed-rate loan: personal loans, student loans, home equity loans, or equipment financing. If the rate is fixed and the term is set, the math is the same.</p>

      <h2>Good to know</h2>
      <p><strong>Early payments are almost all interest.</strong> On a $30,000 loan at 7% over 5 years, your first payment is $594 — but $419 goes to interest and only $175 to principal. By your last year, nearly the entire payment goes to principal. This is why extra payments early in the loan save the most money.</p>
      <p><strong>The monthly payment isn't the true cost.</strong> A $20,000 loan at 6% over 3 years costs $608/month. Over 5 years, it's $387/month — sounds better, right? But the 3-year total cost is $21,888 while the 5-year total is $23,199. That "lower" payment costs you $1,311 extra.</p>
      <p><strong>APR ≠ interest rate.</strong> The Annual Percentage Rate includes fees and origination charges, making it the better comparison metric between lenders. Two loans with the same interest rate can have different APRs if one charges higher fees.</p>
      <p><strong>One extra payment per year matters.</strong> On a $30,000 loan at 7% over 5 years, making one extra monthly payment per year saves ~$700 in interest and pays off the loan 6 months early. It's one of the simplest debt-reduction strategies.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Loan Amount</th><th>Rate</th><th>Term</th><th>Monthly Payment</th><th>Total Interest</th></tr></thead>
        <tbody>
          <tr><td>$10,000</td><td>6%</td><td>3 years</td><td>$304</td><td>$944</td></tr>
          <tr><td>$10,000</td><td>6%</td><td>5 years</td><td>$193</td><td>$1,600</td></tr>
          <tr><td>$25,000</td><td>8%</td><td>5 years</td><td>$507</td><td>$5,416</td></tr>
          <tr><td>$50,000</td><td>7%</td><td>7 years</td><td>$754</td><td>$13,355</td></tr>
          <tr><td>$50,000</td><td>10%</td><td>5 years</td><td>$1,062</td><td>$13,748</td></tr>
        </tbody>
      </table>
    `,
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
    seoContent: `
      <h2>When to use this</h2>
      <p>You've found a car you like and the dealer is quoting you $550 a month over 72 months. That sounds manageable — but what does the total cost look like? This calculator shows the full picture: your monthly payment, total interest paid, and the all-in cost of the vehicle. Run the numbers before stepping onto the lot so you negotiate from a position of knowledge, not emotion.</p>
      <p>It's also the right tool when you're weighing trade-offs. How much does a $3,000 larger down payment save you over the life of the loan? What happens if you go with 48 months instead of 72? What if you can get 5.9% from your credit union instead of the dealer's 7.2%? The term comparison table answers all of these questions side by side.</p>
      <p>If you have a trade-in, enter its value separately. The calculator subtracts trade-in value from the vehicle price before computing the loan. If you owe more on your current car than it's worth (negative equity or being "upside down"), that remaining balance rolls into the new loan — and this calculator accounts for that.</p>

      <h2>Good to know</h2>
      <p><strong>The formula is the same as any fixed-rate loan.</strong> Monthly Payment = P[r(1+r)^n] / [(1+r)^n - 1], where P = loan amount (price - down payment - trade-in), r = monthly interest rate, n = number of payments. The loan amount is what matters, not the sticker price.</p>
      <p><strong>Longer terms are more expensive than they look.</strong> A $35,000 loan at 6.5% over 60 months costs $685/month and $6,100 in interest. Stretch that to 72 months: $586/month sounds better, but total interest jumps to $7,400. At 84 months it's $516/month but $8,700 in interest. You're paying $2,600 more for the "convenience" of a lower payment.</p>
      <p><strong>Depreciation works against long loans.</strong> A new car loses roughly 20% of its value in year one and about 60% over five years. With a 72- or 84-month loan and minimal down payment, you can easily owe more than the car is worth for the first 3–4 years. If you total the car or need to sell, you're stuck covering the gap.</p>
      <p><strong>Get pre-approved before shopping.</strong> A pre-approval from your bank or credit union gives you a baseline rate and maximum loan amount. Dealers can try to beat it, but you won't be pressured into their financing without a comparison point. Credit scores above 720 typically qualify for the best rates.</p>
      <p><strong>The 20/4/10 rule is a solid guardrail.</strong> Put at least 20% down, finance for no more than 4 years (48 months), and keep total vehicle costs (payment + insurance + fuel) under 10% of gross monthly income. Not everyone can hit all three, but it prevents the most common car-buying overextensions.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Vehicle Price</th><th>Down Payment</th><th>Rate</th><th>48 mo</th><th>60 mo</th><th>72 mo</th></tr></thead>
        <tbody>
          <tr><td>$25,000</td><td>$5,000 (20%)</td><td>5.9%</td><td>$470/mo</td><td>$386/mo</td><td>$331/mo</td></tr>
          <tr><td>$35,000</td><td>$5,000 (14%)</td><td>6.5%</td><td>$712/mo</td><td>$586/mo</td><td>$503/mo</td></tr>
          <tr><td>$35,000</td><td>$7,000 (20%)</td><td>6.5%</td><td>$665/mo</td><td>$548/mo</td><td>$469/mo</td></tr>
          <tr><td>$45,000</td><td>$9,000 (20%)</td><td>6.0%</td><td>$845/mo</td><td>$696/mo</td><td>$597/mo</td></tr>
          <tr><td>$45,000</td><td>$5,000 (11%)</td><td>7.2%</td><td>$963/mo</td><td>$797/mo</td><td>$687/mo</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Credit Card Payoff Calculator — Free Tool | clevr.tools',
    metaDescription: 'Free credit card payoff calculator. Enter your balance, APR, and monthly payment to see months to payoff, total interest, and how paying more saves money.',
    seoContent: `<h2>When to use this</h2>
<p>You have credit card debt and you want to see the math — not a vague "pay more and you'll be fine," but the actual numbers. How many months until it's gone? How much of each payment goes to interest vs. principal? What happens if you throw an extra $50 or $100 at it each month?</p>
<p>This is especially useful when you're deciding between the avalanche method (highest APR first, mathematically optimal) and the snowball method (smallest balance first, psychologically motivating). Plug in your numbers for each scenario and compare. Both work — the best strategy is the one you'll actually stick with.</p>
<p>It's also a reality check. If your minimum payment barely covers the monthly interest charge, you need to see that spelled out. Credit cards at 20%+ APR are the most expensive debt most people carry, and the compounding works against you every month you carry a balance.</p>
<h2>Good to know</h2>
<p><strong>Most of your early payments go to interest.</strong> At 20% APR, roughly 65% of your minimum payment goes to interest in year one. That ratio slowly shifts toward principal over time, but it's why payoff feels so slow at first.</p>
<p><strong>Small extra payments have an outsized impact.</strong> Paying just $50/month extra on a $5,000 balance at 20% APR saves approximately $3,000 in total interest and cuts years off the payoff timeline. The "what-if" table makes this dramatically visible.</p>
<p><strong>APR and interest rate are basically the same for credit cards.</strong> Technically, APR includes certain fees while the interest rate doesn't. But credit cards don't have origination fees or closing costs, so your APR and interest rate are effectively identical.</p>
<p><strong>Balance transfer cards can save thousands.</strong> A 0% intro APR card (typically 12-21 months) lets every dollar go to principal. If you can pay off the balance within the promo period, you pay zero interest. Just watch for the transfer fee (usually 3-5%).</p>
<p><strong>Minimum payments are designed to be slow.</strong> Card issuers typically set minimums at 1-3% of the balance. That's not a suggestion for how much to pay — it's the least they'll accept without penalizing you.</p>
<h2>Quick Reference</h2>
<table>
<thead><tr><th>Balance</th><th>APR</th><th>Minimum Only</th><th>$200/month</th><th>$400/month</th></tr></thead>
<tbody>
<tr><td>$2,000</td><td>18%</td><td>~11 years, $1,800 interest</td><td>~11 months, $180 interest</td><td>~5 months, $90 interest</td></tr>
<tr><td>$5,000</td><td>20%</td><td>~34 years, $8,600 interest</td><td>~2.5 years, $1,300 interest</td><td>~14 months, $570 interest</td></tr>
<tr><td>$10,000</td><td>24%</td><td>~40+ years, $25,000+ interest</td><td>~8 years, $8,600 interest</td><td>~3 years, $3,400 interest</td></tr>
</tbody>
</table>`,
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
    metaTitle: 'Savings Goal Calculator — Free Planner | clevr.tools',
    metaDescription: 'Free savings goal calculator. Enter your savings target, timeline, and current savings to find the monthly contribution needed. Accounts for interest earnings.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have a specific financial target — $15,000 for an emergency fund, $40,000 for a down payment, $5,000 for a vacation — and need to know exactly how much to save each month to get there on time. Enter your goal amount, how much you've already saved, your timeline, and the interest rate on your savings account. The calculator tells you the precise monthly contribution required.</p>
      <p>It works in the other direction too. If you can only set aside $600 a month, how long until you reach $30,000? Or if you have 24 months and can save $800/month, what's the maximum goal you can realistically hit? Playing with the inputs helps you find a plan that fits your budget and timeline rather than guessing or hoping.</p>
      <p>This is also a motivational tool. Seeing that your $70,000 down payment goal requires $1,100/month for 5 years (with a high-yield savings account earning 4.5%) transforms an intimidating number into a concrete, achievable plan. And watching the interest component — money your savings earns for you — grow over time reinforces the discipline of consistent saving.</p>

      <h2>Good to know</h2>
      <p><strong>The formula solves for monthly payment: PMT = (FV - PV x (1+r)^n) x r / [(1+r)^n - 1].</strong> FV is your savings goal, PV is your current savings, r is the monthly interest rate (APY / 12), and n is the number of months. Your current savings compound while you add new money each month, so even a modest starting balance helps.</p>
      <p><strong>Interest rates matter more than you think for longer goals.</strong> Saving $50,000 over 5 years with 0% interest requires $833/month. At 4.5% APY (typical high-yield savings), you need only $750/month — the interest contributes roughly $5,000 over the period. Over 10 years, the gap widens further. Parking your savings in a high-yield account instead of a checking account is one of the easiest financial optimizations.</p>
      <p><strong>The 50/30/20 budget gives you a savings baseline.</strong> Allocate 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment. On a $4,500/month take-home pay, that's $900/month for savings goals. If your calculator result exceeds your 20% allocation, you may need to extend the timeline or reduce the goal.</p>
      <p><strong>Automate it.</strong> Research consistently shows that automatic transfers on payday are the most effective savings strategy. Set up a recurring transfer for the exact amount the calculator shows, and treat it like a non-negotiable bill. People who automate savings reach their goals at significantly higher rates than those who transfer manually.</p>
      <p><strong>Build the emergency fund first.</strong> Financial planners almost universally recommend saving 3–6 months of essential expenses before targeting other goals. Without this cushion, an unexpected expense (car repair, medical bill, job loss) forces you to raid your savings goal or take on debt, setting you back further than if you'd built the safety net first.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Goal</th><th>Timeline</th><th>Monthly (0% interest)</th><th>Monthly (4.5% HYSA)</th><th>Interest Earned</th></tr></thead>
        <tbody>
          <tr><td>$5,000 (vacation)</td><td>12 months</td><td>$417</td><td>$407</td><td>$116</td></tr>
          <tr><td>$15,000 (emergency)</td><td>18 months</td><td>$833</td><td>$804</td><td>$528</td></tr>
          <tr><td>$25,000 (car)</td><td>3 years</td><td>$694</td><td>$651</td><td>$1,564</td></tr>
          <tr><td>$50,000 (down payment)</td><td>5 years</td><td>$833</td><td>$750</td><td>$5,000</td></tr>
          <tr><td>$100,000 (investment)</td><td>10 years</td><td>$833</td><td>$675</td><td>$19,000</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Retirement Calculator — Savings Projection | clevr.tools',
    metaDescription: 'Free retirement calculator. Project savings growth with contributions and expected returns. See inflation-adjusted values and estimated monthly retirement income.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're 30 years old with $45,000 in your 401(k), contributing $500 a month, and you want to know: will I be okay at 65? This calculator projects your savings growth with compound returns and monthly contributions, then shows the inflation-adjusted value — what your money will actually buy in today's dollars. It also estimates your monthly retirement income using the 4% withdrawal rule. The answer might surprise you in either direction.</p>
      <p>It's also the tool for "what if" scenarios that shape your financial strategy. What if you retire at 60 instead of 67? What if you increase your contribution by $200/month? What if the market returns 6% instead of 8%? Each scenario produces dramatically different outcomes, and seeing the numbers helps you make intentional trade-offs between spending now and security later.</p>
      <p>Use this calculator at every career milestone: first job, raise, job change, marriage, home purchase. Each event changes your contribution capacity and your retirement timeline. Revisiting the projection regularly — not just once in your 50s — is how you course-correct before it's too late to make a difference.</p>

      <h2>Good to know</h2>
      <p><strong>The projection formula: FV = PV x (1 + r/12)^n + PMT x [(1 + r/12)^n - 1] / (r/12).</strong> PV is your current savings, r is the expected annual return, n is months until retirement, and PMT is your monthly contribution. The inflation-adjusted value divides the result by (1 + inflation)^years to show purchasing power in today's dollars.</p>
      <p><strong>The 4% rule is a guideline, not a guarantee.</strong> Research by Bill Bengen (1994) showed that withdrawing 4% of your portfolio in year one, then adjusting for inflation each subsequent year, historically survived 30+ years of retirement in almost all market conditions. For $60,000/year in retirement income, you need about $1.5 million saved ($60,000 / 0.04). More conservative planners use 3.5% for longer retirements or volatile markets.</p>
      <p><strong>Inflation erodes your savings silently.</strong> At 3% inflation, $1 million in 30 years buys what $412,000 buys today. That's why the inflation-adjusted number on this calculator is so much lower than the nominal number — and it's the one you should plan around. A million dollars sounds like a lot until you realize it might provide only $1,400/month in today's purchasing power.</p>
      <p><strong>Employer match is free money — always capture it.</strong> If your employer matches 50% of contributions up to 6% of salary, contributing less than 6% is leaving money on the table. On a $75,000 salary, that's $2,250/year in free contributions. Over 30 years at 8%, that match alone grows to approximately $280,000.</p>
      <p><strong>Starting 10 years earlier is worth more than doubling your contribution.</strong> Contributing $400/month from age 25 to 65 at 8% produces about $1,396,000. Contributing $800/month from 35 to 65 produces about $1,191,000. The early start wins with half the monthly sacrifice because compound growth has more time to work.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Start Age</th><th>Monthly Contribution</th><th>At Age 65 (8% return)</th><th>Inflation-Adjusted (3%)</th><th>Monthly Income (4% rule)</th></tr></thead>
        <tbody>
          <tr><td>25</td><td>$400</td><td>$1,396,000</td><td>$575,000</td><td>$1,917</td></tr>
          <tr><td>25</td><td>$750</td><td>$2,618,000</td><td>$1,078,000</td><td>$3,593</td></tr>
          <tr><td>30</td><td>$500</td><td>$1,116,000</td><td>$530,000</td><td>$1,767</td></tr>
          <tr><td>35</td><td>$750</td><td>$1,117,000</td><td>$612,000</td><td>$2,040</td></tr>
          <tr><td>40</td><td>$1,000</td><td>$957,000</td><td>$605,000</td><td>$2,017</td></tr>
          <tr><td>45</td><td>$1,500</td><td>$879,000</td><td>$641,000</td><td>$2,137</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Investment Return Calculator — Free Tool | clevr.tools',
    metaDescription: 'Free investment return calculator. Project future value with initial amount, monthly contributions, and compound growth. Year-by-year breakdown table included.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're starting to invest and want to see what $500 a month actually becomes in 20 years. Or you have a lump sum — maybe an inheritance or a bonus — and you're deciding between investing it or using it for something else. This calculator shows the projected growth year by year, so you can see exactly when compounding starts to accelerate and how your money grows beyond what you put in.</p>
      <p>It's also the tool for comparing strategies. What if you invest $10,000 now with no additional contributions vs. investing $0 now but contributing $300/month? What if you increase your monthly contribution by $100 — how much difference does that make over 25 years? The year-by-year breakdown makes these comparisons tangible rather than theoretical.</p>
      <p>Use it for any investment scenario: brokerage accounts, Roth IRAs, 529 college savings plans, or HSAs. The math is the same regardless of account type — what changes is the tax treatment, which affects your real after-tax returns. This calculator models pre-tax growth; adjust your expected return downward if you're estimating after-tax outcomes in a taxable account.</p>

      <h2>Good to know</h2>
      <p><strong>The formula compounds monthly: FV = P x (1 + r/12)^n + PMT x [(1 + r/12)^n - 1] / (r/12).</strong> P is your initial investment, r is the annual return rate, n is total months, and PMT is your monthly contribution. Monthly compounding means your returns earn returns every month, not just once a year.</p>
      <p><strong>Compound growth is back-loaded.</strong> With $500/month at 8% over 30 years, you contribute $180,000 total. Your ending balance is approximately $745,000 — meaning $565,000 is pure investment earnings. But here's the key: after 15 years you've only accumulated about $175,000. The second 15 years generates more than three times what the first 15 did. Time is the most powerful variable.</p>
      <p><strong>The difference between 7% and 10% is enormous over decades.</strong> $500/month for 30 years at 7% gives you about $567,000. At 10%, it's about $1,036,000. That 3% difference nearly doubles your money. This is why investment costs (expense ratios, advisory fees) matter so much — they directly reduce your effective return rate.</p>
      <p><strong>These are projections, not predictions.</strong> Markets don't return a steady 8% per year — they zigzag. A bad year early on hurts more than a bad year later (sequence-of-returns risk). Use this calculator for planning and goal-setting, but expect the actual path to be bumpier than the smooth curve shown here.</p>
      <p><strong>Starting early matters more than investing more.</strong> Investing $300/month from age 25 to 65 at 8% yields about $1,047,000. Waiting until 35 and investing $600/month (double!) from age 35 to 65 yields about $894,000. The 10-year head start wins even at half the contribution.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Monthly Contribution</th><th>Return</th><th>10 Years</th><th>20 Years</th><th>30 Years</th></tr></thead>
        <tbody>
          <tr><td>$200/mo</td><td>7%</td><td>$34,600</td><td>$104,200</td><td>$243,900</td></tr>
          <tr><td>$500/mo</td><td>7%</td><td>$86,500</td><td>$260,500</td><td>$609,800</td></tr>
          <tr><td>$500/mo</td><td>10%</td><td>$102,400</td><td>$382,800</td><td>$1,130,200</td></tr>
          <tr><td>$1,000/mo</td><td>7%</td><td>$173,100</td><td>$521,000</td><td>$1,219,700</td></tr>
          <tr><td>$1,000/mo</td><td>10%</td><td>$204,800</td><td>$765,700</td><td>$2,260,500</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Debt-to-Income Calculator — Free DTI Tool | clevr.tools',
    metaDescription: 'Free debt-to-income calculator. Add monthly debts and income to calculate your DTI ratio. See how lenders evaluate it for mortgage and loan approval.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're planning to apply for a mortgage and want to know where you stand before a lender pulls your numbers. Your debt-to-income ratio is one of the first things underwriters check, and knowing yours in advance lets you decide whether to pay down debt first, increase your income documentation, or proceed with confidence. It's the difference between walking into a pre-approval meeting prepared and getting an unwelcome surprise.</p>
      <p>DTI also matters when you're evaluating your own financial health outside of lending. If 45% of your gross income goes to debt payments every month, that leaves a thin margin for savings, emergencies, and quality of life — regardless of what a lender thinks. Tracking your DTI over time shows whether you're gaining financial flexibility or slowly losing it.</p>
      <p>Use this calculator before any major financial decision: buying a home, refinancing, taking out a car loan, or co-signing for someone else. Each new debt obligation pushes your DTI higher, and understanding how a potential new payment changes the ratio helps you avoid overextending.</p>

      <h2>Good to know</h2>
      <p><strong>The formula is straightforward: DTI = (Total Monthly Debt Payments / Gross Monthly Income) x 100.</strong> Include mortgage/rent, car loans, student loans, minimum credit card payments, personal loans, alimony, and child support. Do not include utilities, groceries, insurance, or subscriptions — lenders don't count those as "debt" for DTI purposes.</p>
      <p><strong>There are two types of DTI.</strong> The "front-end" ratio counts only housing costs (mortgage, property tax, insurance, HOA). The "back-end" ratio includes all monthly debts. Lenders look at both — conventional loans typically want front-end below 28% and back-end below 36%. When people say "DTI," they usually mean back-end.</p>
      <p><strong>Above 36% means compensating factors are needed.</strong> If your DTI is 37–43%, lenders may still approve you if you have strong compensating factors: high credit score (740+), large cash reserves (6+ months of payments), substantial down payment (20%+), or stable employment history. Above 43%, most conventional loans require an exception.</p>
      <p><strong>Gross income, not net.</strong> DTI uses your pre-tax income, which makes the ratio look better than it feels. A DTI of 36% on gross income could mean 45–50% of your take-home pay goes to debt. Keep that in mind when assessing affordability from a lifestyle perspective, not just a lending one.</p>
      <p><strong>Paying off small debts can move the needle fast.</strong> Eliminating a $200/month car payment on a $6,000 gross income drops your DTI by 3.3 percentage points. If you're on the edge of a threshold, paying off one small debt can be more effective than trying to increase your income.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>DTI Range</th><th>Lender View</th><th>Typical Outcome</th></tr></thead>
        <tbody>
          <tr><td>Under 20%</td><td>Excellent</td><td>Best rates, easy approval</td></tr>
          <tr><td>20–35%</td><td>Good</td><td>Standard approval, competitive rates</td></tr>
          <tr><td>36%</td><td>Threshold</td><td>Conventional loan maximum (ideal)</td></tr>
          <tr><td>37–43%</td><td>Acceptable</td><td>May need compensating factors</td></tr>
          <tr><td>43%</td><td>QM limit</td><td>Qualified Mortgage upper boundary</td></tr>
          <tr><td>44–50%</td><td>High</td><td>FHA may approve with strong credit</td></tr>
          <tr><td>50%+</td><td>Very high</td><td>Difficult to qualify for most loans</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Net Worth Calculator — Track Your Wealth | clevr.tools',
    metaDescription: 'Free net worth calculator. List your assets (savings, investments, property) and liabilities (loans, credit cards, mortgage) to calculate your total net worth.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You want a single number that captures your entire financial picture. Income tells you how fast money flows in. Savings tells you what's in the bank. But net worth — assets minus liabilities — tells you where you actually stand. It's the number that answers "if I sold everything and paid off every debt, what's left?"</p>
      <p>Calculate your net worth at least once a year, ideally quarterly. The absolute number matters less than the trend. Are you building wealth or losing it? A net worth that grows by $15,000 a year tells you your financial habits are working. A flat or declining net worth — even with a high income — signals that spending or debt is absorbing everything you earn.</p>
      <p>It's also essential before major financial decisions. Applying for a mortgage? The lender will want a picture of your assets and liabilities. Getting divorced? Net worth determines equitable distribution. Planning for retirement? Your net worth target is the number you need to reach. Estate planning? Net worth determines which tax thresholds apply. Every serious financial conversation starts with this number.</p>

      <h2>Good to know</h2>
      <p><strong>The formula is simple: Net Worth = Total Assets - Total Liabilities.</strong> Assets include checking/savings accounts, investment accounts (brokerage, IRA, 401k), real estate (market value), vehicles (current resale value), and other valuables. Liabilities include mortgage balance, car loans, student loans, credit card debt, personal loans, and any other money you owe.</p>
      <p><strong>Use realistic values, not purchase prices.</strong> Your car isn't worth what you paid for it — use Kelley Blue Book or similar. Your home should be valued at current market price, not what you paid or what Zillow estimated two years ago. Overvaluing assets inflates your net worth on paper but doesn't help with actual planning.</p>
      <p><strong>A negative net worth is normal in your 20s.</strong> If you have $40,000 in student loans and $8,000 in savings, your net worth is -$32,000. That's not a crisis — it's a starting point. The average American's net worth doesn't turn solidly positive until their early 30s. What matters is the trajectory.</p>
      <p><strong>Home equity is your largest asset but least liquid.</strong> A $400,000 home with a $300,000 mortgage adds $100,000 to your net worth, but you can't easily spend that $100,000 without selling or taking a home equity loan. When evaluating financial flexibility, consider your "liquid net worth" (excluding home equity) separately.</p>
      <p><strong>Retirement accounts count, even though you can't touch them yet.</strong> Your 401(k) and IRA balances are real assets. Including them in your net worth is standard practice. Just remember that pre-tax accounts (traditional 401k/IRA) will be taxed on withdrawal, so their after-tax value is roughly 70–85% of the stated balance, depending on your future tax bracket.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Age</th><th>Median Net Worth (US)</th><th>Average Net Worth (US)</th></tr></thead>
        <tbody>
          <tr><td>Under 35</td><td>~$39,000</td><td>~$183,000</td></tr>
          <tr><td>35–44</td><td>~$135,000</td><td>~$549,000</td></tr>
          <tr><td>45–54</td><td>~$247,000</td><td>~$975,000</td></tr>
          <tr><td>55–64</td><td>~$364,000</td><td>~$1,566,000</td></tr>
          <tr><td>65–74</td><td>~$410,000</td><td>~$1,794,000</td></tr>
          <tr><td>75+</td><td>~$335,000</td><td>~$1,624,000</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Sales Tax Calculator — Free Online Tool | clevr.tools',
    metaDescription: 'Free sales tax calculator. Calculate sales tax on any purchase or reverse-calculate the pre-tax price from a total. Includes state tax rate presets for all US states.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're budgeting for a big purchase — a laptop at $1,299, furniture at $2,400, or a car at $35,000 — and need to know the actual total with tax. Or you have a receipt showing $86.37 total and want to figure out the pre-tax price for an expense report. This calculator works in both directions: enter a pre-tax price to get the total, or enter a total to reverse-calculate the pre-tax amount.</p>
      <p>It's especially useful when comparing prices across states or shopping online. A $1,000 item costs $1,000 in Oregon (no sales tax) but $1,101 in Chicago (10.1% combined rate). For large purchases like appliances, electronics, or vehicles, that difference is significant enough to factor into where you buy. Some people time major purchases around tax-free weekends or shop in neighboring states with lower rates.</p>
      <p>Business owners and freelancers use it daily — calculating tax to add on invoices, verifying collected tax against expected amounts, and preparing for sales tax remittance. If you sell anything in the US, you need to know these numbers.</p>

      <h2>Good to know</h2>
      <p><strong>The forward formula: Tax = Price x Rate / 100. Total = Price + Tax.</strong> The reverse formula: Pre-Tax Price = Total / (1 + Rate / 100). A $50 item at 8.25% tax: Tax = $4.13, Total = $54.13. Working backwards from $54.13: Pre-Tax = $54.13 / 1.0825 = $50.00.</p>
      <p><strong>Sales tax rates vary wildly by location.</strong> Five states have no state sales tax: Oregon, Montana, Delaware, New Hampshire, and Alaska (though some Alaska municipalities charge local tax). The highest combined state + local rates are in parts of Louisiana, Tennessee, Arkansas, Washington, and Alabama, where rates can exceed 10%. Your effective rate depends on your specific city and county.</p>
      <p><strong>Not everything is taxed equally.</strong> Most states exempt groceries (food for home consumption) from sales tax or tax them at a reduced rate. Many exempt prescription medications. Some states exempt clothing under a threshold (e.g., New York exempts clothing items under $110). Rules vary significantly — check your state's specific exemptions.</p>
      <p><strong>Online purchases are taxed based on where you live, not where the seller is.</strong> Since the 2018 South Dakota v. Wayfair Supreme Court decision, states can require out-of-state sellers to collect sales tax. Most major online retailers now charge your local rate automatically. If they don't, you technically owe "use tax" on your state tax return — though compliance on small purchases is low.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>State</th><th>State Rate</th><th>Avg. Combined Rate</th><th>Tax on $100</th></tr></thead>
        <tbody>
          <tr><td>Oregon</td><td>0%</td><td>0%</td><td>$0.00</td></tr>
          <tr><td>Colorado</td><td>2.9%</td><td>~7.8%</td><td>$7.80</td></tr>
          <tr><td>Texas</td><td>6.25%</td><td>~8.2%</td><td>$8.20</td></tr>
          <tr><td>New York</td><td>4.0%</td><td>~8.5%</td><td>$8.50</td></tr>
          <tr><td>California</td><td>7.25%</td><td>~8.7%</td><td>$8.70</td></tr>
          <tr><td>Washington</td><td>6.5%</td><td>~9.3%</td><td>$9.30</td></tr>
          <tr><td>Tennessee</td><td>7.0%</td><td>~9.55%</td><td>$9.55</td></tr>
          <tr><td>Louisiana</td><td>4.45%</td><td>~9.56%</td><td>$9.56</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Amortization Calculator — Loan Schedule | clevr.tools',
    metaDescription: 'Free amortization calculator. Generate a full loan amortization schedule. See how extra monthly payments reduce total interest and shorten your loan term.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You just got approved for a mortgage and the lender handed you a number — $2,100 a month for 30 years. But what does that actually look like? How much of that first payment is interest vs. principal? When does the crossover happen where you're finally paying down more principal than interest? An amortization schedule answers all of this, month by month, for the entire life of your loan.</p>
      <p>This calculator is especially powerful when you're considering extra payments. Maybe you can afford an extra $200 a month and want to see the exact impact: how many years it shaves off, how much interest it saves, and when you'd be debt-free. The side-by-side comparison of your standard schedule vs. the accelerated one makes the decision concrete rather than abstract.</p>
      <p>Use it for any fixed-rate loan — mortgages, auto loans, student loans, or personal loans. If the interest rate and term are fixed, the amortization math applies. Variable-rate loans change the picture (and this calculator assumes a fixed rate throughout), but you can still model different rate scenarios by running the numbers at each rate.</p>

      <h2>Good to know</h2>
      <p><strong>The formula is M = P[r(1+r)^n] / [(1+r)^n - 1].</strong> P is the principal (loan amount), r is the monthly interest rate (annual rate / 12), and n is total number of payments (years × 12). Each month, interest = remaining balance × r, and principal = M - interest. As the balance shrinks, less goes to interest and more to principal — that's amortization.</p>
      <p><strong>Front-loading of interest is dramatic.</strong> On a $300,000 mortgage at 6.5% over 30 years, your first payment of $1,896 splits as $1,625 interest and $271 principal. You don't reach a 50/50 split until around year 19. This is why selling a home in the first few years often means you've barely touched the principal.</p>
      <p><strong>Extra payments attack the back end of the schedule.</strong> When you pay an extra $200/month, that money goes entirely to principal. Each dollar of extra principal eliminates a future interest charge, creating a compounding savings effect. On the same $300,000 mortgage, $200/month extra saves about $82,000 in interest and pays off the loan 6.5 years early.</p>
      <p><strong>Biweekly payments are a stealth extra payment.</strong> Paying half your monthly payment every two weeks results in 26 half-payments (13 full payments) per year instead of 12. That one extra payment per year can shave 4–5 years off a 30-year mortgage.</p>
      <p><strong>Refinancing resets your amortization clock.</strong> If you refinance 10 years into a 30-year mortgage into a new 30-year mortgage, you restart the front-loaded interest cycle. Even at a lower rate, you may pay more total interest. Always compare total remaining cost, not just monthly payments.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Loan</th><th>Rate</th><th>Term</th><th>Monthly Payment</th><th>Total Interest</th><th>With $200/mo Extra</th></tr></thead>
        <tbody>
          <tr><td>$200,000</td><td>6.0%</td><td>30 yr</td><td>$1,199</td><td>$231,640</td><td>$152,120 (saves $79,520)</td></tr>
          <tr><td>$300,000</td><td>6.5%</td><td>30 yr</td><td>$1,896</td><td>$382,633</td><td>$300,480 (saves $82,153)</td></tr>
          <tr><td>$300,000</td><td>6.5%</td><td>15 yr</td><td>$2,613</td><td>$170,389</td><td>$141,220 (saves $29,169)</td></tr>
          <tr><td>$25,000</td><td>5.5%</td><td>5 yr</td><td>$478</td><td>$3,638</td><td>$2,490 (saves $1,148)</td></tr>
          <tr><td>$40,000</td><td>7.0%</td><td>6 yr</td><td>$684</td><td>$9,225</td><td>$6,870 (saves $2,355)</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Car Payment Calculator — Monthly Estimate | clevr.tools',
    metaDescription: 'Free car payment calculator. Enter car price, down payment, interest rate, and loan term to estimate your monthly payment, total interest, and total cost of the vehicle.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're browsing car listings and see something for $32,000. Before you get emotionally attached, you want to know what that actually costs per month — and what the total damage is after interest. Enter the price, your planned down payment, the interest rate you expect to qualify for, and the loan term. In seconds you'll see the monthly payment, total interest, and the real cost of that car.</p>
      <p>This is also the tool for budget-first shopping. If you know you can afford $450 a month, work backwards: adjust the vehicle price, down payment, and term until the payment fits your budget. It's a much better approach than falling in love with a car and then figuring out financing later, when the pressure to make it work clouds your judgment.</p>
      <p>Use it to compare new vs. used, or to see how a higher down payment changes the math. A used car at $18,000 with a slightly higher rate may still cost less per month and in total than a new car at $30,000 with a promotional rate. The numbers tell the real story.</p>

      <h2>Good to know</h2>
      <p><strong>Monthly payment = P[r(1+r)^n] / [(1+r)^n - 1].</strong> P is the amount financed (price minus down payment), r is the monthly rate (APR / 12), and n is total months. A $28,000 loan at 6% for 60 months works out to $541/month, with $4,480 in total interest.</p>
      <p><strong>Every $1,000 in down payment saves more than $1,000.</strong> On a 60-month loan at 6%, an extra $1,000 down saves $1,000 in principal plus about $160 in interest — $1,160 total. On a 72-month loan at 7%, that same $1,000 saves nearly $1,240. The longer the term and higher the rate, the more a down payment is worth.</p>
      <p><strong>Dealer financing isn't always the best deal.</strong> Manufacturers sometimes offer 0% or low-rate promotional financing, but often only on specific models and to buyers with excellent credit. Compare the dealer's offer against a credit union or bank pre-approval. Sometimes a manufacturer rebate (cash discount) plus outside financing beats 0% with no rebate.</p>
      <p><strong>Don't forget the hidden costs.</strong> Your monthly car budget should include insurance (often $150–$300/month for full coverage), fuel, and maintenance. A car with a $500 payment that requires premium fuel and expensive maintenance can cost the same as a $600 payment on a reliable, fuel-efficient model.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Car Price</th><th>Down Payment</th><th>Rate</th><th>Term</th><th>Monthly Payment</th><th>Total Interest</th></tr></thead>
        <tbody>
          <tr><td>$20,000</td><td>$4,000 (20%)</td><td>5.5%</td><td>48 mo</td><td>$372</td><td>$1,840</td></tr>
          <tr><td>$28,000</td><td>$3,000 (11%)</td><td>6.0%</td><td>60 mo</td><td>$483</td><td>$3,980</td></tr>
          <tr><td>$35,000</td><td>$7,000 (20%)</td><td>6.5%</td><td>60 mo</td><td>$548</td><td>$4,880</td></tr>
          <tr><td>$35,000</td><td>$5,000 (14%)</td><td>7.0%</td><td>72 mo</td><td>$512</td><td>$6,860</td></tr>
          <tr><td>$45,000</td><td>$9,000 (20%)</td><td>5.9%</td><td>60 mo</td><td>$696</td><td>$5,760</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Paycheck Calculator — Net Pay Estimator | clevr.tools',
    metaDescription: 'Free paycheck calculator. Enter your gross pay per period to see estimated deductions for federal tax, state tax, Social Security, and Medicare. All 50 states supported.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You just got a job offer for $75,000 a year and need to know what your actual paycheck will look like every two weeks. The gross salary sounds great, but between federal taxes, state taxes, Social Security, and Medicare, the number that hits your bank account is meaningfully lower. This calculator shows you the real number so you can budget, negotiate, or plan accordingly.</p>
      <p>It's also useful when something changes: a raise, a new W-4 filing status after getting married, a move to a different state, or an increase in your 401(k) contribution. Each of these shifts your withholding, and you want to know the impact per paycheck — not just annually. Seeing the per-period breakdown helps you adjust your monthly budget in real time.</p>
      <p>Use it to verify your actual pay stub, too. If your calculated net pay doesn't match what you're receiving, it might mean your W-4 withholding is set incorrectly, you're over-contributing to pre-tax benefits, or there's a payroll error. It happens more often than you'd expect, and catching it early can save you from a tax surprise in April.</p>

      <h2>Good to know</h2>
      <p><strong>Federal income tax uses progressive brackets.</strong> You don't pay your top rate on all income. For 2025 single filers, the first $11,925 is taxed at 10%, the next portion up to $48,475 at 12%, then 22%, 24%, 32%, 35%, and 37% on income above $626,350. Your effective rate is always lower than your marginal rate. Someone earning $75,000 has a marginal rate of 22% but an effective federal rate closer to 14%.</p>
      <p><strong>FICA taxes are flat and unavoidable.</strong> Social Security (6.2%) and Medicare (1.45%) apply to every dollar of your paycheck — no brackets, no deductions. Social Security has a wage cap ($176,100 for 2025), so high earners stop paying it partway through the year. Medicare has no cap, and earners above $200,000 pay an additional 0.9% Medicare surtax.</p>
      <p><strong>Pre-tax deductions reduce your taxable income.</strong> A 401(k) contribution of $500/paycheck doesn't cost you $500 in take-home pay. Because it's deducted pre-tax, your income tax is calculated on a lower amount. A $500 contribution at a 22% marginal rate effectively costs you $390 in take-home pay while sheltering $500 for retirement.</p>
      <p><strong>Pay frequency matters for budgeting.</strong> Biweekly (26 paychecks/year) and semi-monthly (24 paychecks/year) look similar but aren't. Biweekly gives you two "extra" paychecks per year, and some months you'll receive three paychecks instead of two. Budget based on the regular two-paycheck month and treat the extra ones as bonus savings opportunities.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Gross Salary</th><th>Filing Status</th><th>Approx. Federal Tax</th><th>FICA (7.65%)</th><th>Approx. Net (no state tax)</th></tr></thead>
        <tbody>
          <tr><td>$50,000</td><td>Single</td><td>~$5,400</td><td>$3,825</td><td>~$40,775</td></tr>
          <tr><td>$75,000</td><td>Single</td><td>~$10,300</td><td>$5,738</td><td>~$58,962</td></tr>
          <tr><td>$100,000</td><td>Single</td><td>~$15,400</td><td>$7,650</td><td>~$76,950</td></tr>
          <tr><td>$100,000</td><td>Married (joint)</td><td>~$10,400</td><td>$7,650</td><td>~$81,950</td></tr>
          <tr><td>$150,000</td><td>Single</td><td>~$27,500</td><td>$11,475</td><td>~$111,025</td></tr>
        </tbody>
      </table>
    `,
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
    metaTitle: 'Down Payment Calculator — Free Planner | clevr.tools',
    metaDescription: 'Free down payment calculator. Enter home price and percentage to see your savings goal. Compare 5%-25% amounts and monthly savings needed. No signup required.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You're starting to think about buying a home and the first question is: how much cash do I need upfront? The answer depends on the home price, the percentage you want to put down, and how long you have to save. This calculator shows the exact dollar amount at every common percentage — 3%, 5%, 10%, 15%, 20%, 25% — so you can see the full range of options instead of assuming you need 20% or nothing.</p>
      <p>It's also a savings planning tool. If you're putting away $1,500 a month toward a down payment and you have $12,000 saved, how many months until you hit your target? Factor in interest from a high-yield savings account and the timeline shortens. The calculator makes the goal concrete: this is exactly how much, saved over exactly this many months.</p>
      <p>Even if you're not buying soon, understanding down payment math helps you set long-term savings targets. A $400,000 home at 20% down requires $80,000 — a number that changes how you think about discretionary spending, investment allocation, and timeline. Knowing the number is the first step to reaching it.</p>

      <h2>Good to know</h2>
      <p><strong>20% eliminates Private Mortgage Insurance (PMI).</strong> PMI typically costs 0.5%–1% of the loan amount per year, added to your monthly payment. On a $320,000 loan (80% of $400,000), that's $133–$267/month. PMI protects the lender, not you — it drops off automatically when you reach 20% equity, but that could take years. Putting 20% down avoids it entirely.</p>
      <p><strong>You don't need 20% to buy a home.</strong> Conventional loans allow as little as 3% down (with PMI). FHA loans require 3.5% with a credit score of 580+. VA loans for veterans require 0%. USDA loans for rural areas also offer 0% down. The tradeoff is higher monthly payments and PMI, but it gets you into a home sooner.</p>
      <p><strong>A larger down payment gets you a better rate.</strong> Lenders see a bigger down payment as lower risk. The rate difference between 5% down and 20% down can be 0.25–0.5%, which on a $350,000 loan translates to $50–$100/month or $18,000–$36,000 over 30 years.</p>
      <p><strong>Don't drain your savings completely.</strong> Financial advisors recommend keeping 3–6 months of expenses as an emergency fund even after the down payment. Closing costs (2–5% of the home price) are separate from the down payment, and moving into a new home inevitably involves unexpected expenses.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Home Price</th><th>5% Down</th><th>10% Down</th><th>20% Down</th><th>PMI at 10%</th></tr></thead>
        <tbody>
          <tr><td>$250,000</td><td>$12,500</td><td>$25,000</td><td>$50,000</td><td>~$94–$188/mo</td></tr>
          <tr><td>$350,000</td><td>$17,500</td><td>$35,000</td><td>$70,000</td><td>~$131–$263/mo</td></tr>
          <tr><td>$450,000</td><td>$22,500</td><td>$45,000</td><td>$90,000</td><td>~$169–$338/mo</td></tr>
          <tr><td>$550,000</td><td>$27,500</td><td>$55,000</td><td>$110,000</td><td>~$206–$413/mo</td></tr>
          <tr><td>$700,000</td><td>$35,000</td><td>$70,000</td><td>$140,000</td><td>~$263–$525/mo</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['mortgage-calculator', 'savings-goal', 'auto-loan'],
    badge: 'new',
  },
  // ─── Health Calculators ──────────────────────────────────────────────
  {
    slug: 'calorie',
    name: 'Calorie Calculator (TDEE)',
    shortDescription: 'Calculate daily calories needed to lose, maintain, or gain weight.',
    category: 'calc',
    route: '/calc/calorie',
    acceptedFormats: [],
    icon: 'Flame',
    metaTitle: 'Calorie Calculator — TDEE & Daily Needs | clevr.tools',
    metaDescription: 'Free calorie calculator using Mifflin-St Jeor. Find your BMR, TDEE, and daily calories for weight loss, maintenance, or gain based on your stats and activity.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have decided to get intentional about your nutrition — whether that means losing fat, building muscle, or simply understanding how much fuel your body actually needs on a daily basis. The first step is knowing your Total Daily Energy Expenditure (TDEE), the total number of calories your body burns in a day including all activity. This calculator estimates your TDEE using the Mifflin-St Jeor equation, which research has shown to be the most accurate predictive formula for most adults.</p>
      <p>The process works in two stages. First, it calculates your Basal Metabolic Rate (BMR) — the calories your body would burn if you did absolutely nothing all day, just keeping your organs running and your temperature stable. Then it multiplies your BMR by an activity factor that accounts for your exercise habits and daily movement. The result is your estimated maintenance calories — eat that amount and your weight should stay roughly stable over time.</p>
      <p>From there, the math is straightforward. To lose weight, eat below your TDEE. To gain weight, eat above it. A deficit or surplus of about 500 calories per day corresponds to roughly one pound of change per week. But these are estimates, not guarantees. Your actual TDEE varies with stress, sleep, hormonal fluctuations, and day-to-day activity. Use the number as a starting point, track your results for two to three weeks, and adjust based on what actually happens on the scale.</p>

      <h2>Good to know</h2>
      <p><strong>Mifflin-St Jeor is the gold standard formula.</strong> Published in 1990 and validated in multiple studies since, it predicts BMR within about 10% for most adults. The older Harris-Benedict equation tends to overestimate by 5–15%, which is why most modern nutrition tools have moved to Mifflin-St Jeor.</p>
      <p><strong>Activity multipliers are the weakest link.</strong> The formula is only as accurate as your activity level selection. Most people overestimate how active they are. If you work a desk job and exercise three times a week, "Lightly Active" or "Moderately Active" is probably right — not "Very Active." When in doubt, choose the lower option and adjust upward if you are losing weight faster than expected.</p>
      <p><strong>Aggressive deficits backfire.</strong> Cutting calories dramatically (more than 1,000 below TDEE) can trigger metabolic adaptation — your body slows its calorie burn to conserve energy. A moderate deficit of 300–500 calories is sustainable, preserves muscle mass, and is less likely to lead to the restrict-binge cycle that derails many diet attempts.</p>
      <p><strong>TDEE changes as you do.</strong> Losing 20 pounds means your body now requires fewer calories to maintain itself. Recalculate every 10–15 pounds of change, or whenever your activity level shifts significantly. Plateaus are often just your TDEE catching up to your intake.</p>
      <p><strong>This is math, not medicine.</strong> Calorie calculators are useful planning tools, but they cannot account for medical conditions, medications, or individual metabolic variation. If you have a history of disordered eating, or if your results seem far off from reality, consult a registered dietitian who can provide personalized guidance.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Component</th><th>Formula (Mifflin-St Jeor)</th></tr></thead>
        <tbody>
          <tr><td>BMR (Men)</td><td>(10 x weight in kg) + (6.25 x height in cm) - (5 x age) + 5</td></tr>
          <tr><td>BMR (Women)</td><td>(10 x weight in kg) + (6.25 x height in cm) - (5 x age) - 161</td></tr>
          <tr><td>Sedentary</td><td>BMR x 1.2</td></tr>
          <tr><td>Lightly Active</td><td>BMR x 1.375</td></tr>
          <tr><td>Moderately Active</td><td>BMR x 1.55</td></tr>
          <tr><td>Very Active</td><td>BMR x 1.725</td></tr>
          <tr><td>Extra Active</td><td>BMR x 1.9</td></tr>
          <tr><td>Mild weight loss</td><td>TDEE - 250 cal/day (~0.5 lb/week)</td></tr>
          <tr><td>Standard weight loss</td><td>TDEE - 500 cal/day (~1 lb/week)</td></tr>
          <tr><td>Weight gain</td><td>TDEE + 250 to 500 cal/day</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['macro', 'calories-burned', 'bmi-calculator'],
    badge: 'new',
  },
  {
    slug: 'macro',
    name: 'Macro Calculator',
    shortDescription: 'Calculate daily protein, carbs, and fat grams for your calorie target.',
    category: 'calc',
    route: '/calc/macro',
    acceptedFormats: [],
    icon: 'Beef',
    metaTitle: 'Macro Calculator — Protein, Carbs & Fat | clevr.tools',
    metaDescription: 'Free macro calculator. Enter your calorie target or calculate from stats. Choose Balanced, Low-Carb, Keto, or custom ratios. Get exact protein, carb, and fat grams.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You know your calorie target — maybe 2,000 calories a day for gradual fat loss. But 2,000 calories of chicken and vegetables looks nothing like 2,000 calories of pasta and bread, and the results will be different too. Macronutrient ratios determine whether those calories support muscle retention, stable energy, and satiety or leave you hungry, flat, and losing muscle along with fat. This calculator converts your calorie target into specific gram amounts for protein, carbohydrates, and fat.</p>
      <p>The tool is especially useful when you are starting a new eating approach and need concrete numbers. Choosing "Balanced" gives you a moderate split suitable for general health. "Low-Carb" shifts calories toward protein and fat, which some people find better for appetite control. "Keto" drops carbs to 5–10% of total calories, pushing the body to rely primarily on fat for fuel. Or you can set custom percentages for any split your coach or dietitian recommends.</p>
      <p>Once you have your gram targets, the practical work begins — reading labels, weighing food, and building meals that hit your numbers. Most people find it easiest to nail protein first (it is the hardest macro to overeat and the most important for body composition), then fill in fats and carbs around it. After a few weeks, you develop an intuitive sense for portion sizes and can rely less on tracking.</p>

      <h2>Good to know</h2>
      <p><strong>Protein has the highest thermic effect.</strong> Your body uses about 20–30% of protein calories just to digest and process them, compared to 5–10% for carbs and 0–3% for fat. This means 200 calories of chicken costs your body more energy to process than 200 calories of rice — a small but real metabolic advantage.</p>
      <p><strong>Not all macro splits suit all people.</strong> Low-carb works well for sedentary individuals and those with insulin resistance. But if you do intense exercise — CrossFit, distance running, competitive sports — your muscles need glycogen, which comes from carbohydrates. Cutting carbs too aggressively while training hard leads to poor performance and fatigue.</p>
      <p><strong>Minimum fat intake matters.</strong> Dietary fat is essential for hormone production (including testosterone and estrogen), vitamin absorption (A, D, E, K are fat-soluble), and brain function. Dropping below about 0.3 grams of fat per pound of body weight can disrupt these processes. Do not sacrifice fat to make room for more carbs or protein.</p>
      <p><strong>Protein targets for muscle preservation.</strong> Research consistently supports 0.7–1.0 grams of protein per pound of body weight for people who are resistance training, especially during a caloric deficit. Going above 1.0 g/lb has not been shown to provide additional muscle-building benefits for most people.</p>
      <p><strong>Consistency trumps precision.</strong> Hitting your macros within 5–10 grams each day is plenty accurate. Food labels themselves carry a margin of error. Focus on building sustainable habits rather than agonizing over every gram.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Preset</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr></thead>
        <tbody>
          <tr><td>Balanced</td><td>30%</td><td>40%</td><td>30%</td></tr>
          <tr><td>Low-Carb</td><td>40%</td><td>20%</td><td>40%</td></tr>
          <tr><td>Keto</td><td>25%</td><td>5%</td><td>70%</td></tr>
          <tr><td>High-Protein</td><td>40%</td><td>35%</td><td>25%</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['calorie', 'calories-burned', 'bmi-calculator'],
  },
  {
    slug: 'body-fat',
    name: 'Body Fat Calculator',
    shortDescription: 'Estimate body fat percentage using the Navy method or BMI formula.',
    category: 'calc',
    route: '/calc/body-fat',
    acceptedFormats: [],
    icon: 'Activity',
    metaTitle: 'Body Fat Calculator — Navy Method & BMI | clevr.tools',
    metaDescription: 'Free body fat percentage calculator. Use the Navy tape-measure method or BMI-based estimate. Shows category (athlete, fitness, average), fat mass, and lean mass.',
    seoContent: `
      <h2>When to use this</h2>
      <p>BMI told you a number, but you suspect it is not the whole story. Maybe you lift weights and your BMI says "overweight" even though you can see your abs. Or maybe your BMI is normal but you feel softer than you would like. Body fat percentage is the metric that fills in the gap — it tells you what fraction of your total weight is fat versus lean mass (muscle, bone, water, organs). Two people at the same height and weight can have dramatically different body fat percentages and, by extension, very different health profiles.</p>
      <p>This calculator offers two estimation methods. The U.S. Navy tape-measure method uses neck, waist, and hip circumference along with height to estimate body fat. It was developed for military fitness assessments and remains one of the most accessible methods that does not require specialized equipment — just a flexible tape measure. The BMI-based method derives an estimate from your height, weight, age, and sex using a regression formula. It is less precise but requires no measurements beyond what a bathroom scale and a wall ruler provide.</p>
      <p>Neither method replaces clinical tools like DEXA scans or hydrostatic weighing, which measure body composition directly. But for tracking trends over time — seeing whether your training and nutrition are moving the needle — a consistent tape-measure estimate taken under the same conditions each week is genuinely useful. The trend matters more than any single reading.</p>

      <h2>Good to know</h2>
      <p><strong>The Navy method is surprisingly accurate for most people.</strong> Studies show it typically falls within 3–4 percentage points of DEXA scan results for individuals in the average body fat range. Accuracy decreases at the extremes — very lean athletes and individuals with obesity may see larger discrepancies.</p>
      <p><strong>Measure consistently for useful data.</strong> Take circumference measurements first thing in the morning, before eating, at the same anatomical landmarks each time. Waist at the navel, neck at the narrowest point below the Adam's apple, hips at the widest point. Small measurement inconsistencies can swing your result by several percentage points.</p>
      <p><strong>Healthy ranges differ by sex and age.</strong> Women naturally carry more essential fat than men — about 10–13% versus 2–5%. A body fat percentage of 20% means something very different for a 25-year-old male athlete than for a 50-year-old woman. The categories below reflect these differences.</p>
      <p><strong>Essential fat is not optional.</strong> Dropping below essential fat levels (roughly 5% for men, 12% for women) can disrupt hormone production, immune function, and organ protection. Competitive bodybuilders reach these levels temporarily for competition but do not sustain them year-round.</p>
      <p><strong>Body fat is one piece of the puzzle.</strong> Where you carry fat matters as much as how much you carry. Visceral fat around the organs (reflected in waist circumference) is more strongly linked to metabolic disease than subcutaneous fat under the skin. A healthcare provider can help you interpret your results in context.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Category</th><th>Men</th><th>Women</th></tr></thead>
        <tbody>
          <tr><td>Essential Fat</td><td>2 – 5%</td><td>10 – 13%</td></tr>
          <tr><td>Athletes</td><td>6 – 13%</td><td>14 – 20%</td></tr>
          <tr><td>Fitness</td><td>14 – 17%</td><td>21 – 24%</td></tr>
          <tr><td>Average</td><td>18 – 24%</td><td>25 – 31%</td></tr>
          <tr><td>Above Average</td><td>25%+</td><td>32%+</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['bmi-calculator', 'ideal-weight', 'calorie'],
  },
  {
    slug: 'due-date',
    name: 'Due Date Calculator',
    shortDescription: 'Estimate your pregnancy due date and view milestone dates.',
    category: 'calc',
    route: '/calc/due-date',
    acceptedFormats: [],
    icon: 'Baby',
    metaTitle: 'Due Date Calculator — Pregnancy Estimator | clevr.tools',
    metaDescription: 'Free due date calculator. Enter your last period, conception date, or IVF transfer date. See estimated due date, current trimester, weeks pregnant, and key milestone dates.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have just confirmed a pregnancy and the first question everyone asks — including you — is "when is the baby due?" This calculator estimates your due date using the same method your OB-GYN uses: Naegele's rule, which adds 280 days (40 weeks) to the first day of your last menstrual period (LMP). If you know your conception date instead, or if you are using IVF and have a transfer date, the calculator adjusts accordingly.</p>
      <p>Knowing your estimated due date is more than satisfying curiosity — it anchors your entire prenatal timeline. It determines when to schedule screenings (the nuchal translucency scan at 11–14 weeks, the anatomy scan at 18–22 weeks), when to start childbirth classes, when to begin maternity leave planning, and when to have your hospital bag packed. This calculator also shows milestone dates for each trimester so you can see the full map at a glance.</p>
      <p>It is worth remembering that a due date is an estimate, not an appointment. Only about 4% of babies arrive on their exact due date. Most full-term births occur within a two-week window on either side. Your provider may adjust the date after an early ultrasound, which can measure fetal size and refine the estimate. Consider the date a center point of a range, not a deadline.</p>

      <h2>Good to know</h2>
      <p><strong>Naegele's rule assumes a 28-day cycle.</strong> The formula adds 280 days from LMP, which assumes ovulation occurred on day 14 of a 28-day cycle. If your cycles are longer or shorter, your actual ovulation — and therefore your due date — may shift by several days. Women with 35-day cycles, for example, likely conceived about a week later than the formula predicts.</p>
      <p><strong>First-trimester ultrasound is the most accurate dating method.</strong> Crown-rump length measured between 8 and 13 weeks can estimate gestational age within about 5 days. If the ultrasound date differs from your LMP-based date by more than 7 days, most providers will use the ultrasound date instead.</p>
      <p><strong>IVF dates are the most precise.</strong> Because the exact day of embryo transfer is known, IVF due dates have a smaller margin of error than LMP-based estimates. For a day-5 blastocyst transfer, the due date is typically calculated as the transfer date plus 261 days.</p>
      <p><strong>Full term is a range, not a single week.</strong> The American College of Obstetricians and Gynecologists defines "early term" as 37–38 weeks, "full term" as 39–40 weeks, "late term" as 41 weeks, and "post-term" as 42 weeks and beyond. Deliveries within the full-term window are generally associated with the best outcomes.</p>
      <p><strong>This calculator is informational, not medical.</strong> It provides the same basic calculation your provider uses, but it cannot account for individual medical factors. Always confirm your due date and prenatal care plan with your healthcare team.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Milestone</th><th>Timing</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>First Trimester</td><td>Weeks 1 – 12</td><td>Organ formation, early screenings</td></tr>
          <tr><td>Second Trimester</td><td>Weeks 13 – 26</td><td>Anatomy scan, gender reveal possible</td></tr>
          <tr><td>Third Trimester</td><td>Weeks 27 – 40</td><td>Growth, positioning, delivery prep</td></tr>
          <tr><td>Viability milestone</td><td>~24 weeks</td><td>Survival outside womb becomes possible</td></tr>
          <tr><td>Early Term</td><td>37 – 38 weeks</td><td>Lungs typically mature by 36–37 weeks</td></tr>
          <tr><td>Full Term</td><td>39 – 40 weeks</td><td>Optimal delivery window</td></tr>
          <tr><td>Post-Term</td><td>42+ weeks</td><td>Induction typically discussed</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['ovulation', 'age-calculator', 'date-difference'],
  },
  {
    slug: 'ovulation',
    name: 'Ovulation Calculator',
    shortDescription: 'Predict your fertile window and ovulation dates for the next 3 months.',
    category: 'calc',
    route: '/calc/ovulation',
    acceptedFormats: [],
    icon: 'Heart',
    metaTitle: 'Ovulation Calculator — Fertile Window Free | clevr.tools',
    metaDescription: 'Free ovulation calculator. Enter your last period start date and cycle length. See your next ovulation date, fertile window, and a 3-month cycle forecast.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Whether you are trying to conceive or simply want to understand your cycle better, knowing when you ovulate is the single most important piece of the fertility puzzle. An egg is viable for only about 12–24 hours after release, but sperm can survive in the reproductive tract for up to five days. That creates a fertile window of roughly six days per cycle — the five days before ovulation and the day of ovulation itself. This calculator estimates that window based on your cycle length and the date of your last period.</p>
      <p>The calculator uses the standard clinical assumption that ovulation occurs about 14 days before your next period is expected. For a 28-day cycle, that is day 14. For a 32-day cycle, that is day 18. It projects three months of estimated fertile windows so you can plan ahead rather than recalculating every month. Many couples use this alongside ovulation predictor kits (OPKs) and basal body temperature tracking for a more complete picture.</p>
      <p>This tool provides estimates based on averages, and individual cycles can vary. Stress, travel, illness, and hormonal shifts can all move your ovulation day earlier or later. If you have been trying to conceive for 12 months (or 6 months if you are over 35) without success, consult a fertility specialist who can use ultrasound and bloodwork to pinpoint ovulation precisely.</p>

      <h2>Good to know</h2>
      <p><strong>The fertile window is narrower than most people think.</strong> You can only conceive during about six days per cycle. Timing intercourse within this window — particularly the two to three days leading up to ovulation — gives you the highest probability of conception. The day after ovulation, the window is effectively closed for that cycle.</p>
      <p><strong>Cycle length varies, and that is normal.</strong> A "normal" cycle ranges from 21 to 35 days. If your cycle length fluctuates by a few days each month, your ovulation day shifts accordingly. The luteal phase (time from ovulation to your period) is relatively stable at 12–16 days, so most variation happens in the follicular phase before ovulation.</p>
      <p><strong>Ovulation predictor kits detect the LH surge.</strong> A sudden spike in luteinizing hormone (LH) typically occurs 24–36 hours before ovulation. OPKs detect this surge in urine and can confirm that the calendar estimate from this calculator is in the right ballpark for your body.</p>
      <p><strong>Basal body temperature confirms ovulation after the fact.</strong> Your resting temperature rises by about 0.5–1.0°F after ovulation and stays elevated until your next period. This confirms that ovulation occurred but does not predict it in advance — which is why the calendar method and OPKs are better for planning.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Cycle Length</th><th>Estimated Ovulation Day</th><th>Fertile Window</th></tr></thead>
        <tbody>
          <tr><td>21 days</td><td>Day 7</td><td>Days 2 – 7</td></tr>
          <tr><td>24 days</td><td>Day 10</td><td>Days 5 – 10</td></tr>
          <tr><td>26 days</td><td>Day 12</td><td>Days 7 – 12</td></tr>
          <tr><td>28 days</td><td>Day 14</td><td>Days 9 – 14</td></tr>
          <tr><td>30 days</td><td>Day 16</td><td>Days 11 – 16</td></tr>
          <tr><td>32 days</td><td>Day 18</td><td>Days 13 – 18</td></tr>
          <tr><td>35 days</td><td>Day 21</td><td>Days 16 – 21</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['due-date', 'age-calculator', 'date-difference'],
  },
  {
    slug: 'ideal-weight',
    name: 'Ideal Weight Calculator',
    shortDescription: 'Compare ideal weight estimates from multiple medical formulas.',
    category: 'calc',
    route: '/calc/ideal-weight',
    acceptedFormats: [],
    icon: 'Scale',
    metaTitle: 'Ideal Weight Calculator — Free Online Tool | clevr.tools',
    metaDescription: 'Free ideal weight calculator comparing Devine, Robinson, Miller, and Hamwi formulas. Shows healthy BMI range and adjusts for body frame size.',
    seoContent: `
      <h2>When to use this</h2>
      <p>The question "what should I weigh?" has no single correct answer, and that is precisely why this calculator shows you results from four different medical formulas rather than just one. The Devine, Robinson, Miller, and Hamwi formulas were each developed in different decades for different clinical purposes, and they can disagree by 10–20 pounds for the same person. Seeing the range gives you a more honest picture than any single number could.</p>
      <p>These formulas are most commonly used in clinical settings for medication dosing (many drug doses are calculated based on ideal body weight), ventilator settings, and nutritional assessments. If a doctor has mentioned your "ideal body weight," they were likely using the Devine formula — it is the most widely referenced in medical practice, even though it was originally designed for drug calculations, not as a health recommendation.</p>
      <p>For personal use, the healthy BMI weight range (the range of weights that would place your BMI between 18.5 and 24.9) is often more useful than any single formula. It gives you a window — typically a 30-to-40-pound span — rather than a single target, which better reflects the reality that healthy bodies come in many shapes. Frame size adjustments in this calculator further refine the range based on whether you have a small, medium, or large skeletal frame.</p>

      <h2>Good to know</h2>
      <p><strong>These formulas are height-based, not body-based.</strong> All four formulas use only height and sex as inputs. They know nothing about your muscle mass, bone density, body fat distribution, age, or fitness level. A sedentary 5'10" person and a competitive 5'10" athlete get the same "ideal weight," which should tell you how loosely to hold these numbers.</p>
      <p><strong>The formulas disagree — and that is the point.</strong> Devine tends to produce the lowest estimates for women, Miller the highest. Robinson and Hamwi fall in between. Rather than picking the one you like best, look at the full range. If all four formulas agree you are well above or below the range, that is more meaningful than any single result.</p>
      <p><strong>Frame size matters more than people realize.</strong> Someone with a large frame (wider wrists, broader shoulders, thicker bones) genuinely weighs more at the same height than a small-framed person — and should. Wrist circumference is the simplest proxy for frame size: below 6.5 inches for men or 5.5 inches for women typically indicates a small frame.</p>
      <p><strong>"Ideal" is a loaded word.</strong> These formulas describe statistical midpoints, not aspirational targets. Your healthiest weight depends on factors no formula can capture — how you feel, how you function, your bloodwork, your relationship with food, and your individual medical history. Use the numbers as reference points, not verdicts.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Formula</th><th>Year</th><th>Men (base + per inch over 5')</th><th>Women (base + per inch over 5')</th></tr></thead>
        <tbody>
          <tr><td>Devine</td><td>1974</td><td>110 lb + 5.1 lb/in</td><td>100 lb + 5.1 lb/in</td></tr>
          <tr><td>Robinson</td><td>1983</td><td>114 lb + 4.2 lb/in</td><td>108 lb + 3.5 lb/in</td></tr>
          <tr><td>Miller</td><td>1983</td><td>123 lb + 3.1 lb/in</td><td>119 lb + 3.5 lb/in</td></tr>
          <tr><td>Hamwi</td><td>1964</td><td>106 lb + 6.0 lb/in</td><td>100 lb + 5.0 lb/in</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['bmi-calculator', 'body-fat', 'calorie'],
  },
  {
    slug: 'calories-burned',
    name: 'Calories Burned Calculator',
    shortDescription: 'Calculate calories burned for 29 activities using MET values.',
    category: 'calc',
    route: '/calc/calories-burned',
    acceptedFormats: [],
    icon: 'Dumbbell',
    metaTitle: 'Calories Burned Calculator — Free Tool | clevr.tools',
    metaDescription: 'Free calories burned calculator for 29 activities. Enter your weight, choose an activity, and set duration. Uses MET values for accurate estimates.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You just finished a 45-minute bike ride and want to know roughly how many calories it cost you. Or you are planning your week and trying to decide between a 30-minute run and an hour of yoga, and you want to compare the energy expenditure. This calculator uses MET values — Metabolic Equivalent of Task — to estimate calories burned for 29 different activities based on your body weight and exercise duration.</p>
      <p>MET values come from the Compendium of Physical Activities, a research database maintained by Arizona State University that assigns an energy cost to hundreds of activities. A MET of 1.0 equals your resting metabolic rate. An activity with a MET of 8.0 burns roughly eight times more energy per minute than sitting still. The formula is simple: calories burned = MET x body weight in kg x duration in hours.</p>
      <p>These estimates are useful for general planning — understanding that vigorous cycling burns roughly three times as many calories per minute as walking gives you practical information for structuring your week. But they are estimates, not measurements. Heart rate, fitness level, terrain, temperature, and individual physiology all influence actual calorie burn. Wearable devices with heart rate monitors get closer to reality, but even those carry a margin of error of 15–30%.</p>

      <h2>Good to know</h2>
      <p><strong>Heavier people burn more calories doing the same activity.</strong> A 200-pound person running at the same pace as a 140-pound person will burn roughly 40% more calories. The body has to move more mass, which requires more energy. This is built into the MET formula — weight is a direct multiplier.</p>
      <p><strong>MET values assume a specific intensity.</strong> "Running" might mean a casual 10-minute-mile jog or a competitive 6-minute-mile effort. The MET values in this calculator represent typical moderate efforts for each activity. If you are going significantly harder or easier than average, your actual burn will differ.</p>
      <p><strong>Exercise calories are smaller than you think.</strong> A common trap is overestimating exercise burn and "eating back" the calories. A 30-minute jog for a 155-pound person burns roughly 300 calories — less than a large bagel with cream cheese. Exercise is essential for health, but weight management is primarily driven by what and how much you eat.</p>
      <p><strong>EPOC adds a small bonus.</strong> After intense exercise, your body continues burning calories at an elevated rate for hours — this is called Excess Post-Exercise Oxygen Consumption. High-intensity interval training and heavy resistance training produce the largest EPOC effect, adding roughly 6–15% to the total session burn.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Activity</th><th>MET Value</th><th>Cal/30 min (155 lb)</th></tr></thead>
        <tbody>
          <tr><td>Walking (3.5 mph)</td><td>4.3</td><td>~150</td></tr>
          <tr><td>Running (6 mph)</td><td>9.8</td><td>~345</td></tr>
          <tr><td>Cycling (moderate)</td><td>8.0</td><td>~280</td></tr>
          <tr><td>Swimming (moderate)</td><td>7.0</td><td>~245</td></tr>
          <tr><td>Jump Rope</td><td>12.3</td><td>~430</td></tr>
          <tr><td>Yoga</td><td>3.0</td><td>~105</td></tr>
          <tr><td>Weight Training</td><td>6.0</td><td>~210</td></tr>
          <tr><td>Rowing (moderate)</td><td>7.0</td><td>~245</td></tr>
          <tr><td>Hiking</td><td>6.0</td><td>~210</td></tr>
          <tr><td>Dancing</td><td>5.5</td><td>~195</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['calorie', 'macro', 'pace'],
  },
  {
    slug: 'sleep',
    name: 'Sleep Calculator',
    shortDescription: 'Find optimal bedtimes or wake times based on 90-minute sleep cycles.',
    category: 'calc',
    route: '/calc/sleep',
    acceptedFormats: [],
    icon: 'Moon',
    metaTitle: 'Sleep Calculator — Bedtime & Wake Planner | clevr.tools',
    metaDescription: 'Free sleep calculator. Enter your wake-up time or bedtime to find optimal sleep times based on 90-minute sleep cycles. Avoid waking during deep sleep.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Your alarm goes off and you feel terrible — groggy, disoriented, like you could sleep another three hours. Yet some mornings you wake up feeling sharp after what seemed like less sleep. The difference often is not how long you slept but when you woke up relative to your sleep cycles. Each cycle lasts roughly 90 minutes, moving from light sleep through deep sleep and into REM. Waking during deep sleep produces that awful "sleep inertia" feeling. Waking at the end of a complete cycle — during light sleep — feels dramatically better.</p>
      <p>This calculator works in both directions. Enter your desired wake-up time and it suggests bedtimes that align with complete 90-minute cycles (plus about 15 minutes to fall asleep). Or enter your bedtime and it shows you the wake-up times that would land at the end of a cycle. You get multiple options — typically 4, 5, or 6 complete cycles — so you can choose based on what your schedule allows.</p>
      <p>The 90-minute figure is an average. Individual cycle lengths range from about 70 to 120 minutes and can vary even within the same night — early cycles tend to have more deep sleep, while later cycles are heavier on REM. The calculator gives you a solid starting framework, but pay attention to how you feel and adjust by 15–20 minutes if needed. Over time, you will learn your body's natural rhythm.</p>

      <h2>Good to know</h2>
      <p><strong>Sleep need varies by age.</strong> The National Sleep Foundation recommends 7–9 hours for adults (26–64), 7–8 hours for older adults (65+), and 8–10 hours for teenagers. Those ranges correspond to 5–6 complete sleep cycles for most adults. Consistently getting fewer than 5 cycles (about 7.5 hours including fall-asleep time) can lead to cumulative sleep debt.</p>
      <p><strong>The 15-minute fall-asleep buffer matters.</strong> This calculator adds about 15 minutes to your bedtime to account for the time it takes to actually fall asleep. If you typically fall asleep faster or slower, mentally adjust. If it regularly takes you more than 30 minutes to fall asleep, that itself may be worth discussing with a healthcare provider.</p>
      <p><strong>Consistency beats perfection.</strong> Going to bed and waking up at the same time every day — including weekends — is the single most impactful change for sleep quality. Your circadian rhythm adapts to a consistent schedule, making it easier to fall asleep quickly and wake up feeling alert. Weekend sleep-ins of more than an hour create "social jet lag" that disrupts this rhythm.</p>
      <p><strong>Deep sleep is front-loaded.</strong> The first two to three sleep cycles contain the most deep (slow-wave) sleep, which is critical for physical recovery, immune function, and memory consolidation. This means the early hours of sleep are disproportionately valuable — cutting your sleep short by an hour primarily costs you REM sleep, while going to bed an hour late costs you deep sleep.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Cycles</th><th>Total Sleep Time</th><th>Bed-to-Wake Duration</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td>3 cycles</td><td>4.5 hours</td><td>~4 hr 45 min</td><td>Emergency nap (not sustainable)</td></tr>
          <tr><td>4 cycles</td><td>6 hours</td><td>~6 hr 15 min</td><td>Minimum for function</td></tr>
          <tr><td>5 cycles</td><td>7.5 hours</td><td>~7 hr 45 min</td><td>Recommended for most adults</td></tr>
          <tr><td>6 cycles</td><td>9 hours</td><td>~9 hr 15 min</td><td>Recovery or high-training days</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['calorie', 'age-calculator', 'date-difference'],
    badge: 'new',
  },
  {
    slug: 'pace',
    name: 'Pace Calculator',
    shortDescription: 'Calculate running pace, finish time, or distance for any race.',
    category: 'calc',
    route: '/calc/pace',
    acceptedFormats: [],
    icon: 'Footprints',
    metaTitle: 'Pace Calculator — Running Pace & Splits | clevr.tools',
    metaDescription: 'Free pace calculator for runners. Calculate pace per mile/km, finish time, or distance. Includes splits table and race presets for 5K, 10K, half marathon, and marathon.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have signed up for a half marathon and your goal is to finish under two hours. What pace per mile do you need to hold? Or you ran 5 kilometers in 27 minutes on your last training run and want to know your per-mile and per-kilometer splits. This calculator solves the three-variable relationship between pace, distance, and time — give it any two, and it returns the third.</p>
      <p>Runners use pace calculators constantly during training blocks. You might need to figure out your target pace for a tempo run (typically 25–30 seconds per mile faster than race pace), your easy-day pace (usually 1–2 minutes per mile slower than race pace), or what finish time you can expect if you hold your current training pace over the full race distance. Race presets for 5K, 10K, half marathon, and marathon eliminate the need to remember exact distances.</p>
      <p>The splits table is particularly useful for race-day planning. Rather than just knowing your average pace, you can see your expected time at each mile marker. Many runners tape their splits to their wrist or enter them into a GPS watch. Going out too fast in the first miles is the most common race-day mistake, and having concrete split targets helps you stay disciplined.</p>

      <h2>Good to know</h2>
      <p><strong>Even pacing is almost always the fastest strategy.</strong> Running the first half of a race at the same pace as the second half — or slightly slower — produces better finish times than starting fast and fading. The exception is downhill courses or races with significant wind changes, where terrain may dictate pace adjustments.</p>
      <p><strong>Pace per mile and pace per kilometer feel different than you expect.</strong> An 8:00/mile pace equals roughly 4:58/km. If you train with one unit and race with the other, make sure you convert in advance so you are not confused by mile-marker clocks or GPS readings on race day.</p>
      <p><strong>Temperature affects pace more than most runners realize.</strong> For every 10°F above 55°F, expect your pace to slow by about 1.5–3% — a pace that feels easy at 50°F becomes noticeably harder at 80°F. Adjust your target pace on hot days rather than pushing through and risking a blow-up in the later miles.</p>
      <p><strong>The relationship between 5K and marathon pace.</strong> As a rough rule, your marathon pace is typically 15–20% slower than your 5K pace. If you can run a 24-minute 5K (7:44/mi), a realistic marathon target is around 9:00–9:15/mi, or about a 3:56–4:02 finish.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Race</th><th>Distance</th><th>Common Goal Times</th><th>Pace Required</th></tr></thead>
        <tbody>
          <tr><td>5K</td><td>3.1 mi</td><td>25:00</td><td>8:03/mi</td></tr>
          <tr><td>5K</td><td>3.1 mi</td><td>30:00</td><td>9:40/mi</td></tr>
          <tr><td>10K</td><td>6.2 mi</td><td>50:00</td><td>8:03/mi</td></tr>
          <tr><td>10K</td><td>6.2 mi</td><td>60:00</td><td>9:40/mi</td></tr>
          <tr><td>Half Marathon</td><td>13.1 mi</td><td>1:45:00</td><td>8:01/mi</td></tr>
          <tr><td>Half Marathon</td><td>13.1 mi</td><td>2:00:00</td><td>9:09/mi</td></tr>
          <tr><td>Marathon</td><td>26.2 mi</td><td>3:30:00</td><td>8:01/mi</td></tr>
          <tr><td>Marathon</td><td>26.2 mi</td><td>4:00:00</td><td>9:09/mi</td></tr>
          <tr><td>Marathon</td><td>26.2 mi</td><td>4:30:00</td><td>10:18/mi</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['calories-burned', 'calorie', 'bmi-calculator'],
  },
  // ─── General Unit Converters ─────────────────────────────────────────
  {
    slug: 'convert-length',
    name: 'Length Converter',
    shortDescription: 'Convert between meters, feet, inches, miles, kilometers, and more.',
    category: 'calc',
    route: '/calc/convert/length',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'Length Converter — Meters, Feet & Miles | clevr.tools',
    metaDescription: 'Free length converter. Convert between millimeters, centimeters, meters, kilometers, inches, feet, yards, miles, and nautical miles instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Length is the most commonly converted physical quantity, and this converter handles the full range: millimeters, centimeters, meters, kilometers, inches, feet, yards, miles, and nautical miles. Whether you are converting room dimensions from feet to meters for an IKEA order, figuring out how many kilometers a 10-mile run is, or converting nautical miles for a boating trip, this tool covers every practical length conversion in a single place.</p>
      <p>The most searched length conversions are cm to inches, feet to meters, miles to km, and mm to inches. If you need just one of those pairs, we have dedicated converters for each. But when you are working across multiple units — say, converting a height from feet and inches to centimeters for a European form — having all units in one place is more efficient than jumping between tools.</p>

      <h2>Good to know</h2>
      <p><strong>All imperial-metric length conversions stem from one definition.</strong> 1 inch = 25.4 mm exactly. Every other conversion (feet to meters, miles to km, yards to meters) derives from this single defined relationship. There is no rounding error in the fundamental factor.</p>
      <p><strong>A nautical mile is based on Earth's geometry.</strong> One nautical mile equals one minute of arc of latitude — about 1,852 meters or 1.151 statute miles. This is why nautical miles are used in aviation and maritime navigation: they tie directly to the coordinate system used for global positioning.</p>
      <p><strong>The meter is now defined by the speed of light.</strong> Since 1983, one meter is the distance light travels in a vacuum in 1/299,792,458 of a second. This makes it one of the most precisely defined units in science — far more precise than any physical artifact could provide.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>Inches</td><td>Centimeters</td><td>2.54</td></tr>
          <tr><td>Feet</td><td>Meters</td><td>0.3048</td></tr>
          <tr><td>Yards</td><td>Meters</td><td>0.9144</td></tr>
          <tr><td>Miles</td><td>Kilometers</td><td>1.6093</td></tr>
          <tr><td>Centimeters</td><td>Inches</td><td>0.3937</td></tr>
          <tr><td>Meters</td><td>Feet</td><td>3.2808</td></tr>
          <tr><td>Kilometers</td><td>Miles</td><td>0.6214</td></tr>
          <tr><td>Millimeters</td><td>Inches</td><td>0.03937</td></tr>
          <tr><td>Nautical miles</td><td>Kilometers</td><td>1.852</td></tr>
          <tr><td>Nautical miles</td><td>Statute miles</td><td>1.1508</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-area', 'cm-to-inches', 'feet-to-meters'],
  },
  {
    slug: 'convert-weight',
    name: 'Weight Converter',
    shortDescription: 'Convert between kilograms, pounds, ounces, grams, and stone.',
    category: 'calc',
    route: '/calc/convert/weight',
    acceptedFormats: [],
    icon: 'Weight',
    metaTitle: 'Weight Converter — KG, Pounds & Ounces | clevr.tools',
    metaDescription: 'Free weight converter. Convert between milligrams, grams, kilograms, metric tons, ounces, pounds, and stone instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Weight (or more precisely, mass) is the second most commonly converted physical quantity after length. You need it when buying produce at a European market that sells in kilograms, comparing your body weight between a US doctor (pounds) and an international form (kilograms), checking airline baggage limits, or converting recipe ingredients between ounces and grams. This converter handles milligrams, grams, kilograms, metric tons, ounces, pounds, and stone.</p>
      <p>The most frequently searched weight conversions are kg to lbs, lbs to kg, oz to grams, and stone to pounds. Stone (14 pounds per stone) is still commonly used for body weight in the UK and Ireland. If you need just one specific pair, we have dedicated converters for kg-to-lbs, lbs-to-kg, and oz-to-grams. This tool is best when you need to convert across multiple units or uncommon pairs.</p>

      <h2>Good to know</h2>
      <p><strong>1 kg = 2.20462 lbs is the most useful conversion to memorize.</strong> For quick mental math: double the kilograms and add 10%. So 75 kg becomes 150 + 15 = 165 lbs (actual: 165.3 lbs). This shortcut works reliably across the full range of practical weights.</p>
      <p><strong>The UK uses stone for body weight, which confuses everyone else.</strong> If a British person says they weigh "11 stone 4," that is 158 pounds (11 x 14 + 4) or 71.7 kg. Stone is rarely used outside body weight, and even in the UK, younger people are increasingly using kilograms.</p>
      <p><strong>Metric tons and imperial tons are close but not identical.</strong> A metric ton (tonne) is exactly 1,000 kg (2,204.6 lbs). A US short ton is 2,000 lbs (907.2 kg). A UK long ton is 2,240 lbs (1,016.0 kg). When someone says "a ton," always ask which one — the difference between a short ton and a metric ton is about 10%.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>Ounces</td><td>Grams</td><td>28.3495</td></tr>
          <tr><td>Pounds</td><td>Kilograms</td><td>0.45359</td></tr>
          <tr><td>Pounds</td><td>Ounces</td><td>16</td></tr>
          <tr><td>Kilograms</td><td>Pounds</td><td>2.20462</td></tr>
          <tr><td>Grams</td><td>Ounces</td><td>0.03527</td></tr>
          <tr><td>Stone</td><td>Pounds</td><td>14</td></tr>
          <tr><td>Stone</td><td>Kilograms</td><td>6.35029</td></tr>
          <tr><td>Metric ton</td><td>Pounds</td><td>2,204.62</td></tr>
          <tr><td>Metric ton</td><td>US short ton</td><td>1.10231</td></tr>
          <tr><td>Milligrams</td><td>Grams</td><td>0.001</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'kg-to-lbs', 'oz-to-grams'],
  },
  {
    slug: 'convert-temperature',
    name: 'Temperature Converter',
    shortDescription: 'Convert between Celsius, Fahrenheit, and Kelvin.',
    category: 'calc',
    route: '/calc/convert/temperature',
    acceptedFormats: [],
    icon: 'Thermometer',
    metaTitle: 'Temperature Converter — C, F & Kelvin | clevr.tools',
    metaDescription: 'Free temperature converter. Convert between Celsius, Fahrenheit, and Kelvin instantly. Quick reference table included.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Temperature is one of the most frequently converted units because the US, Belize, and a handful of other countries use Fahrenheit while the rest of the world uses Celsius. Every time you check weather abroad, follow an international recipe, or read a scientific paper, you may need to convert. This tool handles Celsius, Fahrenheit, and Kelvin — covering everyday, cooking, and scientific needs in one place.</p>
      <p>The most searched temperature conversion is Fahrenheit to Celsius (and vice versa). Kelvin is primarily used in science and engineering — it starts at absolute zero (-273.15°C) and uses the same degree size as Celsius, making conversion between the two a simple addition or subtraction of 273.15. If you only need F-to-C, we have a dedicated converter for that too.</p>

      <h2>Good to know</h2>
      <p><strong>Temperature conversions are not simple multiplications.</strong> Unlike length or weight (where you just multiply by a factor), temperature involves both multiplication and an offset. C = (F - 32) x 5/9. K = C + 273.15. This makes mental math harder, which is why a converter is more useful for temperature than almost any other unit.</p>
      <p><strong>Celsius and Fahrenheit agree at -40°.</strong> At exactly -40 degrees, both scales read the same number. Above -40, Fahrenheit numbers are always higher. At 0°C (32°F) water freezes; at 100°C (212°F) it boils. These are the anchor points for the Celsius scale.</p>
      <p><strong>Kelvin has no negative numbers.</strong> Zero kelvin is absolute zero — the lowest possible temperature where all molecular motion stops. It is -273.15°C or -459.67°F. Nothing in the universe has ever been cooled to exactly 0 K, though laboratories have gotten within billionths of a degree.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>°F</th><th>°C</th><th>K</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>-459.67</td><td>-273.15</td><td>0</td><td>Absolute zero</td></tr>
          <tr><td>-40</td><td>-40</td><td>233.15</td><td>Scales intersect</td></tr>
          <tr><td>0</td><td>-17.78</td><td>255.37</td><td>Cold winter day</td></tr>
          <tr><td>32</td><td>0</td><td>273.15</td><td>Water freezes</td></tr>
          <tr><td>68</td><td>20</td><td>293.15</td><td>Room temperature</td></tr>
          <tr><td>98.6</td><td>37</td><td>310.15</td><td>Body temperature</td></tr>
          <tr><td>212</td><td>100</td><td>373.15</td><td>Water boils</td></tr>
          <tr><td>350</td><td>176.67</td><td>449.82</td><td>Baking</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['fahrenheit-to-celsius', 'convert-length', 'convert-weight'],
  },
  {
    slug: 'convert-volume',
    name: 'Volume Converter',
    shortDescription: 'Convert between liters, gallons, cups, fluid ounces, and more.',
    category: 'calc',
    route: '/calc/convert/volume',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Volume Converter — Liters, Gallons & Cups | clevr.tools',
    metaDescription: 'Free volume converter. Convert between milliliters, liters, gallons, quarts, pints, cups, fluid ounces, tablespoons, and teaspoons.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are buying a fish tank rated in liters but your space calculations are in gallons. Or you are scaling a cocktail recipe from fluid ounces to milliliters for a larger batch. Or you are trying to figure out how many cups are in a quart because the recipe your grandmother wrote by hand uses both. Volume conversion comes up constantly in cooking, beverages, aquariums, automotive (fuel tanks, oil capacity), cleaning supplies, and gardening.</p>
      <p>This converter handles milliliters, liters, US gallons, quarts, pints, cups, fluid ounces, tablespoons, and teaspoons. The most commonly searched volume conversions are liters to gallons, cups to mL, and fluid ounces to mL. For cooking-specific conversions, we also have a dedicated cooking converter.</p>

      <h2>Good to know</h2>
      <p><strong>US and imperial volumes differ significantly.</strong> A US gallon is 3.785 liters; an imperial gallon is 4.546 liters — about 20% more. This extends to pints, cups, and fluid ounces as well. A British pint is 568 mL, while a US pint is 473 mL. When a British recipe says "a pint of milk," they mean more than an American would.</p>
      <p><strong>1 liter = 1,000 mL = 1,000 cubic centimeters.</strong> This elegant relationship is one of the metric system's strengths. A cube 10 cm on each side holds exactly 1 liter. And 1 liter of water weighs almost exactly 1 kilogram at standard temperature — another deliberate metric system connection.</p>
      <p><strong>Fluid ounces measure volume, not weight.</strong> Despite sharing the name "ounce" with the weight unit, fluid ounces measure volume. A fluid ounce of water weighs about 1.04 weight ounces. A fluid ounce of honey weighs about 1.5 weight ounces. The name overlap causes endless confusion.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>1 teaspoon</td><td>Milliliters</td><td>4.929</td></tr>
          <tr><td>1 tablespoon</td><td>Milliliters</td><td>14.787</td></tr>
          <tr><td>1 fluid ounce</td><td>Milliliters</td><td>29.574</td></tr>
          <tr><td>1 cup (US)</td><td>Milliliters</td><td>236.588</td></tr>
          <tr><td>1 pint (US)</td><td>Liters</td><td>0.473</td></tr>
          <tr><td>1 quart (US)</td><td>Liters</td><td>0.946</td></tr>
          <tr><td>1 gallon (US)</td><td>Liters</td><td>3.785</td></tr>
          <tr><td>1 liter</td><td>US gallons</td><td>0.264</td></tr>
          <tr><td>1 liter</td><td>US cups</td><td>4.227</td></tr>
          <tr><td>1 liter</td><td>Fluid ounces</td><td>33.814</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-cooking', 'liters-to-gallons', 'cups-to-ml'],
  },
  {
    slug: 'convert-area',
    name: 'Area Converter',
    shortDescription: 'Convert between square meters, square feet, acres, and hectares.',
    category: 'calc',
    route: '/calc/convert/area',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Area Converter — Sq Ft, Acres & Hectares | clevr.tools',
    metaDescription: 'Free area converter. Convert between square millimeters, centimeters, meters, kilometers, miles, yards, feet, inches, acres, and hectares.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are comparing real estate listings across different countries — one in square feet, another in square meters, a rural property in acres, and a European parcel in hectares. Or you are calculating flooring material for a room measured in feet but sold by the square meter. Area conversion comes up in real estate, construction, agriculture, landscaping, and any project that involves surfaces crossing between imperial and metric systems.</p>
      <p>The most frequently searched area conversions are square feet to square meters (and vice versa), acres to square feet, and hectares to acres. This converter handles all of them plus less common units like square kilometers, square miles, square yards, and square inches. The most common pair — square feet to square meters — uses the factor 1 sq ft = 0.0929 sq m, or equivalently 1 sq m = 10.764 sq ft.</p>

      <h2>Good to know</h2>
      <p><strong>Area conversion factors are the square of length factors.</strong> Because 1 foot = 0.3048 meters, 1 square foot = 0.3048² = 0.0929 square meters. This means small rounding errors in length conversions get amplified when you square them — always use the full precision factor for area calculations.</p>
      <p><strong>Acres and hectares are the most-confused pair.</strong> 1 hectare = 2.471 acres, or roughly 2.5 acres. Hectares are used in most of the world for land measurement; acres are used in the US, UK, and a few other countries. In agriculture, a hectare is about the size of a regulation rugby field.</p>
      <p><strong>Square footage is king in US real estate.</strong> Home sizes, lot sizes, and rental prices per square foot are the standard metrics. In most other countries, square meters serve the same role. Knowing that 1,000 sq ft is about 93 sq m gives you a quick mental anchor for comparing properties internationally.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>Square feet</td><td>Square meters</td><td>0.0929</td></tr>
          <tr><td>Square meters</td><td>Square feet</td><td>10.7639</td></tr>
          <tr><td>Acres</td><td>Square feet</td><td>43,560</td></tr>
          <tr><td>Acres</td><td>Hectares</td><td>0.4047</td></tr>
          <tr><td>Hectares</td><td>Acres</td><td>2.4711</td></tr>
          <tr><td>Square miles</td><td>Square km</td><td>2.59</td></tr>
          <tr><td>Square km</td><td>Square miles</td><td>0.3861</td></tr>
          <tr><td>Square yards</td><td>Square meters</td><td>0.8361</td></tr>
          <tr><td>Square inches</td><td>Square cm</td><td>6.4516</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'acres-to-sq-ft', 'convert-weight'],
  },
  {
    slug: 'convert-speed',
    name: 'Speed Converter',
    shortDescription: 'Convert between mph, km/h, m/s, knots, and ft/s.',
    category: 'calc',
    route: '/calc/convert/speed',
    acceptedFormats: [],
    icon: 'Gauge',
    metaTitle: 'Speed Converter — MPH, KM/H & Knots | clevr.tools',
    metaDescription: 'Free speed converter. Convert between meters per second, kilometers per hour, miles per hour, knots, and feet per second.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are driving in Europe and the speed limit sign says 130 — that is km/h, but how fast is that in mph? Or you are reading a weather report about wind speeds in knots and want to understand the real-world impact in miles per hour. Or a physics problem gives velocity in meters per second and you need km/h. Speed conversion comes up in driving abroad, aviation, sailing, meteorology, physics, and sports.</p>
      <p>The most commonly searched speed conversions are mph to km/h, km/h to mph, and knots to mph. This converter handles all of these plus meters per second (the SI unit) and feet per second. The key relationships: 1 mph = 1.609 km/h, 1 knot = 1.151 mph, and 1 m/s = 3.6 km/h.</p>

      <h2>Good to know</h2>
      <p><strong>Quick mph-to-km/h estimate: multiply by 1.6.</strong> 60 mph is about 97 km/h. 100 km/h is about 62 mph. For most driving situations, these estimates are close enough to understand speed limit signs in another country.</p>
      <p><strong>A knot is one nautical mile per hour.</strong> Knots are used in aviation and maritime because they tie directly to the latitude/longitude coordinate system. One knot = 1.852 km/h = 1.151 mph. When a pilot reports airspeed in knots, they are describing movement relative to the coordinate grid of the Earth.</p>
      <p><strong>Meters per second puts everyday speeds in perspective.</strong> Walking speed is about 1.4 m/s. A fast sprint is about 10 m/s. Highway driving at 70 mph is about 31 m/s. The speed of sound at sea level is about 343 m/s. Using m/s helps you understand the physics behind familiar experiences.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>MPH</th><th>KM/H</th><th>M/S</th><th>Knots</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>3.1</td><td>5</td><td>1.4</td><td>2.7</td><td>Walking</td></tr>
          <tr><td>12.4</td><td>20</td><td>5.6</td><td>10.8</td><td>Cycling</td></tr>
          <tr><td>30</td><td>48.3</td><td>13.4</td><td>26.1</td><td>City driving</td></tr>
          <tr><td>60</td><td>96.6</td><td>26.8</td><td>52.1</td><td>Highway driving</td></tr>
          <tr><td>70</td><td>112.7</td><td>31.3</td><td>60.8</td><td>US interstate limit</td></tr>
          <tr><td>80.8</td><td>130</td><td>36.1</td><td>70.2</td><td>EU motorway limit</td></tr>
          <tr><td>100</td><td>160.9</td><td>44.7</td><td>86.9</td><td>Fast driving</td></tr>
          <tr><td>767</td><td>1,235</td><td>343</td><td>667</td><td>Speed of sound</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'pace', 'convert-time'],
  },
  {
    slug: 'convert-time',
    name: 'Time Converter',
    shortDescription: 'Convert between seconds, minutes, hours, days, weeks, and years.',
    category: 'calc',
    route: '/calc/convert/time',
    acceptedFormats: [],
    icon: 'Clock',
    metaTitle: 'Time Converter — Seconds to Years & More | clevr.tools',
    metaDescription: 'Free time converter. Convert between milliseconds, seconds, minutes, hours, days, weeks, months, and years.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You need to know how many minutes are in 3.5 hours for a project estimate, or how many seconds are in a day for a programming calculation, or how many weeks until a deadline that is 90 days away. Time conversion seems simple until you actually need a precise answer — is 10,000 hours really 416 days? How many weeks is 1,000 hours? This converter handles milliseconds, seconds, minutes, hours, days, weeks, months, and years.</p>
      <p>Time conversion is used constantly in project management, software development (timeout values, animation durations), fitness (converting workout times), cooking (recipe timing), science, and everyday planning. The tricky part is that months and years are not fixed-length units — a month can be 28–31 days, and a year can be 365 or 366 days. This converter uses standard averages: 30.4375 days per month and 365.25 days per year.</p>

      <h2>Good to know</h2>
      <p><strong>The only fixed time conversions are seconds to hours.</strong> 60 seconds = 1 minute, 60 minutes = 1 hour, 24 hours = 1 day — these are exact and universal. But "1 month" and "1 year" are variable. For precise calculations (like billing or scheduling), use days or hours instead of months.</p>
      <p><strong>86,400 seconds in a day is worth memorizing.</strong> This number (60 x 60 x 24) appears constantly in programming, server configurations, and engineering calculations. A million seconds is about 11.6 days. A billion seconds is about 31.7 years.</p>
      <p><strong>The 10,000-hour rule put time conversion in pop culture.</strong> Malcolm Gladwell's claim that expertise requires 10,000 hours of practice made people wonder: how long is that? At 3 hours per day, it is about 9.1 years. At 8 hours per day (full-time), it is about 3.4 years. The number is debated, but the conversion question is evergreen.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Duration</th><th>Equivalent</th><th>Practical Context</th></tr></thead>
        <tbody>
          <tr><td>1 minute</td><td>60 seconds</td><td>Microwave timer</td></tr>
          <tr><td>1 hour</td><td>3,600 seconds</td><td>Meeting length</td></tr>
          <tr><td>1 day</td><td>86,400 seconds</td><td>Server timeout</td></tr>
          <tr><td>1 week</td><td>168 hours</td><td>Sprint cycle</td></tr>
          <tr><td>1 month (avg)</td><td>730.5 hours</td><td>Billing cycle</td></tr>
          <tr><td>1 year</td><td>8,766 hours</td><td>Annual planning</td></tr>
          <tr><td>1,000 hours</td><td>41.7 days</td><td>Certification study</td></tr>
          <tr><td>10,000 hours</td><td>416.7 days</td><td>"Mastery" benchmark</td></tr>
          <tr><td>1 million sec</td><td>11.6 days</td><td>Perspective exercise</td></tr>
          <tr><td>1 billion sec</td><td>31.7 years</td><td>Lifetime perspective</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['date-difference', 'age-calculator', 'convert-speed'],
  },
  {
    slug: 'convert-data',
    name: 'Data Size Converter',
    shortDescription: 'Convert between bytes, KB, MB, GB, TB, and bits.',
    category: 'calc',
    route: '/calc/convert/data',
    acceptedFormats: [],
    icon: 'Binary',
    metaTitle: 'Data Size Converter — KB, MB, GB & TB | clevr.tools',
    metaDescription: 'Free data size converter. Convert between bits, bytes, kilobytes, megabytes, gigabytes, terabytes, petabytes, megabits, and gigabits.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You have a 4.7 GB file and want to know if it fits on a DVD (4.7 GB — but is that the same GB?). Or your cloud storage plan says 2 TB and you want to know how many gigabytes that is. Or you are calculating how long a download will take and need to convert between megabytes (file size) and megabits (internet speed). Data size conversion is essential for anyone working with files, storage, bandwidth, or cloud services.</p>
      <p>This converter handles bits, bytes, kilobytes, megabytes, gigabytes, terabytes, petabytes, and their bit-based counterparts (megabits, gigabits). The most commonly searched conversions are GB to MB, TB to GB, and MB to KB. It also bridges the gap between bytes (used for file sizes) and bits (used for network speeds) — a distinction that confuses many people.</p>

      <h2>Good to know</h2>
      <p><strong>There are two definitions of "kilobyte" and they differ by 2.4%.</strong> In the decimal (SI) system, 1 KB = 1,000 bytes. In the binary (IEC) system, 1 KiB = 1,024 bytes. The difference compounds at larger scales: 1 TB (decimal) = 1,000,000,000,000 bytes, but 1 TiB (binary) = 1,099,511,627,776 bytes — a 10% gap. Hard drive manufacturers use decimal; operating systems often use binary. This is why a "1 TB" drive shows up as about 931 GB in your file manager.</p>
      <p><strong>8 bits = 1 byte, always.</strong> Internet speeds are measured in bits per second (Mbps, Gbps), but file sizes are measured in bytes (MB, GB). To convert, divide bits by 8. A 100 Mbps connection downloads at about 12.5 MB/s — not 100 MB/s. This is the single most common source of confusion in data size discussions.</p>
      <p><strong>Storage needs grow exponentially.</strong> A single 4K photo is about 10 MB. An hour of 4K video is roughly 20 GB. A typical smartphone now ships with 128–256 GB of storage. Understanding the scale relationships helps you plan purchases and manage your storage wisely.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Unit</th><th>Bytes (Decimal)</th><th>Practical Reference</th></tr></thead>
        <tbody>
          <tr><td>1 Byte</td><td>1</td><td>A single character</td></tr>
          <tr><td>1 KB</td><td>1,000</td><td>Short text file</td></tr>
          <tr><td>1 MB</td><td>1,000,000</td><td>1 minute of MP3 audio</td></tr>
          <tr><td>1 GB</td><td>1,000,000,000</td><td>~250 MP3 songs</td></tr>
          <tr><td>1 TB</td><td>10^12</td><td>~500 hours of HD video</td></tr>
          <tr><td>1 PB</td><td>10^15</td><td>~1,000 TB — large data center</td></tr>
          <tr><td>1 Megabit</td><td>125,000 bytes</td><td>Network speed unit</td></tr>
          <tr><td>1 Gigabit</td><td>125,000,000 bytes</td><td>Fast network speed</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['mbps-to-gbps', 'convert-time', 'convert-length'],
  },
  {
    slug: 'convert-pressure',
    name: 'Pressure Converter',
    shortDescription: 'Convert between PSI, bar, atm, pascal, and mmHg.',
    category: 'calc',
    route: '/calc/convert/pressure',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Pressure Converter — PSI, Bar & ATM | clevr.tools',
    metaDescription: 'Free pressure converter. Convert between pascals, kilopascals, bar, PSI, atmospheres, and mmHg instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are checking your tire pressure and the owner's manual says 2.3 bar but your tire gauge reads in PSI. Or you are reading a weather report that lists atmospheric pressure in millibars while your barometer shows inches of mercury. Or you are working on a plumbing or HVAC specification that mixes pascals, PSI, and atmospheres. Pressure conversion is essential in automotive maintenance, meteorology, engineering, medicine, and diving.</p>
      <p>The most commonly searched pressure conversions are PSI to bar, bar to PSI, atm to PSI, and kPa to PSI. The pascal (Pa) is the SI unit of pressure, but it is so small (1 Pa = the pressure of a dollar bill resting on a table) that kilopascals (kPa) and bar are used for practical measurements. This converter handles pascals, kilopascals, bar, PSI, atmospheres, and mmHg (torr).</p>

      <h2>Good to know</h2>
      <p><strong>1 bar is roughly 1 atmosphere.</strong> Specifically, 1 atm = 1.01325 bar. They are close enough that in casual conversation they are interchangeable, but in engineering calculations the 1.3% difference matters. Standard atmospheric pressure at sea level is 101.325 kPa = 1.01325 bar = 14.696 PSI.</p>
      <p><strong>Tire pressure uses PSI in the US and bar/kPa everywhere else.</strong> A typical car tire pressure of 32 PSI equals about 2.2 bar or 220 kPa. Knowing that 1 PSI is about 0.069 bar (or roughly 1 bar = 14.5 PSI) is the most useful conversion for everyday automotive use.</p>
      <p><strong>Blood pressure uses mmHg worldwide.</strong> A reading of "120/80" means 120 millimeters of mercury systolic over 80 mmHg diastolic. This unit persists in medicine even though mercury manometers have largely been replaced by digital devices. 120 mmHg equals about 2.32 PSI or 16 kPa.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>1 PSI</td><td>Bar</td><td>0.06895</td></tr>
          <tr><td>1 PSI</td><td>kPa</td><td>6.895</td></tr>
          <tr><td>1 PSI</td><td>mmHg</td><td>51.715</td></tr>
          <tr><td>1 Bar</td><td>PSI</td><td>14.504</td></tr>
          <tr><td>1 Bar</td><td>kPa</td><td>100</td></tr>
          <tr><td>1 ATM</td><td>PSI</td><td>14.696</td></tr>
          <tr><td>1 ATM</td><td>Bar</td><td>1.01325</td></tr>
          <tr><td>1 ATM</td><td>mmHg</td><td>760</td></tr>
          <tr><td>1 kPa</td><td>PSI</td><td>0.1450</td></tr>
          <tr><td>1 mmHg</td><td>kPa</td><td>0.1333</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-force', 'convert-energy', 'convert-temperature'],
  },
  {
    slug: 'convert-energy',
    name: 'Energy Converter',
    shortDescription: 'Convert between joules, calories, BTU, kWh, and more.',
    category: 'calc',
    route: '/calc/convert/energy',
    acceptedFormats: [],
    icon: 'Zap',
    metaTitle: 'Energy Converter — Joules, BTU & kWh | clevr.tools',
    metaDescription: 'Free energy converter. Convert between joules, kilojoules, calories, kilocalories, BTU, kilowatt-hours, watt-hours, and electronvolts.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are comparing your electricity bill (measured in kilowatt-hours) with the energy content of natural gas (measured in BTU or therms). Or you are studying physics and need to convert between joules, calories, and electronvolts for a problem set. Or you are reading a nutrition label that lists energy in kilojoules instead of the Calories you are used to. Energy conversion spans physics, engineering, nutrition, and utility billing.</p>
      <p>The most commonly searched energy conversions are kWh to joules, calories to joules, BTU to kWh, and kilojoules to calories. This converter handles all of these plus watt-hours, kilocalories (the "Calories" on food labels), and electronvolts. The joule is the SI base unit of energy, so all other units are defined relative to it.</p>

      <h2>Good to know</h2>
      <p><strong>Food "Calories" are actually kilocalories.</strong> The "Calorie" on a nutrition label (capital C) is 1 kilocalorie = 1,000 small calories = 4,184 joules. In most countries outside the US, food labels show kilojoules (kJ). A 2,000-Calorie diet is about 8,368 kJ. This is the most practical energy conversion for everyday life.</p>
      <p><strong>1 kWh = 3,600,000 joules.</strong> A kilowatt-hour is the energy consumed by a 1,000-watt appliance running for one hour. It is the standard billing unit for electricity worldwide. At $0.15 per kWh, running a 100-watt light bulb for 10 hours costs about 15 cents.</p>
      <p><strong>BTU is the dominant unit in US heating and cooling.</strong> A BTU (British Thermal Unit) is the energy needed to raise one pound of water by one degree Fahrenheit. Furnaces, air conditioners, and water heaters are all rated in BTU/hr. One therm (100,000 BTU) is the standard unit on natural gas bills.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>1 kilocalorie (food Cal)</td><td>Joules</td><td>4,184</td></tr>
          <tr><td>1 kilocalorie</td><td>Kilojoules</td><td>4.184</td></tr>
          <tr><td>1 kWh</td><td>Joules</td><td>3,600,000</td></tr>
          <tr><td>1 kWh</td><td>BTU</td><td>3,412</td></tr>
          <tr><td>1 BTU</td><td>Joules</td><td>1,055</td></tr>
          <tr><td>1 therm</td><td>kWh</td><td>29.3</td></tr>
          <tr><td>1 joule</td><td>Calories (small)</td><td>0.2388</td></tr>
          <tr><td>1 electronvolt</td><td>Joules</td><td>1.602 x 10^-19</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-power', 'convert-pressure', 'calories-burned'],
  },
  {
    slug: 'convert-frequency',
    name: 'Frequency Converter',
    shortDescription: 'Convert between Hz, kHz, MHz, and GHz.',
    category: 'calc',
    route: '/calc/convert/frequency',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Frequency Converter — Hz, kHz, MHz & GHz Free | clevr.tools',
    metaDescription: 'Free frequency converter. Convert between hertz, kilohertz, megahertz, and gigahertz instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are reading a CPU spec sheet that lists clock speed in GHz and want to know the equivalent in MHz for comparison with an older processor. Or you are tuning a radio and need to convert between kHz and MHz to find the right frequency band. Or you are studying signal processing and need to move between hertz, kilohertz, megahertz, and gigahertz for calculations. Frequency conversion is essential in electronics, telecommunications, audio engineering, and computer science.</p>
      <p>The conversions follow standard SI prefixes: 1 kHz = 1,000 Hz, 1 MHz = 1,000,000 Hz, 1 GHz = 1,000,000,000 Hz. While the math is just multiplying or dividing by 1,000, it is easy to lose track of zeros when dealing with numbers like 2,400,000,000 Hz (which is 2.4 GHz — the frequency of standard Wi-Fi). This converter eliminates that mental arithmetic.</p>

      <h2>Good to know</h2>
      <p><strong>Hz measures cycles per second.</strong> One hertz means one complete cycle per second. The unit is named after Heinrich Hertz, who first proved the existence of electromagnetic waves in 1887. Everything that oscillates — sound waves, radio signals, CPU clocks, alternating current — is measured in hertz.</p>
      <p><strong>Human hearing ranges from 20 Hz to 20,000 Hz (20 kHz).</strong> Most adults lose sensitivity above 15–16 kHz with age. Audio equipment specs often list frequency response in Hz to kHz. A good speaker reproduces 40 Hz to 20 kHz; a subwoofer goes down to 20 Hz or below.</p>
      <p><strong>Wi-Fi, Bluetooth, and microwaves all operate near 2.4 GHz.</strong> This is not a coincidence for microwaves and Wi-Fi — the 2.4 GHz band was originally set aside because it was considered "junk spectrum" partly occupied by microwave ovens. This is also why your Wi-Fi can sometimes be disrupted by a running microwave.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Frequency</th><th>Equivalent</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>50 Hz</td><td>0.05 kHz</td><td>EU power grid (AC)</td></tr>
          <tr><td>60 Hz</td><td>0.06 kHz</td><td>US power grid (AC)</td></tr>
          <tr><td>440 Hz</td><td>0.44 kHz</td><td>Concert pitch (A4 note)</td></tr>
          <tr><td>20 kHz</td><td>20,000 Hz</td><td>Upper limit of hearing</td></tr>
          <tr><td>88 MHz</td><td>88,000 kHz</td><td>FM radio band start</td></tr>
          <tr><td>108 MHz</td><td>108,000 kHz</td><td>FM radio band end</td></tr>
          <tr><td>2.4 GHz</td><td>2,400 MHz</td><td>Wi-Fi / Bluetooth</td></tr>
          <tr><td>5 GHz</td><td>5,000 MHz</td><td>Wi-Fi 5/6</td></tr>
          <tr><td>3.5 GHz</td><td>3,500 MHz</td><td>Modern CPU clock speed</td></tr>
          <tr><td>5.8 GHz</td><td>5,800 MHz</td><td>High-end CPU boost clock</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-data', 'convert-time', 'convert-energy'],
  },
  {
    slug: 'convert-fuel-economy',
    name: 'Fuel Economy Converter',
    shortDescription: 'Convert between MPG, L/100km, and km/L.',
    category: 'calc',
    route: '/calc/convert/fuel-economy',
    acceptedFormats: [],
    icon: 'Gauge',
    metaTitle: 'Fuel Economy Converter — MPG & L/100km | clevr.tools',
    metaDescription: 'Free fuel economy converter. Convert between miles per gallon (US/UK), liters per 100 kilometers, and kilometers per liter.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are comparing a car reviewed in Europe (rated at 6.5 L/100km) with one reviewed in the US (rated at 35 MPG) and want to know which actually uses less fuel. Or you are planning a road trip in a rental car abroad and the fuel economy is displayed in a unit you do not use daily. Fuel economy conversion is essential for international car shopping, travel planning, and understanding automotive reviews from other countries.</p>
      <p>The US uses miles per gallon (MPG), most of Europe and Australia use liters per 100 kilometers (L/100km), and some countries like Japan and India use kilometers per liter (km/L). The tricky part is that MPG and km/L are "bigger is better" units (more distance per unit of fuel), while L/100km is "smaller is better" (less fuel per unit of distance). The conversion between them is not linear — it involves an inverse relationship, making mental math unreliable.</p>

      <h2>Good to know</h2>
      <p><strong>The conversion is not a simple multiplication.</strong> Because MPG measures distance-per-fuel and L/100km measures fuel-per-distance, you cannot just multiply by a fixed factor. The formula is L/100km = 235.215 / MPG (US). So 30 MPG = 7.84 L/100km, and 40 MPG = 5.88 L/100km. The relationship is inverse — improvements at low MPG save more fuel than the same MPG improvement at high MPG.</p>
      <p><strong>US MPG and UK MPG are different.</strong> Because the US gallon (3.785 L) is smaller than the imperial gallon (4.546 L), a car rated at 40 MPG in the UK would be about 33 MPG by US measurement. Always check which gallon standard is being used when reading specifications.</p>
      <p><strong>The "MPG illusion" is real and important.</strong> Improving from 10 to 20 MPG saves more fuel than improving from 30 to 60 MPG over the same distance. This is because fuel consumption has a diminishing-returns relationship with MPG. L/100km is actually a more intuitive unit for comparing fuel costs because it scales linearly with fuel consumed.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>MPG (US)</th><th>L/100km</th><th>km/L</th><th>Vehicle Type</th></tr></thead>
        <tbody>
          <tr><td>15 MPG</td><td>15.68</td><td>6.38</td><td>Large truck/SUV</td></tr>
          <tr><td>20 MPG</td><td>11.76</td><td>8.50</td><td>Full-size sedan</td></tr>
          <tr><td>25 MPG</td><td>9.41</td><td>10.63</td><td>Midsize car</td></tr>
          <tr><td>30 MPG</td><td>7.84</td><td>12.75</td><td>Compact car</td></tr>
          <tr><td>35 MPG</td><td>6.72</td><td>14.88</td><td>Efficient sedan</td></tr>
          <tr><td>40 MPG</td><td>5.88</td><td>17.00</td><td>Hybrid</td></tr>
          <tr><td>50 MPG</td><td>4.70</td><td>21.25</td><td>Plug-in hybrid</td></tr>
          <tr><td>60 MPG</td><td>3.92</td><td>25.50</td><td>Efficient hybrid</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-volume', 'convert-speed', 'convert-length'],
  },
  {
    slug: 'convert-angle',
    name: 'Angle Converter',
    shortDescription: 'Convert between degrees, radians, gradians, and arcseconds.',
    category: 'calc',
    route: '/calc/convert/angle',
    acceptedFormats: [],
    icon: 'Compass',
    metaTitle: 'Angle Converter — Degrees & Radians | clevr.tools',
    metaDescription: 'Free angle converter. Convert between degrees, radians, gradians, arcminutes, and arcseconds instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are working through a calculus problem and the textbook gives an angle in degrees, but the trig function on your calculator expects radians. Or you are programming a game engine where rotation functions use radians while your design specs are in degrees. Degrees-to-radians is the most frequently searched angle conversion, and this tool handles it along with gradians, arcminutes, and arcseconds.</p>
      <p>Angle conversions come up in mathematics, physics, engineering, surveying, astronomy, and software development. Surveyors often work in degrees-minutes-seconds (DMS) notation and need to convert to decimal degrees for GPS coordinates. Astronomers use arcseconds to describe tiny angular separations between stars. Programmers converting between coordinate systems need radians for most math libraries.</p>

      <h2>Good to know</h2>
      <p><strong>The key formula: radians = degrees x (pi / 180).</strong> A full circle is 360 degrees or 2pi radians. So 180° = pi radians, 90° = pi/2, and 45° = pi/4. Memorizing these anchor points covers most common conversions.</p>
      <p><strong>Most programming languages use radians.</strong> JavaScript's Math.sin(), Python's math.sin(), and virtually every math library expect radians as input. Forgetting to convert from degrees is one of the most common bugs in graphics and game programming.</p>
      <p><strong>Gradians are used in surveying.</strong> A full circle is 400 gradians (also called gons). This makes right angles exactly 100 gradians, which simplifies certain surveying calculations. You will rarely encounter gradians outside of European surveying contexts.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Degrees</th><th>Radians</th><th>Gradians</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>0°</td><td>0</td><td>0 grad</td><td>Starting point</td></tr>
          <tr><td>30°</td><td>pi/6 (0.524)</td><td>33.33 grad</td><td>Common trig angle</td></tr>
          <tr><td>45°</td><td>pi/4 (0.785)</td><td>50 grad</td><td>Diagonal / 45° angle</td></tr>
          <tr><td>60°</td><td>pi/3 (1.047)</td><td>66.67 grad</td><td>Equilateral triangle</td></tr>
          <tr><td>90°</td><td>pi/2 (1.571)</td><td>100 grad</td><td>Right angle</td></tr>
          <tr><td>120°</td><td>2pi/3 (2.094)</td><td>133.33 grad</td><td>Obtuse angle</td></tr>
          <tr><td>180°</td><td>pi (3.142)</td><td>200 grad</td><td>Straight line</td></tr>
          <tr><td>270°</td><td>3pi/2 (4.712)</td><td>300 grad</td><td>Three-quarter turn</td></tr>
          <tr><td>360°</td><td>2pi (6.283)</td><td>400 grad</td><td>Full circle</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'percentage-calculator', 'convert-speed'],
  },
  {
    slug: 'convert-power',
    name: 'Power Converter',
    shortDescription: 'Convert between watts, kilowatts, horsepower, and BTU/hr.',
    category: 'calc',
    route: '/calc/convert/power',
    acceptedFormats: [],
    icon: 'Zap',
    metaTitle: 'Power Converter — Watts, kW & Horsepower | clevr.tools',
    metaDescription: 'Free power converter. Convert between watts, kilowatts, megawatts, horsepower, and BTU per hour instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are comparing a European car rated at 150 kW with an American car rated at 200 horsepower and want to know which actually has more power. Or you are sizing a generator and need to convert between watts, kilowatts, and BTU/hr to match the generator specs with your appliance requirements. Power conversion is essential in automotive, electrical engineering, HVAC, and any context where the rate of energy delivery is measured in different unit systems.</p>
      <p>The most commonly searched power conversions are watts to horsepower, kilowatts to horsepower, and watts to BTU/hr. The watt is the SI unit of power — it equals one joule per second. This converter handles watts, kilowatts, megawatts, mechanical horsepower, metric horsepower, and BTU per hour.</p>

      <h2>Good to know</h2>
      <p><strong>1 horsepower is about 746 watts.</strong> More precisely, 1 mechanical (imperial) horsepower = 745.7 watts. Metric horsepower (PS, used in Europe and Japan) is slightly different: 1 PS = 735.5 watts. When a European car says "150 PS," that is about 148 hp in US terms — a small but real difference.</p>
      <p><strong>James Watt invented the unit to sell steam engines.</strong> He compared his engines to draft horses and calculated that a horse could sustain about 33,000 foot-pounds of work per minute. That became the definition of one horsepower. The irony is that actual horses can sustain only about 0.7 horsepower over a working day — Watt was generous in his estimate to make his engines look good by comparison.</p>
      <p><strong>BTU/hr is the standard for HVAC.</strong> Air conditioners, furnaces, and water heaters are rated in BTU per hour. A typical window AC unit produces 5,000–12,000 BTU/hr, while a central AC system runs 24,000–60,000 BTU/hr. To convert to watts, divide BTU/hr by 3.412.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>1 Watt</td><td>BTU/hr</td><td>3.412</td></tr>
          <tr><td>1 Kilowatt</td><td>Horsepower (mech)</td><td>1.341</td></tr>
          <tr><td>1 Horsepower (mech)</td><td>Watts</td><td>745.7</td></tr>
          <tr><td>1 Horsepower (mech)</td><td>Kilowatts</td><td>0.7457</td></tr>
          <tr><td>1 Metric HP (PS)</td><td>Watts</td><td>735.5</td></tr>
          <tr><td>1 BTU/hr</td><td>Watts</td><td>0.2931</td></tr>
          <tr><td>1 Megawatt</td><td>Horsepower</td><td>1,341</td></tr>
          <tr><td>1 Kilowatt</td><td>BTU/hr</td><td>3,412</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-energy', 'convert-force', 'convert-pressure'],
  },
  {
    slug: 'convert-force',
    name: 'Force Converter',
    shortDescription: 'Convert between newtons, pounds-force, kilogram-force, and dynes.',
    category: 'calc',
    route: '/calc/convert/force',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Force Converter — Newtons, lbf & kgf | clevr.tools',
    metaDescription: 'Free force converter. Convert between newtons, kilonewtons, pounds-force, kilogram-force, and dynes instantly.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are reading a structural engineering spec that lists load capacity in kilonewtons but your reference tables use pounds-force. Or you are working through a physics problem that mixes newtons and kilogram-force. Force conversion is essential in mechanical engineering, structural analysis, automotive design, and physics coursework — anywhere that push, pull, tension, or load capacity needs to be expressed in different unit systems.</p>
      <p>The most commonly searched force conversions are newtons to pounds-force and kilogram-force to newtons. The newton (N) is the SI unit of force — it is the force needed to accelerate 1 kilogram at 1 meter per second squared. Pounds-force (lbf) is the force exerted by gravity on one pound of mass at Earth's surface. This converter handles both plus kilonewtons, dynes, and kilogram-force.</p>

      <h2>Good to know</h2>
      <p><strong>Weight is a force, not a mass.</strong> When you step on a scale and it reads 150 pounds, it is actually measuring the gravitational force your mass exerts — about 667 newtons. Mass (kilograms) and force (newtons) are different physical quantities, even though everyday language conflates them. This distinction matters in engineering and physics.</p>
      <p><strong>1 kgf = 9.80665 N exactly.</strong> Kilogram-force is the force exerted by one kilogram under standard gravity (9.80665 m/s²). It is widely used in non-SI engineering contexts, especially in older manuals and in countries that adopted the metric system before the newton became standard.</p>
      <p><strong>1 lbf = 4.44822 N.</strong> This is the most commonly needed conversion for US engineers working with international specs. A quick estimate: multiply pounds-force by 4.45 to get newtons, or divide newtons by 4.45 to get pounds-force.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>From</th><th>To</th><th>Multiply By</th></tr></thead>
        <tbody>
          <tr><td>1 Newton (N)</td><td>Pounds-force</td><td>0.2248</td></tr>
          <tr><td>1 Newton</td><td>Kilogram-force</td><td>0.1020</td></tr>
          <tr><td>1 Newton</td><td>Dynes</td><td>100,000</td></tr>
          <tr><td>1 Pound-force (lbf)</td><td>Newtons</td><td>4.4482</td></tr>
          <tr><td>1 Kilogram-force (kgf)</td><td>Newtons</td><td>9.8067</td></tr>
          <tr><td>1 Kilonewton (kN)</td><td>Pounds-force</td><td>224.81</td></tr>
          <tr><td>1 Kilonewton</td><td>Kilogram-force</td><td>101.97</td></tr>
          <tr><td>1 Dyne</td><td>Newtons</td><td>0.00001</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-pressure', 'convert-weight', 'convert-energy'],
  },
  {
    slug: 'convert-cooking',
    name: 'Cooking Converter',
    shortDescription: 'Convert between cups, tablespoons, teaspoons, ml, and fluid ounces.',
    category: 'calc',
    route: '/calc/convert/cooking',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Cooking Converter — Cups, Tbsp & mL | clevr.tools',
    metaDescription: 'Free cooking measurement converter. Convert between teaspoons, tablespoons, fluid ounces, cups, pints, quarts, liters, and milliliters.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are halving a recipe that calls for 3/4 cup of sugar and need to know how many tablespoons that is. Or you are scaling up a family recipe from 4 servings to 12 and the math on the teaspoons is getting messy. Or you found a great recipe online that uses milliliters but your kitchen is stocked with cup and tablespoon measures. Cooking measurement conversions come up every time you scale a recipe, follow an international cookbook, or substitute one measuring tool for another.</p>
      <p>This converter handles the full range of cooking volume measurements: teaspoons, tablespoons, fluid ounces, cups, pints, quarts, liters, and milliliters. The most commonly searched conversions in cooking are tablespoons to cups, cups to milliliters, and teaspoons to tablespoons — all of which this tool handles instantly.</p>

      <h2>Good to know</h2>
      <p><strong>3 teaspoons = 1 tablespoon is the foundation.</strong> Most cooking conversions build from this. 2 tablespoons = 1 fluid ounce. 8 fluid ounces = 1 cup. 2 cups = 1 pint. 2 pints = 1 quart. 4 quarts = 1 gallon. If you memorize the first three, you can derive the rest.</p>
      <p><strong>Metric recipes are more precise.</strong> A tablespoon of flour can vary by 25% depending on whether you scoop, dip, or level. That is why professional and European recipes specify grams. For liquids, volume measurements are reliable — water, milk, and broth measure consistently in cups and milliliters alike.</p>
      <p><strong>"A pinch" and "a dash" are real (if imprecise) measurements.</strong> A pinch is traditionally about 1/16 teaspoon, and a dash is about 1/8 teaspoon. A smidgen is even smaller at about 1/32 teaspoon. These terms appear in older recipes and are meant to be intuitive rather than exact.</p>
      <p><strong>Australian tablespoons are 20 mL, not 15 mL.</strong> The standard US and UK tablespoon is 15 mL (3 teaspoons), but Australian tablespoons are 20 mL (4 teaspoons). This can throw off recipes from Australian cookbooks if you are not aware of the difference.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Measurement</th><th>Equivalent</th><th>Milliliters</th></tr></thead>
        <tbody>
          <tr><td>1 teaspoon</td><td>1/3 tablespoon</td><td>4.93 mL</td></tr>
          <tr><td>1 tablespoon</td><td>3 teaspoons</td><td>14.79 mL</td></tr>
          <tr><td>1 fluid ounce</td><td>2 tablespoons</td><td>29.57 mL</td></tr>
          <tr><td>1/4 cup</td><td>4 tablespoons</td><td>59.15 mL</td></tr>
          <tr><td>1/3 cup</td><td>5 tbsp + 1 tsp</td><td>78.86 mL</td></tr>
          <tr><td>1/2 cup</td><td>8 tablespoons</td><td>118.29 mL</td></tr>
          <tr><td>1 cup</td><td>16 tablespoons</td><td>236.59 mL</td></tr>
          <tr><td>1 pint</td><td>2 cups</td><td>473.18 mL</td></tr>
          <tr><td>1 quart</td><td>4 cups</td><td>946.35 mL</td></tr>
          <tr><td>1 liter</td><td>~4.23 cups</td><td>1000 mL</td></tr>
          <tr><td>1 gallon</td><td>16 cups</td><td>3785.41 mL</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-volume', 'cups-to-ml', 'convert-weight'],
  },
  // ─── Specific Unit Converters (SEO Landing Pages) ────────────────────
  {
    slug: 'cm-to-inches',
    name: 'CM to Inches Converter',
    shortDescription: 'Convert centimeters to inches instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/cm-to-inches',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'CM to Inches Converter | clevr.tools',
    metaDescription: 'Convert centimeters to inches instantly. 1 cm = 0.3937 inches. Free converter with reference table for common values.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are shopping online from a European retailer and the product dimensions are listed in centimeters, but you think in inches. Or you are reading a medical report that lists a measurement in centimeters and you want to visualize it in a unit you are familiar with. CM-to-inches conversion comes up constantly when crossing between metric and imperial systems — in furniture shopping, body measurements for clothing, screen sizes, and fitness tracking.</p>
      <p>The formula is straightforward: divide centimeters by 2.54 to get inches. One inch is defined as exactly 2.54 centimeters — this is not an approximation but a precise international standard established in 1959. So 10 cm is exactly 3.937 inches, 30 cm is exactly 11.811 inches, and 100 cm is exactly 39.37 inches. The converter handles the division so you do not have to.</p>

      <h2>Good to know</h2>
      <p><strong>The conversion factor is exact.</strong> 1 inch = 2.54 cm is a defined relationship, not a measured approximation. This means every CM-to-inches conversion is mathematically precise — there is no rounding error in the factor itself, only in how many decimal places you choose to display.</p>
      <p><strong>Body height is the most common use case.</strong> If someone tells you they are 175 cm tall, that is about 5 feet 8.9 inches. Clothing size charts from international brands almost always list measurements in centimeters, so knowing a few anchor points (like 2.5 cm per inch) helps you estimate quickly.</p>
      <p><strong>Screen sizes are always measured diagonally in inches.</strong> If a product listing shows a screen as 39.6 cm, divide by 2.54 to get 15.6 inches — a standard laptop screen size. Monitor and TV sizes are one of the few categories where even metric countries use inches as the standard unit.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Centimeters</th><th>Inches</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1 cm</td><td>0.394 in</td><td>Fingernail width</td></tr>
          <tr><td>2.54 cm</td><td>1.000 in</td><td>Exact definition</td></tr>
          <tr><td>5 cm</td><td>1.969 in</td><td>Small scar, button</td></tr>
          <tr><td>10 cm</td><td>3.937 in</td><td>Smartphone width</td></tr>
          <tr><td>15 cm</td><td>5.906 in</td><td>Paperback book width</td></tr>
          <tr><td>30 cm</td><td>11.811 in</td><td>Standard ruler</td></tr>
          <tr><td>60 cm</td><td>23.622 in</td><td>Carry-on luggage height</td></tr>
          <tr><td>90 cm</td><td>35.433 in</td><td>Kitchen counter height</td></tr>
          <tr><td>100 cm</td><td>39.370 in</td><td>1 meter</td></tr>
          <tr><td>150 cm</td><td>59.055 in</td><td>Child's height (~4'11")</td></tr>
          <tr><td>170 cm</td><td>66.929 in</td><td>Average height (~5'7")</td></tr>
          <tr><td>180 cm</td><td>70.866 in</td><td>Tall adult (~5'11")</td></tr>
          <tr><td>200 cm</td><td>78.740 in</td><td>Tall doorframe</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'mm-to-inches', 'feet-to-meters'],
  },
  {
    slug: 'kg-to-lbs',
    name: 'KG to Pounds Converter',
    shortDescription: 'Convert kilograms to pounds instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/kg-to-lbs',
    acceptedFormats: [],
    icon: 'Weight',
    metaTitle: 'KG to Pounds Converter | clevr.tools',
    metaDescription: 'Convert kilograms to pounds instantly. 1 kg = 2.205 lbs. Free converter with reference table for common values.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are at a gym abroad and the dumbbells are labeled in kilograms, but you train in pounds and need to know what 22.5 kg feels like in your usual units. Or you are reading a European product listing — luggage weight limits, body weight on a medical form, ingredient quantities — and the number is in kilograms. Multiply by 2.20462 to get pounds, or let this converter do it for you.</p>
      <p>This conversion comes up in fitness, travel, shipping, and cooking. Airlines outside the US list baggage limits in kilograms (typically 23 kg for checked bags, which is about 50.7 lbs). Gym equipment worldwide is mostly metric. Postal services in many countries calculate shipping rates per kilogram. Having the conversion at your fingertips saves time and prevents costly mistakes — like showing up at the airport with an overweight bag.</p>

      <h2>Good to know</h2>
      <p><strong>The exact factor is 2.20462 lbs per kg.</strong> For quick mental math, doubling the kilogram value and adding 10% gets you close. So 70 kg becomes 140 + 14 = 154 lbs (actual: 154.3 lbs). This shortcut works well across the range of common weights.</p>
      <p><strong>The kilogram is the SI base unit.</strong> Unlike the pound, which is defined relative to the kilogram, the kilogram was redefined in 2019 in terms of the Planck constant — making it one of the most precisely defined units in science. One pound is exactly 0.45359237 kg by international agreement.</p>
      <p><strong>Gym plates follow predictable patterns.</strong> Standard Olympic plates in metric are 25 kg, 20 kg, 15 kg, 10 kg, 5 kg, 2.5 kg, and 1.25 kg. In pounds, common plates are 45, 35, 25, 10, 5, and 2.5 lbs. A 20 kg plate and a 45 lb plate are close but not identical — 20 kg = 44.09 lbs, about a pound lighter.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Kilograms</th><th>Pounds</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1 kg</td><td>2.205 lbs</td><td>Bag of sugar</td></tr>
          <tr><td>2.5 kg</td><td>5.512 lbs</td><td>Small dumbbell</td></tr>
          <tr><td>5 kg</td><td>11.023 lbs</td><td>Bag of flour</td></tr>
          <tr><td>10 kg</td><td>22.046 lbs</td><td>Carry-on weight limit</td></tr>
          <tr><td>20 kg</td><td>44.092 lbs</td><td>Olympic barbell plate</td></tr>
          <tr><td>23 kg</td><td>50.706 lbs</td><td>Checked bag limit (airline)</td></tr>
          <tr><td>50 kg</td><td>110.231 lbs</td><td>Average adult weight</td></tr>
          <tr><td>70 kg</td><td>154.324 lbs</td><td>Common male weight</td></tr>
          <tr><td>80 kg</td><td>176.370 lbs</td><td>Heavier adult</td></tr>
          <tr><td>90 kg</td><td>198.416 lbs</td><td>Large adult</td></tr>
          <tr><td>100 kg</td><td>220.462 lbs</td><td>Benchmark weight</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-weight', 'lbs-to-kg', 'oz-to-grams'],
  },
  {
    slug: 'miles-to-km',
    name: 'Miles to Kilometers Converter',
    shortDescription: 'Convert miles to kilometers instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/miles-to-km',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'Miles to Kilometers Converter | clevr.tools',
    metaDescription: 'Convert miles to kilometers instantly. 1 mile = 1.609 km. Free converter with reference table for common distances.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are planning a road trip in Canada and the GPS shows distances in kilometers, but you are used to thinking in miles. Or a running event advertises itself as a 10K and you want to know the distance in miles (6.2 miles). Or you are comparing car odometer readings between a US-spec vehicle and an import. Miles-to-kilometers conversion is one of the most common unit conversions in the world, given that only three countries — the US, Myanmar, and Liberia — still use miles as their primary road distance unit.</p>
      <p>The exact conversion factor is 1 mile = 1.609344 kilometers. For everyday use, 1.6 km per mile is close enough. To convert, multiply the number of miles by 1.609. So a 26.2-mile marathon is 42.2 km, and a 60 mph speed limit is about 97 km/h.</p>

      <h2>Good to know</h2>
      <p><strong>The Fibonacci sequence gives surprisingly good estimates.</strong> Consecutive Fibonacci numbers (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...) approximate the miles-to-km conversion because the ratio of consecutive Fibonacci numbers approaches the golden ratio (1.618), which is close to 1.609. So 5 miles is about 8 km, 8 miles is about 13 km, and 13 miles is about 21 km. It is a neat mathematical coincidence that actually works in practice.</p>
      <p><strong>Speed limits translate in predictable clusters.</strong> 30 mph is 48 km/h, 60 mph is 97 km/h, and 70 mph is 113 km/h. When driving in metric countries, remembering that 100 km/h is about 62 mph gives you a useful anchor.</p>
      <p><strong>A nautical mile is different from a statute mile.</strong> A nautical mile (used in aviation and maritime) is 1.852 km, while a statute mile (used on roads) is 1.609 km. Do not mix them up — the difference is about 15%.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Miles</th><th>Kilometers</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>0.5 mi</td><td>0.805 km</td><td>Short walk</td></tr>
          <tr><td>1 mi</td><td>1.609 km</td><td>4-minute mile benchmark</td></tr>
          <tr><td>3.1 mi</td><td>5 km</td><td>5K race</td></tr>
          <tr><td>5 mi</td><td>8.047 km</td><td>Average commute distance</td></tr>
          <tr><td>6.2 mi</td><td>10 km</td><td>10K race</td></tr>
          <tr><td>10 mi</td><td>16.093 km</td><td>Long training run</td></tr>
          <tr><td>13.1 mi</td><td>21.097 km</td><td>Half marathon</td></tr>
          <tr><td>26.2 mi</td><td>42.195 km</td><td>Marathon</td></tr>
          <tr><td>50 mi</td><td>80.467 km</td><td>Ultramarathon</td></tr>
          <tr><td>100 mi</td><td>160.934 km</td><td>Cross-state drive</td></tr>
          <tr><td>500 mi</td><td>804.672 km</td><td>Day-trip drive</td></tr>
          <tr><td>1000 mi</td><td>1609.344 km</td><td>Cross-country flight</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'feet-to-meters', 'cm-to-inches'],
  },
  {
    slug: 'fahrenheit-to-celsius',
    name: 'Fahrenheit to Celsius Converter',
    shortDescription: 'Convert Fahrenheit to Celsius instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/fahrenheit-to-celsius',
    acceptedFormats: [],
    icon: 'Thermometer',
    metaTitle: 'Fahrenheit to Celsius Converter | clevr.tools',
    metaDescription: 'Convert Fahrenheit to Celsius instantly. Formula: C = (F - 32) x 5/9. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are checking the weather forecast for a trip to Europe and it says 22°C — is that warm enough for shorts? Or you are reading a recipe that says to bake at 350°F and your oven is set in Celsius. Temperature conversion between Fahrenheit and Celsius is one of the most common daily conversions, especially for travelers, expatriates, and anyone cooking with international recipes.</p>
      <p>The formula is C = (F - 32) x 5/9. Subtract 32, multiply by 5, divide by 9. It is simple enough to do on paper but annoying enough that most people reach for a converter, especially when the numbers are not round. This tool gives you the answer instantly and includes a reference table so you can build intuition over time.</p>

      <h2>Good to know</h2>
      <p><strong>The two scales cross at -40°.</strong> At exactly -40 degrees, Fahrenheit and Celsius are the same number. Below that they diverge again. This is one of those facts that sounds made up but falls directly out of the math — and it means that if someone says "it's -40 outside," you do not need to ask which scale they are using.</p>
      <p><strong>Quick mental math trick: double and add 30.</strong> For a rough Celsius-to-Fahrenheit estimate, double the Celsius number and add 30. So 20°C becomes roughly 70°F (actual: 68°F). It is not precise but gets you within a few degrees for everyday temperatures, which is close enough to decide what to wear.</p>
      <p><strong>Oven temperatures cluster in predictable ranges.</strong> Most baking happens between 325°F (163°C) and 450°F (232°C). Knowing a few anchor points — 350°F = 177°C, 400°F = 204°C, 425°F = 218°C — covers most recipes.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>°F</th><th>°C</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>-40°F</td><td>-40°C</td><td>Scales intersect</td></tr>
          <tr><td>0°F</td><td>-17.8°C</td><td>Very cold winter day</td></tr>
          <tr><td>32°F</td><td>0°C</td><td>Water freezes</td></tr>
          <tr><td>50°F</td><td>10°C</td><td>Cool autumn day</td></tr>
          <tr><td>68°F</td><td>20°C</td><td>Room temperature</td></tr>
          <tr><td>72°F</td><td>22.2°C</td><td>Comfortable indoor</td></tr>
          <tr><td>86°F</td><td>30°C</td><td>Hot summer day</td></tr>
          <tr><td>98.6°F</td><td>37°C</td><td>Normal body temp</td></tr>
          <tr><td>100°F</td><td>37.8°C</td><td>Fever threshold</td></tr>
          <tr><td>212°F</td><td>100°C</td><td>Water boils</td></tr>
          <tr><td>350°F</td><td>177°C</td><td>Standard baking</td></tr>
          <tr><td>400°F</td><td>204°C</td><td>Roasting</td></tr>
          <tr><td>450°F</td><td>232°C</td><td>Pizza, high-heat baking</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-temperature', 'convert-length', 'convert-weight'],
  },
  {
    slug: 'feet-to-meters',
    name: 'Feet to Meters Converter',
    shortDescription: 'Convert feet to meters instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/feet-to-meters',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'Feet to Meters Converter | clevr.tools',
    metaDescription: 'Convert feet to meters instantly. 1 foot = 0.3048 meters. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are filling out a form that asks for your height in meters but you only know it in feet and inches. Or you are looking at a real estate listing abroad and the room dimensions are in meters while you think in feet. This conversion is essential for international travel, athletics (swimming pool lengths, track dimensions), construction, and any cross-border communication about height or distance.</p>
      <p>The conversion factor is exact: 1 foot equals exactly 0.3048 meters. This was internationally standardized in 1959. To convert, multiply the number of feet by 0.3048. So 6 feet is 1.8288 meters, commonly rounded to 1.83 m. The converter handles both the math and the rounding for you.</p>

      <h2>Good to know</h2>
      <p><strong>1 foot = 0.3048 meters is an exact definition.</strong> Like many imperial-to-metric conversions, this one is defined rather than measured. There is no rounding error in the factor itself — 0.3048 is the precise ratio, established by international agreement.</p>
      <p><strong>Quick shortcut: divide by 3.3.</strong> If you need a rough mental estimate, dividing feet by 3.3 gets you close. A 10-foot ceiling is about 3 meters. A 100-foot lot is about 30 meters. It is not exact but useful when you just need a sense of scale.</p>
      <p><strong>Aviation uses feet worldwide — even in metric countries.</strong> Altitude is measured in feet globally by international aviation convention. So even a pilot in France reads altitude in feet while distances on the ground are in meters and kilometers. This is one of the quirks of having two measurement systems coexist.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Feet</th><th>Meters</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1 ft</td><td>0.305 m</td><td>Ruler length</td></tr>
          <tr><td>3 ft</td><td>0.914 m</td><td>1 yard</td></tr>
          <tr><td>5 ft</td><td>1.524 m</td><td>Short adult height</td></tr>
          <tr><td>5.5 ft</td><td>1.676 m</td><td>Average female height (US)</td></tr>
          <tr><td>6 ft</td><td>1.829 m</td><td>Tall adult height</td></tr>
          <tr><td>8 ft</td><td>2.438 m</td><td>Standard ceiling height</td></tr>
          <tr><td>10 ft</td><td>3.048 m</td><td>Basketball rim height</td></tr>
          <tr><td>20 ft</td><td>6.096 m</td><td>Shipping container length</td></tr>
          <tr><td>50 ft</td><td>15.240 m</td><td>Swimming pool length</td></tr>
          <tr><td>100 ft</td><td>30.480 m</td><td>Roughly 10 stories</td></tr>
          <tr><td>200 ft</td><td>60.960 m</td><td>Olympic pool x 1.2</td></tr>
          <tr><td>500 ft</td><td>152.400 m</td><td>Small skyscraper height</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'meters-to-feet', 'inches-to-feet'],
  },
  {
    slug: 'oz-to-grams',
    name: 'Ounces to Grams Converter',
    shortDescription: 'Convert ounces to grams instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/oz-to-grams',
    acceptedFormats: [],
    icon: 'Weight',
    metaTitle: 'Ounces to Grams Converter | clevr.tools',
    metaDescription: 'Convert ounces to grams instantly. 1 oz = 28.35 grams. Free converter with reference table for cooking and more.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are following a European baking recipe that calls for 200 grams of butter but your kitchen scale reads in ounces. Or you are portioning food for a nutrition plan and the label lists serving size in ounces while your food tracking app wants grams. Ounce-to-gram conversion is one of the most frequent kitchen calculations, and it shows up in shipping, postal rates, and small-item manufacturing too.</p>
      <p>One avoirdupois ounce (the standard ounce used in cooking and everyday life) equals exactly 28.349523125 grams. For quick mental math, round to 28.35 grams per ounce. Multiply the number of ounces by 28.35 and you have grams. This converter does the precise calculation for you, which matters when you are scaling recipes or calculating postage costs for lightweight packages.</p>

      <h2>Good to know</h2>
      <p><strong>There are two kinds of ounces.</strong> The avoirdupois ounce (28.35 g) is used for food, postage, and general weight. The troy ounce (31.10 g) is used for precious metals like gold and silver. When you see "gold at $2,300 per ounce," that is a troy ounce. This converter uses the avoirdupois ounce — the one you encounter in everyday life.</p>
      <p><strong>Do not confuse weight ounces with fluid ounces.</strong> A fluid ounce is a volume measurement (about 29.57 mL), not a weight. An ounce of water happens to weigh close to a fluid ounce (about 29.6 grams), but an ounce of honey weighs about 42 grams despite occupying the same fluid ounce of volume. Always check whether a recipe means weight ounces or fluid ounces.</p>
      <p><strong>Professional bakers weigh everything in grams.</strong> Volume measurements like cups are inconsistent — a cup of flour can weigh anywhere from 120 to 160 grams depending on how you scoop it. Grams remove this variability entirely, which is why European recipes and professional kitchens use weight-based measurements almost exclusively.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Ounces</th><th>Grams</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>0.5 oz</td><td>14.17 g</td><td>Small spice amount</td></tr>
          <tr><td>1 oz</td><td>28.35 g</td><td>Slice of bread</td></tr>
          <tr><td>2 oz</td><td>56.70 g</td><td>Serving of pasta (dry)</td></tr>
          <tr><td>3 oz</td><td>85.05 g</td><td>Chicken breast portion</td></tr>
          <tr><td>4 oz</td><td>113.40 g</td><td>Stick of butter (half)</td></tr>
          <tr><td>6 oz</td><td>170.10 g</td><td>Yogurt container</td></tr>
          <tr><td>8 oz</td><td>226.80 g</td><td>Full stick of butter</td></tr>
          <tr><td>12 oz</td><td>340.19 g</td><td>Can of soda (weight)</td></tr>
          <tr><td>16 oz</td><td>453.59 g</td><td>1 pound</td></tr>
          <tr><td>24 oz</td><td>680.39 g</td><td>Large steak</td></tr>
          <tr><td>32 oz</td><td>907.18 g</td><td>2 pounds</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-weight', 'kg-to-lbs', 'convert-cooking'],
  },
  {
    slug: 'liters-to-gallons',
    name: 'Liters to Gallons Converter',
    shortDescription: 'Convert liters to gallons instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/liters-to-gallons',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Liters to Gallons Converter | clevr.tools',
    metaDescription: 'Convert liters to US gallons instantly. 1 liter = 0.264 gallons. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are renting a car in Europe and the fuel tank capacity is listed as 55 liters — how many gallons is that? Or you are comparing fuel prices between the US (per gallon) and Europe (per liter) and need a common unit to see which is actually cheaper. Liters-to-gallons conversion shows up in automotive, brewing, aquariums, pool maintenance, and anywhere else liquid volume crosses the metric-imperial boundary.</p>
      <p>The conversion factor is 1 liter = 0.26417 US gallons, or equivalently, 1 US gallon = 3.78541 liters. Be aware that the US gallon and the imperial (UK) gallon are different — the imperial gallon is about 20% larger at 4.546 liters. This converter uses the US gallon, which is the standard in the United States.</p>

      <h2>Good to know</h2>
      <p><strong>US gallons and imperial gallons are not the same.</strong> A US gallon is 3.785 liters; an imperial gallon is 4.546 liters. If a British recipe or car manual says "gallons," it means imperial gallons. Confusing the two can lead to meaningful errors — filling a 10-imperial-gallon tank with 10 US gallons leaves it about 17% short.</p>
      <p><strong>Quick estimate: roughly 4 liters per gallon.</strong> For mental math, 1 gallon is approximately 4 liters, and 1 liter is about a quarter gallon. This gets you within 5% — close enough for most practical situations like estimating how much paint to buy or how much gas you need.</p>
      <p><strong>Engine displacement uses liters worldwide.</strong> When a car is described as having a "2.0-liter engine," that refers to the total volume of all cylinders. A 5.0-liter V8 is about 305 cubic inches — the old American way of expressing displacement. The shift to liters for engine size is one of the few metric victories in US automotive culture.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Liters</th><th>US Gallons</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1 L</td><td>0.264 gal</td><td>Large water bottle</td></tr>
          <tr><td>2 L</td><td>0.528 gal</td><td>Soda bottle</td></tr>
          <tr><td>3.785 L</td><td>1.000 gal</td><td>Milk jug</td></tr>
          <tr><td>5 L</td><td>1.321 gal</td><td>Motor oil container</td></tr>
          <tr><td>10 L</td><td>2.642 gal</td><td>Gas can</td></tr>
          <tr><td>20 L</td><td>5.283 gal</td><td>Jerry can</td></tr>
          <tr><td>40 L</td><td>10.567 gal</td><td>Small aquarium</td></tr>
          <tr><td>55 L</td><td>14.529 gal</td><td>Car fuel tank</td></tr>
          <tr><td>100 L</td><td>26.417 gal</td><td>Large barrel</td></tr>
          <tr><td>200 L</td><td>52.834 gal</td><td>Standard oil drum</td></tr>
          <tr><td>1000 L</td><td>264.172 gal</td><td>1 cubic meter</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-volume', 'cups-to-ml', 'convert-cooking'],
  },
  {
    slug: 'inches-to-feet',
    name: 'Inches to Feet Converter',
    shortDescription: 'Convert inches to feet instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/inches-to-feet',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'Inches to Feet Converter | clevr.tools',
    metaDescription: 'Convert inches to feet instantly. 12 inches = 1 foot. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You measured a room and got 156 inches, but you need the number in feet for a flooring order. Or a child's height is listed as 52 inches on a growth chart and you want to know that in feet and inches quickly. While the math is simple — divide by 12 — it gets tedious when the numbers do not divide evenly, and most people would rather not do long division in their heads for 67 inches (5 feet 7 inches).</p>
      <p>This conversion appears constantly in home improvement, construction, and shipping. Lumber is sold in foot lengths, but detailed measurements are often taken in inches. Screen sizes, TV dimensions, and furniture measurements frequently mix the two. Having a quick converter eliminates the mental arithmetic and the risk of an off-by-one-inch mistake that could mean cutting material too short.</p>

      <h2>Good to know</h2>
      <p><strong>12 inches per foot is exact and ancient.</strong> The 12-inch foot dates back to Roman measurement systems. Twelve was chosen because it divides evenly by 2, 3, 4, and 6, making it practical for halving, thirding, and quartering — something that base-10 systems handle less gracefully.</p>
      <p><strong>Height is the most common use case.</strong> In the US, height is expressed as feet and inches (5'7"), but medical records and many international contexts use total inches or centimeters. Knowing that 5'7" equals 67 inches lets you quickly enter your height on forms or convert between systems.</p>
      <p><strong>Remainders matter for precision.</strong> 65 inches is 5 feet 5 inches, not 5.4 feet. The decimal and fractional representations are different: 5 feet 5 inches = 5.417 feet (because 5/12 = 0.417). Be careful not to mix up "5 feet 5 inches" with "5.5 feet" — the latter is actually 5 feet 6 inches.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Inches</th><th>Feet & Inches</th><th>Decimal Feet</th></tr></thead>
        <tbody>
          <tr><td>12 in</td><td>1' 0"</td><td>1.000 ft</td></tr>
          <tr><td>24 in</td><td>2' 0"</td><td>2.000 ft</td></tr>
          <tr><td>36 in</td><td>3' 0"</td><td>3.000 ft</td></tr>
          <tr><td>48 in</td><td>4' 0"</td><td>4.000 ft</td></tr>
          <tr><td>54 in</td><td>4' 6"</td><td>4.500 ft</td></tr>
          <tr><td>60 in</td><td>5' 0"</td><td>5.000 ft</td></tr>
          <tr><td>66 in</td><td>5' 6"</td><td>5.500 ft</td></tr>
          <tr><td>72 in</td><td>6' 0"</td><td>6.000 ft</td></tr>
          <tr><td>78 in</td><td>6' 6"</td><td>6.500 ft</td></tr>
          <tr><td>84 in</td><td>7' 0"</td><td>7.000 ft</td></tr>
          <tr><td>96 in</td><td>8' 0"</td><td>8.000 ft</td></tr>
          <tr><td>120 in</td><td>10' 0"</td><td>10.000 ft</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'feet-to-meters', 'cm-to-inches'],
  },
  {
    slug: 'meters-to-feet',
    name: 'Meters to Feet Converter',
    shortDescription: 'Convert meters to feet instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/meters-to-feet',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'Meters to Feet Converter | clevr.tools',
    metaDescription: 'Convert meters to feet instantly. 1 meter = 3.281 feet. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are reading a property listing from another country and the plot is described as 20 x 30 meters — but you visualize space in feet. Or you are watching international athletics and a long jumper just cleared 8.5 meters and you want to know what that is in feet (about 27.9 feet — an extraordinary jump). This conversion bridges the gap whenever distances described in meters need to be understood in feet.</p>
      <p>The conversion factor is 1 meter = 3.28084 feet. Multiply meters by 3.281 for a quick result. This comes up frequently in real estate, construction, sports, mountaineering (summit elevations are often given in both units), and diving (depth in meters is standard internationally).</p>

      <h2>Good to know</h2>
      <p><strong>Multiply by 3.3 for a quick estimate.</strong> When you do not need precision, multiplying meters by 3.3 gets you within 1% of the exact answer. A 50-meter pool is about 164 feet (exact: 164.04 feet). A 100-meter dash is about 328 feet. Close enough for conversation.</p>
      <p><strong>The meter was originally defined as one ten-millionth of the distance from equator to pole.</strong> French scientists measured an arc of meridian in the 1790s to establish the meter. Their measurement was slightly off, so the meter is not exactly what they intended — but the definition stuck and was later redefined in terms of the speed of light for ultimate precision.</p>
      <p><strong>Elevation is where this conversion appears most.</strong> Mount Everest is 8,849 meters (29,032 feet). Commercial aircraft cruise at about 10,000–12,000 meters (33,000–39,000 feet). Scuba diving limits are expressed in meters in most of the world — the recreational limit is typically 40 meters (131 feet).</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Meters</th><th>Feet</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1 m</td><td>3.281 ft</td><td>Doorknob height</td></tr>
          <tr><td>1.5 m</td><td>4.921 ft</td><td>Short fence</td></tr>
          <tr><td>1.8 m</td><td>5.906 ft</td><td>Tall person (~5'11")</td></tr>
          <tr><td>2 m</td><td>6.562 ft</td><td>Standard door height</td></tr>
          <tr><td>3 m</td><td>9.843 ft</td><td>Ceiling height</td></tr>
          <tr><td>5 m</td><td>16.404 ft</td><td>Small boat length</td></tr>
          <tr><td>10 m</td><td>32.808 ft</td><td>Diving board height</td></tr>
          <tr><td>25 m</td><td>82.021 ft</td><td>Short pool length</td></tr>
          <tr><td>50 m</td><td>164.042 ft</td><td>Olympic pool length</td></tr>
          <tr><td>100 m</td><td>328.084 ft</td><td>Sprint distance</td></tr>
          <tr><td>1000 m</td><td>3280.840 ft</td><td>1 kilometer</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'feet-to-meters', 'cm-to-inches'],
  },
  {
    slug: 'cups-to-ml',
    name: 'Cups to Milliliters Converter',
    shortDescription: 'Convert cups to milliliters instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/cups-to-ml',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Cups to Milliliters Converter | clevr.tools',
    metaDescription: 'Convert cups to milliliters instantly. 1 cup = 236.6 mL. Free converter with reference table for cooking.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are following a recipe from an American cookbook and it calls for 1 3/4 cups of milk, but your measuring tools are metric. Or you found a great recipe online from a European site measured in milliliters and you only have cup measures in your kitchen. This conversion comes up every time a recipe crosses the Atlantic — American recipes use cups, while most of the rest of the world measures liquids in milliliters and liters.</p>
      <p>The standard US cup equals 236.588 mL. This is different from the metric cup used in Australia (250 mL) and the imperial cup used in older British recipes (284 mL), so always check which system a recipe is using. When this converter says "cup," it means the US customary cup — the one printed on every American measuring cup set.</p>

      <h2>Good to know</h2>
      <p><strong>A US cup is not exactly 250 mL.</strong> It is 236.588 mL. This 14 mL difference seems small but can matter in baking, where precision counts. If a recipe calls for 4 cups of flour and you round up to 1,000 mL (4 x 250), you will add about 54 mL too much — enough to noticeably affect a cake's texture.</p>
      <p><strong>Australian and UK cups are different sizes.</strong> The Australian metric cup is exactly 250 mL. The old imperial cup (UK) is 284 mL. If you are following a recipe from an Australian cookbook and you are in the US, your cups will measure slightly less than intended. For cooking this usually does not matter; for baking, it can.</p>
      <p><strong>Weighing is more accurate than volume for dry ingredients.</strong> A "cup of flour" can vary by 20–30% depending on how you scoop it. Professional bakers weigh ingredients in grams. But for liquids — water, milk, broth — volume measurements are perfectly accurate, and cups-to-mL conversion gives you precise results.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Cups (US)</th><th>Milliliters</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1/8 cup</td><td>30 mL</td><td>2 tablespoons</td></tr>
          <tr><td>1/4 cup</td><td>59 mL</td><td>Small sauce amount</td></tr>
          <tr><td>1/3 cup</td><td>79 mL</td><td>Oil for baking</td></tr>
          <tr><td>1/2 cup</td><td>118 mL</td><td>Butter (1 stick)</td></tr>
          <tr><td>2/3 cup</td><td>158 mL</td><td>Sugar for cookies</td></tr>
          <tr><td>3/4 cup</td><td>177 mL</td><td>Common recipe measure</td></tr>
          <tr><td>1 cup</td><td>237 mL</td><td>Standard measure</td></tr>
          <tr><td>1.5 cups</td><td>355 mL</td><td>Rice for 3 servings</td></tr>
          <tr><td>2 cups</td><td>473 mL</td><td>About 1 pint</td></tr>
          <tr><td>3 cups</td><td>710 mL</td><td>Broth for soup</td></tr>
          <tr><td>4 cups</td><td>946 mL</td><td>About 1 quart</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-cooking', 'convert-volume', 'liters-to-gallons'],
  },
  {
    slug: 'lbs-to-kg',
    name: 'Pounds to KG Converter',
    shortDescription: 'Convert pounds to kilograms instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/lbs-to-kg',
    acceptedFormats: [],
    icon: 'Weight',
    metaTitle: 'Pounds to KG Converter | clevr.tools',
    metaDescription: 'Convert pounds to kilograms instantly. 1 lb = 0.4536 kg. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You weigh 165 pounds and a medication dosage is based on weight in kilograms. Or you are shipping a package internationally and the carrier needs the weight in kilograms. Or you have just hit a personal record on the bench press and want to tell your European training partner what you lifted in units they understand. Multiply pounds by 0.45359237 to get kilograms — or type the number here and skip the math.</p>
      <p>This conversion is the reverse of kg-to-lbs and comes up in the same contexts: fitness, medical settings, international shipping, and travel. Most of the world uses kilograms for body weight, so if you are filling out any form outside the US — a hospital intake form, a gym membership, a visa application — you will need your weight in kilograms.</p>

      <h2>Good to know</h2>
      <p><strong>Quick mental math: divide by 2.2.</strong> For a rough estimate, divide pounds by 2 and subtract 10% of the result. So 150 lbs becomes 75 minus 7.5 = 67.5 kg (actual: 68.0 kg). Close enough for most practical purposes.</p>
      <p><strong>Medical dosing uses kilograms.</strong> Drug dosages are calculated in mg per kg of body weight. Getting this conversion wrong can mean under- or over-dosing, especially in pediatric medicine where margins are tighter. This is one context where precision matters — use the full decimal, not a rough estimate.</p>
      <p><strong>The pound has multiple definitions historically.</strong> The pound used in the US and UK today is the avoirdupois pound (453.59237 grams). Troy pounds (used for precious metals) are lighter at 373.24 grams. When someone says "a pound of gold," they technically mean a troy pound, which is less than a pound of feathers in the avoirdupois system — a favorite trick question with a genuinely interesting answer.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Pounds</th><th>Kilograms</th><th>Common Use</th></tr></thead>
        <tbody>
          <tr><td>1 lb</td><td>0.454 kg</td><td>Package of butter</td></tr>
          <tr><td>5 lbs</td><td>2.268 kg</td><td>Bag of sugar</td></tr>
          <tr><td>10 lbs</td><td>4.536 kg</td><td>Large bag of flour</td></tr>
          <tr><td>25 lbs</td><td>11.340 kg</td><td>Toddler weight</td></tr>
          <tr><td>50 lbs</td><td>22.680 kg</td><td>Checked bag limit</td></tr>
          <tr><td>100 lbs</td><td>45.359 kg</td><td>Small adult weight</td></tr>
          <tr><td>130 lbs</td><td>58.967 kg</td><td>Average female weight (US)</td></tr>
          <tr><td>155 lbs</td><td>70.307 kg</td><td>Moderate adult</td></tr>
          <tr><td>180 lbs</td><td>81.647 kg</td><td>Average male weight (US)</td></tr>
          <tr><td>200 lbs</td><td>90.718 kg</td><td>Large adult</td></tr>
          <tr><td>225 lbs</td><td>102.058 kg</td><td>Heavyweight athlete</td></tr>
          <tr><td>250 lbs</td><td>113.398 kg</td><td>Benchpress reference</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-weight', 'kg-to-lbs', 'oz-to-grams'],
  },
  {
    slug: 'mm-to-inches',
    name: 'Millimeters to Inches Converter',
    shortDescription: 'Convert millimeters to inches instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/mm-to-inches',
    acceptedFormats: [],
    icon: 'Ruler',
    metaTitle: 'Millimeters to Inches Converter | clevr.tools',
    metaDescription: 'Convert millimeters to inches instantly. 1 mm = 0.03937 inches. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are ordering a machine part from a metric-country supplier and the specs say 12.7 mm — is that going to fit your half-inch socket? Or you are buying jewelry and the band width is listed as 6 mm and you want to visualize that in inches. Millimeter-to-inch conversion is critical in engineering, manufacturing, 3D printing, jewelry, and any precision work where small measurements cross between metric and imperial systems.</p>
      <p>The formula is simple: divide millimeters by 25.4 to get inches. One inch equals exactly 25.4 mm — this is the international standard. So 10 mm is 0.3937 inches, 25.4 mm is exactly 1 inch, and 50 mm is 1.9685 inches. At this scale, even small rounding errors can matter, so the converter carries enough decimal places for precision work.</p>

      <h2>Good to know</h2>
      <p><strong>25.4 mm per inch is exact.</strong> This is a defined relationship, not a measured one. Every mm-to-inches conversion is mathematically precise — the only question is how many decimal places you need for your application. For woodworking, two decimal places are fine. For machining, you may need four or more.</p>
      <p><strong>Wrench and socket sizes straddle both systems.</strong> A 13 mm wrench is close to but not exactly 1/2 inch (12.7 mm). A 10 mm socket is near 3/8 inch (9.525 mm). Using metric wrenches on imperial bolts (or vice versa) can round off bolt heads. Knowing the exact mm equivalents of common fractional-inch sizes prevents stripped hardware.</p>
      <p><strong>Rainfall is measured in millimeters in most countries.</strong> When a weather report says 25 mm of rain fell, that is about 1 inch. Light rain is 1–2 mm/hr, moderate is 2–8 mm/hr, and heavy is above 8 mm/hr. Knowing the inch equivalents makes international weather reports more intuitive.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Millimeters</th><th>Inches</th><th>Fractional Inch (nearest)</th></tr></thead>
        <tbody>
          <tr><td>1 mm</td><td>0.039 in</td><td>~1/32"</td></tr>
          <tr><td>2 mm</td><td>0.079 in</td><td>~5/64"</td></tr>
          <tr><td>3 mm</td><td>0.118 in</td><td>~1/8"</td></tr>
          <tr><td>5 mm</td><td>0.197 in</td><td>~3/16"</td></tr>
          <tr><td>6.35 mm</td><td>0.250 in</td><td>1/4" (exact)</td></tr>
          <tr><td>8 mm</td><td>0.315 in</td><td>~5/16"</td></tr>
          <tr><td>10 mm</td><td>0.394 in</td><td>~3/8"</td></tr>
          <tr><td>12.7 mm</td><td>0.500 in</td><td>1/2" (exact)</td></tr>
          <tr><td>15 mm</td><td>0.591 in</td><td>~19/32"</td></tr>
          <tr><td>19.05 mm</td><td>0.750 in</td><td>3/4" (exact)</td></tr>
          <tr><td>25.4 mm</td><td>1.000 in</td><td>1" (exact)</td></tr>
          <tr><td>50.8 mm</td><td>2.000 in</td><td>2" (exact)</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-length', 'cm-to-inches', 'feet-to-meters'],
  },
  {
    slug: 'acres-to-sq-ft',
    name: 'Acres to Square Feet Converter',
    shortDescription: 'Convert acres to square feet instantly with reference table.',
    category: 'calc',
    route: '/calc/convert/acres-to-sq-ft',
    acceptedFormats: [],
    icon: 'ArrowLeftRight',
    metaTitle: 'Acres to Square Feet Converter | clevr.tools',
    metaDescription: 'Convert acres to square feet instantly. 1 acre = 43,560 sq ft. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>You are looking at a land listing that says "0.75 acres" and you want to know the square footage to visualize the lot size. Or you are comparing properties and one is listed in acres while another gives square feet. In US real estate, acres and square feet are the two standard land area units, and converting between them is essential for comparing lots, calculating landscaping costs, and understanding zoning requirements.</p>
      <p>One acre equals exactly 43,560 square feet. That number is not intuitive to most people, which is why having a converter is useful. To put an acre in perspective, it is roughly the size of a football field without the end zones (which is 48,000 sq ft), or about 75% of a football field including end zones. A quarter-acre lot — the classic American suburban lot — is 10,890 square feet.</p>

      <h2>Good to know</h2>
      <p><strong>43,560 is not an arbitrary number.</strong> An acre was originally defined as the area a yoke of oxen could plow in a day — roughly a furlong (660 feet) by a chain (66 feet). Multiply 660 by 66 and you get 43,560 square feet. The number stuck even after oxen stopped being the primary farming technology.</p>
      <p><strong>An acre is the same everywhere in the US.</strong> Unlike some historical land measurements, an acre is standardized. However, in some countries (like Ireland and Scotland), a "statute acre" and a "plantation acre" had different sizes. In the US, one acre always means 43,560 sq ft.</p>
      <p><strong>Acreage does not specify shape.</strong> An acre can be any shape — a square acre would be about 209 feet on each side, but a long narrow acre could be 44 feet by 990 feet. When evaluating land, shape matters as much as area for buildability and usability.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Acres</th><th>Square Feet</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>0.1 acre</td><td>4,356 sq ft</td><td>Small urban lot</td></tr>
          <tr><td>0.25 acre</td><td>10,890 sq ft</td><td>Typical suburban lot</td></tr>
          <tr><td>0.33 acre</td><td>14,375 sq ft</td><td>Third-acre lot</td></tr>
          <tr><td>0.5 acre</td><td>21,780 sq ft</td><td>Half-acre lot</td></tr>
          <tr><td>1 acre</td><td>43,560 sq ft</td><td>Football field (approx)</td></tr>
          <tr><td>2 acres</td><td>87,120 sq ft</td><td>Large residential lot</td></tr>
          <tr><td>5 acres</td><td>217,800 sq ft</td><td>Small farm or estate</td></tr>
          <tr><td>10 acres</td><td>435,600 sq ft</td><td>Small ranch</td></tr>
          <tr><td>40 acres</td><td>1,742,400 sq ft</td><td>Quarter section</td></tr>
          <tr><td>100 acres</td><td>4,356,000 sq ft</td><td>Large farm</td></tr>
          <tr><td>640 acres</td><td>27,878,400 sq ft</td><td>1 square mile (section)</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-area', 'convert-length', 'convert-weight'],
  },
  {
    slug: 'mbps-to-gbps',
    name: 'Mbps to Gbps Converter',
    shortDescription: 'Convert megabits to gigabits per second instantly.',
    category: 'calc',
    route: '/calc/convert/mbps-to-gbps',
    acceptedFormats: [],
    icon: 'Binary',
    metaTitle: 'Mbps to Gbps Converter | clevr.tools',
    metaDescription: 'Convert megabits per second to gigabits per second instantly. 1 Gbps = 1000 Mbps. Free converter with reference table.',
    seoContent: `
      <h2>When to use this</h2>
      <p>Your ISP is advertising a "1 Gbps" plan and you want to know how that compares to your current 300 Mbps connection. Or you are speccing out network switches for an office and need to convert between megabit and gigabit ratings to compare equipment. This converter translates between Mbps (megabits per second) and Gbps (gigabits per second) — the two most common units for describing network and internet speeds.</p>
      <p>The conversion is straightforward: divide Mbps by 1,000 to get Gbps, or multiply Gbps by 1,000 to get Mbps. So 500 Mbps = 0.5 Gbps, and 2.5 Gbps = 2,500 Mbps. While the math is simple, having a converter is useful when comparing plans, reading spec sheets, or quickly translating between units during a conversation with your IT team or internet provider.</p>

      <h2>Good to know</h2>
      <p><strong>Mbps uses base-10 (decimal), not base-2.</strong> In networking, 1 Gbps = 1,000 Mbps (not 1,024). This follows the SI prefix system. Storage uses the binary system (where 1 GB = 1,024 MB in some contexts), but network speeds consistently use decimal prefixes. Do not confuse the two.</p>
      <p><strong>Bits and bytes are different.</strong> Internet speeds are measured in bits per second, but file sizes are measured in bytes. There are 8 bits in a byte. So a 1 Gbps connection can theoretically transfer 125 megabytes per second (1,000 Mbps / 8), not 1,000 MB/s. When your ISP says 100 Mbps, your maximum download speed is about 12.5 MB/s — which is why your downloads seem slower than the advertised speed.</p>
      <p><strong>Real-world speeds are lower than advertised.</strong> Protocol overhead, network congestion, Wi-Fi interference, and server limitations mean you rarely get 100% of your rated speed. A "gigabit" connection typically delivers 800–950 Mbps over a wired Ethernet connection and 400–700 Mbps over Wi-Fi, depending on your router and environment.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Mbps</th><th>Gbps</th><th>Typical Use</th></tr></thead>
        <tbody>
          <tr><td>10 Mbps</td><td>0.01 Gbps</td><td>Basic browsing, email</td></tr>
          <tr><td>25 Mbps</td><td>0.025 Gbps</td><td>HD video streaming</td></tr>
          <tr><td>100 Mbps</td><td>0.1 Gbps</td><td>Standard home internet</td></tr>
          <tr><td>200 Mbps</td><td>0.2 Gbps</td><td>Multi-device household</td></tr>
          <tr><td>300 Mbps</td><td>0.3 Gbps</td><td>Fast home internet</td></tr>
          <tr><td>500 Mbps</td><td>0.5 Gbps</td><td>4K streaming + gaming</td></tr>
          <tr><td>1000 Mbps</td><td>1.0 Gbps</td><td>Gigabit home/office</td></tr>
          <tr><td>2500 Mbps</td><td>2.5 Gbps</td><td>Multi-gig Ethernet</td></tr>
          <tr><td>5000 Mbps</td><td>5.0 Gbps</td><td>5G peak theoretical</td></tr>
          <tr><td>10000 Mbps</td><td>10.0 Gbps</td><td>Data center link</td></tr>
          <tr><td>40000 Mbps</td><td>40.0 Gbps</td><td>High-speed backbone</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['convert-data', 'convert-speed', 'convert-time'],
  },
  {
    slug: 'cps-test',
    name: 'CPS Test',
    shortDescription: 'Test how many clicks per second you can do.',
    category: 'type',
    route: '/type/cps-test',
    acceptedFormats: [],
    icon: 'MousePointer2',
    metaTitle: 'CPS Test — Clicks Per Second Test | clevr.tools',
    metaDescription: 'Free CPS test — measure your clicks per second with 1s, 5s, and 10s modes. Track your best score and compare ranks. Browser-based, no download or signup needed.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>The CPS Test measures how many clicks per second you can sustain — a metric that matters more than you might think. Gamers use it to benchmark their clicking speed for PvP games where rapid-fire clicking is the difference between winning and losing. Minecraft PvP, Roblox combat, and competitive clicker games all reward high CPS, and knowing your baseline is the first step toward improving it.</p>
      <p>Beyond gaming, the CPS test is a fun way to challenge friends, settle debates about who has the fastest trigger finger, or just burn off some energy during a break. The three time modes — 1 second, 5 seconds, and 10 seconds — test different things: the 1-second burst measures your peak speed, while the 10-second test reveals your sustained clicking endurance.</p>
      <p>It is also a useful diagnostic tool. If you suspect your mouse is missing clicks or double-clicking, run a quick CPS test — inconsistent registration will show up immediately in your results. Gamers testing new mice often use CPS tests to compare switches and find which mouse feels most responsive.</p>

      <h2>Good to Know</h2>
      <p><strong>Jitter clicking is the fastest technique.</strong> Jitter clicking involves tensing your forearm muscles to vibrate your finger on the mouse button. It can push CPS above 12-14 but is tiring and hard to sustain. Most people jitter click with their index finger while stabilizing the mouse with their thumb and palm.</p>
      <p><strong>Butterfly clicking doubles your potential.</strong> Alternating two fingers (usually index and middle) on the same mouse button lets you click faster than one finger alone. It takes practice to get both fingers to register cleanly without double-clicks.</p>
      <p><strong>Drag clicking is not the same skill.</strong> Drag clicking exploits mouse switch friction to register dozens of clicks per swipe. It produces artificially high CPS numbers and is banned in most competitive contexts. This test measures genuine clicking speed.</p>
      <p><strong>Your mouse matters.</strong> Mechanical switches with short travel and low debounce times register clicks faster. Optical switches have zero debounce delay, making them technically faster for CPS tests. If you are stuck at 6-7 CPS on a cheap mouse, upgrading can genuinely help.</p>
      <p><strong>Warm up your hand first.</strong> Cold muscles click slower. Flex your fingers, shake out your hand, and do a couple of practice rounds before going for your personal best.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>CPS</th><th>Rank</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>1–4</td><td>Casual</td><td>Normal clicking pace — fine for everyday computer use</td></tr>
          <tr><td>5–7</td><td>Average</td><td>Typical gamer clicking speed with regular technique</td></tr>
          <tr><td>8–10</td><td>Fast</td><td>Above average — competitive in most games</td></tr>
          <tr><td>11–14</td><td>Very Fast</td><td>Jitter clicking range — top 10% of clickers</td></tr>
          <tr><td>15+</td><td>Extreme</td><td>Butterfly or advanced technique — elite speed</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['reaction-time', 'keyboard-tester', 'wpm-test'],
    live: true,
  },
  {
    slug: 'reaction-time',
    name: 'Reaction Time Test',
    shortDescription: 'Measure your reaction time in milliseconds.',
    category: 'type',
    route: '/type/reaction-time',
    acceptedFormats: [],
    icon: 'Activity',
    metaTitle: 'Reaction Time Test — Test Your Reflexes | clevr.tools',
    metaDescription: 'Free reaction time test — measure your reflexes in milliseconds. See your average, best time, and percentile ranking. Works in your browser, no download required.',
    seoContent: `
      <h2>When to Use This</h2>
      <p>Reaction time is one of the most fundamental measures of how fast your brain can process a stimulus and send a signal to your muscles. Gamers test it to benchmark their reflexes for competitive shooters and fighting games where milliseconds decide fights. Athletes use it to track their neural response speed. And everyone else takes it just to find out: how fast am I, really?</p>
      <p>The test is simple — wait for the screen to change color, then click as fast as you can. Your reaction time is measured in milliseconds from the moment the color changes to the moment you click. Take multiple attempts to get a reliable average, since individual tries can vary by 50ms or more depending on attention and anticipation.</p>
      <p>It is also a surprisingly useful self-check. Reaction time is sensitive to sleep deprivation, caffeine intake, time of day, and even mood. Testing yourself at different times can reveal patterns — most people are measurably faster in the late morning than right after waking up or late at night.</p>

      <h2>Good to Know</h2>
      <p><strong>The average human reaction time is about 250ms.</strong> If you are consistently under 250ms, you are faster than most people. Under 200ms is genuinely fast. Under 150ms is exceptional and puts you in the top few percent of the population.</p>
      <p><strong>Your monitor and mouse add latency.</strong> A 60Hz monitor adds up to 16ms of display lag. A wireless mouse can add 1-8ms. High-refresh monitors (144Hz+) and wired mice shave off a few milliseconds that show up in your results. Your true neural reaction time is slightly faster than what the test displays.</p>
      <p><strong>Do not anticipate the signal.</strong> If you click before the color changes, it does not count. The test randomizes the delay to prevent you from timing the pattern. Genuine reaction time means responding to the stimulus, not guessing when it will appear.</p>
      <p><strong>Take at least 5 attempts.</strong> A single trial is unreliable — you might blink, get distracted, or just have a slow moment. Your average over 5+ attempts is a much more accurate measure of your true reaction speed.</p>
      <p><strong>Reaction time is trainable.</strong> Competitive gamers who practice regularly can improve their reaction time by 10-30ms over several weeks. The improvement comes from both faster neural processing and more efficient motor execution.</p>

      <h2>Quick Reference</h2>
      <table>
        <thead><tr><th>Reaction Time</th><th>Rating</th><th>Context</th></tr></thead>
        <tbody>
          <tr><td>100–150ms</td><td>Exceptional</td><td>Top 1% — elite competitive gamer reflexes</td></tr>
          <tr><td>150–200ms</td><td>Fast</td><td>Well above average — strong for competitive gaming</td></tr>
          <tr><td>200–250ms</td><td>Above Average</td><td>Faster than most people — solid reflexes</td></tr>
          <tr><td>250–300ms</td><td>Average</td><td>Typical human reaction time — perfectly normal</td></tr>
          <tr><td>300–400ms</td><td>Below Average</td><td>May indicate fatigue, distraction, or slow input device</td></tr>
          <tr><td>400ms+</td><td>Slow</td><td>Likely distracted or fatigued — try again after rest</td></tr>
        </tbody>
      </table>
    `,
    relatedTools: ['cps-test', 'keyboard-tester', 'typing-test'],
    live: true,
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
