import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: [
      "images.unsplash.com",
      "cdnjs.cloudflare.com",
      "lh3.googleusercontent.com",
      "images.domains",
      "images.remotePatterns",
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
