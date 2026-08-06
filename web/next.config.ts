import type { NextConfig } from "next";

const isGhPages = process.env.GH_PAGES === "1";

const nextConfig: NextConfig = {
  // Static export for free public hosting (GitHub Pages) — app is client-only demo
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Project site: https://jpeplinski33.github.io/truecomp-cards/
  basePath: isGhPages ? "/truecomp-cards" : "",
  assetPrefix: isGhPages ? "/truecomp-cards" : "",
};

export default nextConfig;
