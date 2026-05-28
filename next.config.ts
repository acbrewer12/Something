import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // In GitHub Actions, NEXT_PUBLIC_BASE_PATH=/Something is set by the workflow
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
