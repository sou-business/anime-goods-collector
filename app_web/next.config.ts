import type { NextConfig } from "next";

const domains = [
  '**.cospa.com',
  '**.amnibus.com',
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: domains.map((host) => ({
      protocol: 'https',
      hostname: host,
    })),
  },
};

export default nextConfig;