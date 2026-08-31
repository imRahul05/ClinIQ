import { describe, it, expect } from "vitest";
import { validateClientEnv } from "./env";

describe("Web Client Configuration Validation", () => {
  it("should parse and normalize custom NEXT_PUBLIC environment variables", () => {
    const config = validateClientEnv({
      NEXT_PUBLIC_API_URL: "https://api.cliniq.health/",
      NEXT_PUBLIC_WS_URL: "wss://api.cliniq.health/",
      NEXT_PUBLIC_MEDPLUM_BASE_URL: "https://fhir.cliniq.health",
    });

    expect(config.apiUrl).toBe("https://api.cliniq.health");
    expect(config.wsUrl).toBe("wss://api.cliniq.health");
    expect(config.medplumBaseUrl).toBe("https://fhir.cliniq.health/");
  });

  it("should apply safe defaults when public environment variables are omitted", () => {
    const config = validateClientEnv({});

    expect(config.apiUrl).toBe("http://localhost:4000");
    expect(config.wsUrl).toBe("ws://localhost:4000");
    expect(config.medplumBaseUrl).toBe("http://localhost:8103/");
  });
});
