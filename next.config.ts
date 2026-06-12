import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for production Docker image (multi-stage, minimal runtime).
  output: "standalone",
};

export default nextConfig;
