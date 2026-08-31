import type { Request, Response } from "express";
import { orgId } from "../middleware/auth";
import { parsePaginationParams } from "../lib/pagination";
import {
  validateAuthorizedPatientAccess,
  getPatientProfile,
  getPatientLabsAndVitals,
  getPatientMedications,
  getPatientConditions,
  getPatientCareGaps,
} from "../domain/patient.domain";
import { sendErrorResponse } from "../middleware/errorHandler";

/**
 * Handle GET /api/patient/profile
 */
export async function getPatientProfileController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const patientId = req.user?.patientId || (req.query.patientId as string);

  if (!patientId) {
    sendErrorResponse(res, 400, "BAD_REQUEST", "No patient associated with current user");
    return;
  }

  const patient = await getPatientProfile(patientId, currentOrgId, {
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    requestPath: req.path,
  });

  if (!patient) {
    sendErrorResponse(res, 404, "RESOURCE_NOT_FOUND", "Patient not found");
    return;
  }

  res.json({ patient });
}

/**
 * Handle GET /api/patient/labs-and-vitals
 */
export async function getPatientLabsController(req: Request, res: Response): Promise<void> {
  const authCheck = validateAuthorizedPatientAccess(req.user, req.query.patientId as string);
  if (authCheck.error || !authCheck.authorizedPatientId) {
    sendErrorResponse(
      res,
      authCheck.error?.status || 400,
      authCheck.error?.code || "BAD_REQUEST",
      authCheck.error?.message || "Invalid patient request"
    );
    return;
  }

  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getPatientLabsAndVitals(
    authCheck.authorizedPatientId,
    currentOrgId,
    pagination,
    {
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      requestPath: req.path,
    }
  );

  res.json(result);
}

/**
 * Handle GET /api/patient/medications
 */
export async function getPatientMedicationsController(req: Request, res: Response): Promise<void> {
  const authCheck = validateAuthorizedPatientAccess(req.user, req.query.patientId as string);
  if (authCheck.error || !authCheck.authorizedPatientId) {
    sendErrorResponse(
      res,
      authCheck.error?.status || 400,
      authCheck.error?.code || "BAD_REQUEST",
      authCheck.error?.message || "Invalid patient request"
    );
    return;
  }

  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getPatientMedications(
    authCheck.authorizedPatientId,
    currentOrgId,
    pagination,
    {
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      requestPath: req.path,
    }
  );

  res.json(result);
}

/**
 * Handle GET /api/patient/conditions
 */
export async function getPatientConditionsController(req: Request, res: Response): Promise<void> {
  const authCheck = validateAuthorizedPatientAccess(req.user, req.query.patientId as string);
  if (authCheck.error || !authCheck.authorizedPatientId) {
    sendErrorResponse(
      res,
      authCheck.error?.status || 400,
      authCheck.error?.code || "BAD_REQUEST",
      authCheck.error?.message || "Invalid patient request"
    );
    return;
  }

  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getPatientConditions(
    authCheck.authorizedPatientId,
    currentOrgId,
    pagination,
    {
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      requestPath: req.path,
    }
  );

  res.json(result);
}

/**
 * Handle GET /api/patient/care-gaps
 */
export async function getPatientCareGapsController(req: Request, res: Response): Promise<void> {
  const authCheck = validateAuthorizedPatientAccess(req.user, req.query.patientId as string);
  if (authCheck.error || !authCheck.authorizedPatientId) {
    sendErrorResponse(
      res,
      authCheck.error?.status || 400,
      authCheck.error?.code || "BAD_REQUEST",
      authCheck.error?.message || "Invalid patient request"
    );
    return;
  }

  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getPatientCareGaps(
    authCheck.authorizedPatientId,
    currentOrgId,
    pagination
  );

  res.json(result);
}
