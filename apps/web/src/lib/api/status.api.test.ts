import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSystemStatusApi } from "./status.api";
import { http } from "./http";
import type { SystemStatusResponse } from "@cliniq/api-spec";

describe("Status API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch system status via centralized http client", async () => {
    const mockResponse: SystemStatusResponse = {
      overall: "all_systems_operational",
      message: "All systems operational",
      timestamp: "2026-08-31T20:00:00.000Z",
      cachedUntil: "2026-08-31T20:01:00.000Z",
      coreServices: [
        {
          id: "database",
          name: "Neon PostgreSQL Data Layer",
          category: "core_platform",
          status: "operational",
          latencyMs: 14,
          message: "Operating normally",
        },
      ],
      thirdPartyServices: [
        {
          provider: "anthropic",
          name: "Anthropic (Claude 3.7 & 3.5 Models)",
          status: "operational",
          officialStatusUrl: "https://status.anthropic.com",
          lastCheckedAt: "2026-08-31T20:00:00.000Z",
        },
      ],
    };

    const getSpy = vi.spyOn(http, "get").mockResolvedValueOnce(mockResponse);

    const result = await getSystemStatusApi();
    expect(result).toEqual(mockResponse);
    expect(getSpy).toHaveBeenCalledWith("/api/status", { params: undefined });
  });

  it("should pass fresh parameter when requested", async () => {
    const mockResponse: SystemStatusResponse = {
      overall: "all_systems_operational",
      message: "All systems operational",
      timestamp: "2026-08-31T20:00:00.000Z",
      cachedUntil: "2026-08-31T20:01:00.000Z",
      coreServices: [],
      thirdPartyServices: [],
    };

    const getSpy = vi.spyOn(http, "get").mockResolvedValueOnce(mockResponse);

    await getSystemStatusApi({ fresh: true });
    expect(getSpy).toHaveBeenCalledWith("/api/status", { params: { fresh: true } });
  });
});
