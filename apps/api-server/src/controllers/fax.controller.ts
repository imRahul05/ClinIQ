import type { Request, Response } from "express";
import { CreateFaxSchema } from "@cliniq/api-spec";
import { orgId } from "../middleware/auth";
import { parsePaginationParams } from "../lib/pagination";
import { listFaxInbox, ingestFax } from "../domain/fax.domain";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";

/**
 * Handle GET /api/fax/inbox
 */
export async function listFaxInboxController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await listFaxInbox(currentOrgId, pagination);
  res.json(result);
}

/**
 * Handle POST /api/fax
 */
export async function ingestFaxController(req: Request, res: Response): Promise<void> {
  const parseResult = CreateFaxSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid fax document payload");
    return;
  }

  const currentOrgId = orgId(req);
  const newFax = await ingestFax(currentOrgId, parseResult.data);

  if (!newFax) {
    sendErrorResponse(res, 500, "INTERNAL_SERVER_ERROR", "Failed to ingest fax document");
    return;
  }

  res.status(201).json({ fax: newFax });
}
