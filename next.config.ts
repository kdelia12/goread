import type { NextConfig } from "next";
import { allSecurityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.gutenberg.org" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  async headers() {
    const headers = allSecurityHeaders({
      dev: process.env.NODE_ENV !== "production",
    });
    return [
      {
        source: "/:path*",
        headers: Object.entries(headers).map(([key, value]) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;
