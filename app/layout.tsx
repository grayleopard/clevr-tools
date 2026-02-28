import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import ClientOverlays from "@/components/layout/ClientOverlays";
import "./globals.css";

export const metadata: Metadata = {
  title: "clevr.tools — Free Online File & Text Tools",
  description:
    "Free online file and text utilities: compress images, convert formats, generate QR codes, count words, convert case, and more. All processing happens in your browser — your files and text never leave your device.",
  metadataBase: new URL("https://clevr.tools"),
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
      <body className={`${GeistSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ClientOverlays />
        </ThemeProvider>
      </body>
    </html>
  );
}
