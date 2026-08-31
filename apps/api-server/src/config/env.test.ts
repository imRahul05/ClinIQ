import { describe, it, expect } from "vitest";
import { validateEnv } from "./env";

describe("API Server Environment Configuration", () => {
  const validBaseEnv = {
    NODE_ENV: "development",
    PORT: "4000",
    JWT_SECRET: "test-secret-key-12345",
    MEDPLUM_BASE_URL: "http://localhost:8103/",
  };

  it("should successfully parse and structure a valid environment", () => {
    const config = validateEnv({
      ...validBaseEnv,
      LOG_LEVEL: "debug",
      CORS_ORIGIN: "http://localhost:3000",
      ANTHROPIC_API_KEY: "sk-ant-test-key",
      OPENAI_API_KEY: "sk-openai-test-key",
      GOOGLE_GENERATIVE_AI_API_KEY: "google-test-key",
      DEEPGRAM_API_KEY: "dg-test-key",
    });

    expect(config.port).toBe(4000);
    expect(config.nodeEnv).toBe("development");
    expect(config.isDevelopment).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.logLevel).toBe("debug");
    expect(config.jwt.secret).toBe("test-secret-key-12345");
    expect(config.jwt.expiresIn).toBe("7d");
    expect(config.cors.origin).toBe("http://localhost:3000");
    expect(config.medplum.baseUrl).toBe("http://localhost:8103/");
    expect(config.ai.anthropicEnabled).toBe(true);
    expect(config.ai.anthropicApiKey).toBe("sk-ant-test-key");
    expect(config.ai.openaiEnabled).toBe(true);
    expect(config.ai.openaiApiKey).toBe("sk-openai-test-key");
    expect(config.ai.googleEnabled).toBe(true);
    expect(config.ai.googleApiKey).toBe("google-test-key");
    expect(config.ai.deepgramEnabled).toBe(true);
    expect(config.ai.deepgramApiKey).toBe("dg-test-key");
  });

  it("should fail fast with actionable error when JWT_SECRET is missing", () => {
    const invalidEnv = {
      ...validBaseEnv,
      JWT_SECRET: undefined,
    };

    expect(() => validateEnv(invalidEnv)).toThrowError(/JWT_SECRET is required/);
  });

  it("should fail fast with actionable error when NODE_ENV is invalid or missing", () => {
    const invalidEnv = {
      ...validBaseEnv,
      NODE_ENV: "staging",
    };

    expect(() => validateEnv(invalidEnv)).toThrowError(/NODE_ENV is required and must be explicitly set/);
  });

  it("should apply intentional technical defaults for PORT, LOG_LEVEL, CORS_ORIGIN, and MEDPLUM_BASE_URL", () => {
    const config = validateEnv({
      NODE_ENV: "development",
      PORT: "4000",
      JWT_SECRET: "test-secret-key-12345",
    });

    expect(config.port).toBe(4000);
    expect(config.logLevel).toBe("info");
    expect(config.cors.origin).toBe("http://localhost:3000");
    expect(config.medplum.baseUrl).toBe("http://localhost:8103/");
  });

  it("should mark optional AI capabilities as disabled when keys are missing", () => {
    const config = validateEnv({
      ...validBaseEnv,
      ANTHROPIC_API_KEY: undefined,
      DEEPGRAM_API_KEY: "",
    });

    expect(config.ai.anthropicEnabled).toBe(false);
    expect(config.ai.anthropicApiKey).toBeUndefined();
    expect(config.ai.openaiEnabled).toBe(false);
    expect(config.ai.openaiApiKey).toBeUndefined();
    expect(config.ai.googleEnabled).toBe(false);
    expect(config.ai.googleApiKey).toBeUndefined();
    expect(config.ai.deepgramEnabled).toBe(false);
    expect(config.ai.deepgramApiKey).toBeUndefined();
  });

  it("should fail fast when MEDPLUM_BASE_URL is not a valid URL", () => {
    const invalidEnv = {
      ...validBaseEnv,
      MEDPLUM_BASE_URL: "not-a-url",
    };

    expect(() => validateEnv(invalidEnv)).toThrowError(/MEDPLUM_BASE_URL must be a valid URL/);
  });
});
