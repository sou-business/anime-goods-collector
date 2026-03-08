import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

const domains = [
  '**.cospa.com',
  '**.amnibus.com',
];

const nextConfig = (phase: string): NextConfig => {
  
  const config: NextConfig = {
    images: {
      remotePatterns: domains.map((host) => ({
        protocol: 'https',
        hostname: host,
      })),
    },
  };
  
  // next dev (開発サーバー起動) の時だけ webpack 設定を適用
  // turbopackはNext.jsのホットリロードに対応していないため、webpackでファイル変更を監視
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config.webpack = (config) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 200,
      };
      return config;
    };
  }

  return config;
};

export default nextConfig;