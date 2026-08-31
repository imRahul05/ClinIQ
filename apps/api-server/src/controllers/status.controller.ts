import type { Request, Response } from "express";
import { getSystemStatus } from "../domain/status.domain";
import { logger } from "../lib/logger";

/**
 * Controller handling public System Status endpoint queries.
 * Enforces zero PHI leakage, secure response headers, and HTTP cache policies.
 */
export async function getSystemStatusController(req: Request, res: Response): Promise<void> {
  try {
    const forceRefresh = req.query.fresh === "true" || req.query.fresh === "1";
    const statusData = await getSystemStatus(forceRefresh);

    // Set aggressive edge caching and security headers
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");

    res.status(200).json(statusData);
  } catch (error) {
    logger.error({ err: error }, "Unexpected failure in status controller");
    
    // Secure fallback: Never leak raw error objects or stack traces to public callers
    res.status(200).json({
      overall: "degraded_performance",
      message: "Status telemetry temporarily degraded. Core operational checks underway.",
      timestamp: new Date().toISOString(),
      cachedUntil: new Date(Date.now() + 30000).toISOString(),
      coreServices: [],
      thirdPartyServices: [],
    });
  }
}
