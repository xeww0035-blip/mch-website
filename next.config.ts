import type { NextConfig } from "next";
import path from "path";

const deployTarget = process.env.DEPLOY_TARGET || "";
const basePath = deployTarget === "github-pages" ? "/mch-website" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.join(__dirname),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // 静态导出在 GitHub Pages / Cloudflare Pages 部署时启用
  ...(deployTarget
    ? {
        output: "export" as const,
        trailingSlash: true,
        basePath,
        images: { unoptimized: true },
      }
    : {
        images: {
          formats: ["image/avif", "image/webp"],
          deviceSizes: [360, 640, 768, 1024, 1280, 1920],
          imageSizes: [16, 32, 48, 64, 96, 128, 256],
        },
      }),
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
