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
    "Free online file and text utilities: compress images, convert formats, generate QR codes, count words, convert case, and more. All processing happens in your browser — your files and text never leave your device.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
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
