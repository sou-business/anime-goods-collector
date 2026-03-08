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
  webpack: (config: any, { dev }: any) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 200,
      };
    }
    return config;
  },
};

export default nextConfig;