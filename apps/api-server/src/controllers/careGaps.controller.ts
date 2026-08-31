import type { Request, Response } from "express";
import { UpdateCareGapSchema } from "@cliniq/api-spec";
import { orgId } from "../middleware/auth";
import { parsePaginationParams } from "../lib/pagination";
import {
  listCareGaps,
  getCareGapById,
  closeCareGap,
} from "../domain/careGaps.domain";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";

/**
 * Handle GET /api/care-gaps
 */
export async function listCareGapsController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await listCareGaps(currentOrgId, pagination);
  res.json(result);
}

/**
 * Handle GET /api/care-gaps/:id
 */
export async function getCareGapByIdController(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const currentOrgId = orgId(req);

  if (!id) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "Care gap ID is required");
    return;
  }

  const gap = await getCareGapById(id, currentOrgId);
  if (!gap) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Care gap not found");
    return;
  }

  res.json({ careGap: gap });
}

/**
 * Handle PATCH /api/care-gaps/:id
 */
export async function updateCareGapController(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const currentOrgId = orgId(req);

  if (!id) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "Care gap ID is required");
    return;
  }

  const parseResult = UpdateCareGapSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid care gap closure payload");
    return;
  }

  const closedGap = await closeCareGap({
    id,
    organizationId: currentOrgId,
    providerId: req.user?.providerId,
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    requestPath: req.path,
    ...parseResult.data,
  });

  if (!closedGap) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Care gap not found");
    return;
  }

  res.json({ careGap: closedGap });
}
