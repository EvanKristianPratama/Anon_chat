import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(currentDir, "../.."),
  experimental: {
    externalDir: true
  },
  transpilePackages: ["@anon/contracts", "@anon/state-machine"],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": currentDir,
      "@anon/contracts": path.join(currentDir, "../../packages/contracts/src"),
      "@anon/state-machine": path.join(currentDir, "../../packages/state-machine/src")
    };
    return config;
  }
};

export default nextConfig;
