import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo root sits below the user's home directory, which otherwise makes
  // Turbopack pick up an unrelated lockfile.
  turbopack: { root: __dirname },
};

export default nextConfig;
