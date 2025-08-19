import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cospa.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prisma を server-side バンドルから除外
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;