import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cliniq/ui", "@cliniq/fhir-core", "@cliniq/api-spec"],
  output: "standalone",
};

export default nextConfig;
