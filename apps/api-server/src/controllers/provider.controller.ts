import type { Request, Response } from "express";
import { ProviderAvailabilitySchema } from "@cliniq/api-spec";
import { orgId } from "../middleware/auth";
import { parsePaginationParams } from "../lib/pagination";
import {
  getProviderWorklist,
  updateProviderAvailability,
  getPatientChart,
} from "../domain/provider.domain";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";

/**
 * Handle GET /api/provider/worklist
 */
export async function getProviderWorklistController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getProviderWorklist(currentOrgId, pagination);
  res.json(result);
}

/**
 * Handle PUT / POST /api/provider/availability
 */
export async function updateAvailabilityController(req: Request, res: Response): Promise<void> {
  const parseResult = ProviderAvailabilitySchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid availability parameters");
    return;
  }

  const currentOrgId = orgId(req);
  const providerId = req.user?.providerId;

  if (!providerId) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "No provider associated with current user");
    return;
  }

  const availability = await updateProviderAvailability(
    providerId,
    currentOrgId,
    parseResult.data
  );

  res.json({ availability });
}

/**
 * Handle GET /api/provider/chart/:patientId
 */
export async function getPatientChartController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const rawId = req.params.patientId;
  const patientId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!patientId) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "patientId param is required");
    return;
  }

  const chart = await getPatientChart(patientId, currentOrgId, {
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    requestPath: req.path,
  });

  if (!chart) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Patient chart not found");
    return;
  }

  res.json(chart);
}
