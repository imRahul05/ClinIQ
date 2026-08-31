import type { Request, Response } from "express";
import {
  CreateSoapNoteSchema,
  SignEncounterSchema,
} from "@cliniq/api-spec";
import { orgId } from "../middleware/auth";
import {
  createSoapNote,
  signEncounter,
} from "../domain/scribe.domain";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";

/**
 * Handle POST /api/scribe/notes
 */
export async function createSoapNoteController(req: Request, res: Response): Promise<void> {
  const parseResult = CreateSoapNoteSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid transcript payload");
    return;
  }

  const currentOrgId = orgId(req);
  const result = await createSoapNote({
    ...parseResult.data,
    organizationId: currentOrgId,
  });

  res.status(201).json({
    soapNote: result.soapNote,
    suggestedCodes: result.suggestedIcdCodes,
    summary: result.summary,
  });
}

/**
 * Handle POST /api/scribe/signatures
 */
export async function signEncounterController(req: Request, res: Response): Promise<void> {
  const parseResult = SignEncounterSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid encounter sign payload");
    return;
  }

  const currentOrgId = orgId(req);
  const providerId = req.user?.providerId;

  const signedEncounter = await signEncounter({
    ...parseResult.data,
    organizationId: currentOrgId,
    providerId,
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    requestPath: req.path,
  });

  if (!signedEncounter) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Encounter not found");
    return;
  }

  res.json({ encounter: signedEncounter });
}
