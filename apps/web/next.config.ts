import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@cliniq/ui", "@cliniq/fhir-core", "@cliniq/api-spec"],
  outputFileTracingRoot: path.join(__dirname, "../../"), // repo root, since apps/web is 2 levels down
};

export default nextConfig;