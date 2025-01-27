import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['example.com', 'another-domain.com', 'localhost', 'media.oceanofpdf.com'], // Add all allowed domains
  },
};

export default nextConfig;
