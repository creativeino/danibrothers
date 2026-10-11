import type { NextConfig } from "next"

const API_URL = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Next 16 defaults `qualities` to [75]; anything else must be listed here.
    qualities: [75, 90],
  },
  // Admin photo uploads travel through a Server Action, whose body limit is
  // 1 MB by default — 25 MB images plus multipart overhead need the headroom.
  experimental: {
    serverActions: {
      bodySizeLimit: "26mb",
    },
  },
  // Admin uploads are stored on the API, not in `public/`, so the database
  // only ever holds `/uploads/<file>` — a path that survives an API host
  // change. The image optimizer runs local srcs through this same pipeline.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }]
  },
}

export default nextConfig
