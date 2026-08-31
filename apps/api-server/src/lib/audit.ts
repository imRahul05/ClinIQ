import { db, auditLogs } from "@cliniq/db";
import { logger } from "./logger";

export interface LogPhiAccessParams {
  organizationId: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  patientId?: string;
  action: "read" | "create" | "update" | "delete" | "export";
  resourceType: "PatientChart" | "LabReading" | "Encounter" | "Medication" | "Condition" | "QuestionnaireResponse" | "CallSession";
  resourceId?: string;
  requestPath?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, string | number | boolean | null | undefined | string[]>;
}

export async function logPhiAccess(params: LogPhiAccessParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      organizationId: params.organizationId,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      patientId: params.patientId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      requestPath: params.requestPath,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: params.details,
    });
  } catch (error) {
    logger.error({ error, params }, "Failed to write PHI audit log entry");
  }
}
