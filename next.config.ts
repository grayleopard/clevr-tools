import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
];

if (!isProduction) {
  scriptSrc.push("'unsafe-eval'");
}

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://stats.g.doubleclick.net",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
];

const nextConfig: NextConfig = {
  experimental: {
    cssChunking: "strict",
    inlineCss: true,
    optimizeCss: true,
  },
  async redirects() {
    return [
      {
        source: "/files/image-resizer",
        destination: "/tools/resize-image",
        permanent: true,
      },
    ];
  },
  async headers() {
    const headers = [
      {
        key: "Content-Security-Policy",
        value: cspDirectives.join("; "),
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-site",
      },
    ];

    if (isProduction) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
