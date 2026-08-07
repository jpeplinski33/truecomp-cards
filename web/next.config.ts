import type { NextConfig } from "next";

// Custom domain truecompcards.com serves at site root (no /truecomp-cards basePath).
// Set TCC_BASE_PATH=/truecomp-cards only for github.io project URL fallback builds.
const basePath = process.env.TCC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
