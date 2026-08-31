import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSystemStatus, _resetStatusCacheForTesting } from "../domain/status.domain";
import { getSystemStatusController } from "../controllers/status.controller";
import { SystemStatusResponseSchema } from "@cliniq/api-spec";
import type { Request, Response } from "express";
import { pool } from "@cliniq/db";

describe("Secure Public System Status Domain & Controller", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    _resetStatusCacheForTesting();
  });

  describe("getSystemStatus Domain Service", () => {
    it("should return a fully schema-valid SystemStatusResponse", async () => {
      vi.spyOn(pool, "query").mockImplementation(
        async () => ({ rows: [{ "?column?": 1 }] }) as unknown as Promise<import("pg").QueryResult>
      );

      const status = await getSystemStatus(true);

      const parsed = SystemStatusResponseSchema.safeParse(status);
      expect(parsed.success).toBe(true);
      expect(status.overall).toBeDefined();
      expect(Array.isArray(status.coreServices)).toBe(true);
      expect(Array.isArray(status.thirdPartyServices)).toBe(true);
    });

    it("should contain core platform subsystems", async () => {
      vi.spyOn(pool, "query").mockImplementation(
        async () => ({ rows: [{ "?column?": 1 }] }) as unknown as Promise<import("pg").QueryResult>
      );

      const status = await getSystemStatus(true);
      const coreIds = status.coreServices.map((s) => s.id);

      expect(coreIds).toContain("auth_gateway");
      expect(coreIds).toContain("database");
      expect(coreIds).toContain("medplum_fhir");
      expect(coreIds).toContain("webrtc_signaling");
      expect(coreIds).toContain("scribe_engine");
    });

    it("should aggregate external third-party dependencies (Anthropic, OpenAI, Google AI, Medplum)", async () => {
      const status = await getSystemStatus(true);
      const providers = status.thirdPartyServices.map((p) => p.provider);

      expect(providers).toContain("anthropic");
      expect(providers).toContain("openai");
      expect(providers).toContain("google_ai");
      expect(providers).toContain("medplum_fhir");
    });

    it("should use in-memory TTL caching on subsequent requests", async () => {
      const dbSpy = vi.spyOn(pool, "query").mockImplementation(
        async () => ({ rows: [{ "?column?": 1 }] }) as unknown as Promise<import("pg").QueryResult>
      );

      const firstCall = await getSystemStatus(true);
      const firstCallsCount = dbSpy.mock.calls.length;

      // Second call without forceRefresh should hit cache
      const secondCall = await getSystemStatus(false);
      expect(secondCall.timestamp).toBe(firstCall.timestamp);
      expect(dbSpy.mock.calls.length).toBe(firstCallsCount);
    });

    it("should gracefully degrade without throwing when database is unreachable", async () => {
      vi.spyOn(pool, "query").mockRejectedValueOnce(new Error("Connection refused"));

      const status = await getSystemStatus(true);
      expect(status.overall).toBe("major_outage");

      const dbService = status.coreServices.find((s) => s.id === "database");
      expect(dbService?.status).toBe("outage");
      expect(dbService?.message).toBe("Database connection unreachable or timed out");
      // Verify no sensitive connection string details leaked in message
      expect(dbService?.message).not.toContain("Connection refused");
    });
  });

  describe("getSystemStatusController HTTP Handling", () => {
    it("should set strict cache-control and security headers", async () => {
      const mockReq = {
        query: {},
      } as unknown as Request;

      const headers: Record<string, string> = {};
      let responseStatusCode = 0;
      let responseBody: unknown = null;

      const mockRes = {
        setHeader(name: string, value: string) {
          headers[name] = value;
          return mockRes;
        },
        status(code: number) {
          responseStatusCode = code;
          return mockRes;
        },
        json(data: unknown) {
          responseBody = data;
          return mockRes;
        },
      } as unknown as Response;

      await getSystemStatusController(mockReq, mockRes);

      expect(responseStatusCode).toBe(200);
      expect(headers["Cache-Control"]).toBe("public, max-age=30, s-maxage=60, stale-while-revalidate=120");
      expect(headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(headers["X-Frame-Options"]).toBe("DENY");
      expect(responseBody).toBeDefined();
    });
  });
});
