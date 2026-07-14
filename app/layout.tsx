import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ClientOverlays from "@/components/layout/ClientOverlays";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "clevr.tools — Free Online File & Text Tools",
  description:
    "Free online file and text utilities: compress images, convert formats, generate QR codes, count words, convert case, and more. Processing happens in your browser — your files and text stay on your device.",
  metadataBase: new URL("https://www.clevr.tools"),
  other: {
    "impact-site-verification": "05a1dc41-14e9-4d66-989d-f20e41c74409",
  },
  openGraph: {
    type: "website",
    siteName: "clevr.tools",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "clevr.tools",
  url: "https://www.clevr.tools",
  description:
    "Free online file and text utilities: compress images, convert formats, generate QR codes, count words, convert case, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <ClientOverlays />
        </ThemeProvider>
      </body>
    </html>
  );
}
