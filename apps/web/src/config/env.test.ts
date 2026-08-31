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

  it("should accept valid HTTP, HTTPS, WS, and WSS configurations", () => {
    const config = validateClientEnv({
      NEXT_PUBLIC_API_URL: "http://api.local.dev",
      NEXT_PUBLIC_WS_URL: "ws://ws.local.dev",
      NEXT_PUBLIC_MEDPLUM_BASE_URL: "https://fhir.cliniq.io",
    });

    expect(config.apiUrl).toBe("http://api.local.dev");
    expect(config.wsUrl).toBe("ws://ws.local.dev");
    expect(config.medplumBaseUrl).toBe("https://fhir.cliniq.io/");
  });

  it("should safely fall back to defaults when environment variables are empty strings or whitespace", () => {
    const config = validateClientEnv({
      NEXT_PUBLIC_API_URL: "",
      NEXT_PUBLIC_WS_URL: "   ",
      NEXT_PUBLIC_MEDPLUM_BASE_URL: "   ",
    });

    expect(config.apiUrl).toBe("http://localhost:4000");
    expect(config.wsUrl).toBe("ws://localhost:4000");
    expect(config.medplumBaseUrl).toBe("http://localhost:8103/");
  });

  it("should safely fall back to defaults when URLs do not have valid http/https schemes", () => {
    const config = validateClientEnv({
      NEXT_PUBLIC_API_URL: "invalid-url",
      NEXT_PUBLIC_WS_URL: "ftp://ws.example.com",
      NEXT_PUBLIC_MEDPLUM_BASE_URL: "fhir.example.com",
    });

    expect(config.apiUrl).toBe("http://localhost:4000");
    expect(config.wsUrl).toBe("ws://localhost:4000");
    expect(config.medplumBaseUrl).toBe("http://localhost:8103/");
  });
});
