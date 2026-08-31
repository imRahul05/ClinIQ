import type { Request, Response } from "express";
import {
  CreateCallSessionSchema,
  UpdateCallSessionSchema,
} from "@cliniq/api-spec";
import { orgId } from "../middleware/auth";
import {
  createCall,
  getCallById,
  updateCall,
} from "../domain/calls.domain";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";

/**
 * Handle POST /api/calls
 */
export async function createCallController(req: Request, res: Response): Promise<void> {
  const parseResult = CreateCallSessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid call initiation parameters");
    return;
  }

  const currentOrgId = orgId(req);
  const { result, notFound } = await createCall({
    ...parseResult.data,
    organizationId: currentOrgId,
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    requestPath: req.path,
  });

  if (notFound) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Patient not found");
    return;
  }

  if (!result) {
    sendErrorResponse(res, 500, "INTERNAL_SERVER_ERROR", "Failed to initialize call session");
    return;
  }

  res.status(201).json(result);
}

/**
 * Handle GET /api/calls/:id
 */
export async function getCallController(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const currentOrgId = orgId(req);

  if (!id) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "Call session ID is required");
    return;
  }

  const session = await getCallById(id, currentOrgId);
  if (!session) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Call session not found");
    return;
  }

  res.json({ callSession: session });
}

/**
 * Handle PATCH /api/calls/:id
 */
export async function updateCallController(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const currentOrgId = orgId(req);

  if (!id) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "Call session ID is required");
    return;
  }

  const parseResult = UpdateCallSessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid call update parameters");
    return;
  }

  const updatedSession = await updateCall({
    id,
    organizationId: currentOrgId,
    providerId: req.user?.providerId,
    ...parseResult.data,
  });

  if (!updatedSession) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Call session not found");
    return;
  }

  res.json({ callSession: updatedSession });
}
