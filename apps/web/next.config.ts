import type { NextConfig } from "next";
import path from "path";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  transpilePackages: ["@cliniq/ui", "@cliniq/fhir-core", "@cliniq/api-spec"],
  outputFileTracingRoot: path.join(__dirname, "../../"), // repo root, since apps/web is 2 levels down

  // Standalone output is required for Docker (self-hosted) deployments.
  // Vercel's build pipeline handles tracing/packaging internally and
  // conflicts with standalone mode on Next.js 16.3+, so we skip it there.
  ...(isVercel ? {} : { output: "standalone" }),
};

export default nextConfig;