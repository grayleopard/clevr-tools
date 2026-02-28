import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cssChunking: "strict",
    inlineCss: true,
    optimizeCss: true,
  },
};

export default nextConfig;
