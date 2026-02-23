import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "clevr.tools — Free Online File Utilities",
    template: "%s | clevr.tools",
  },
  description:
    "Free online file utilities: compress images, convert formats, generate QR codes, and more. All processing happens in your browser — your files never leave your device.",
  metadataBase: new URL("https://clevr.tools"),
  openGraph: {
    siteName: "clevr.tools",
    images: ["/og-default.png"],
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
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
