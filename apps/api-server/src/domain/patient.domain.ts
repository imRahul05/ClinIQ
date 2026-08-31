import {
  db,
  patients,
  conditions,
  medications,
  labReadings,
  careGaps,
} from "@cliniq/db";
import { eq, and, desc, sql } from "drizzle-orm";
import type { UserClaims, PaginatedResponse } from "@cliniq/api-spec";
import { logPhiAccess } from "../lib/audit";
import { formatPaginatedResponse } from "../lib/pagination";

export interface PaginationOffsetParams {
  page: number;
  pageSize: number;
  offset: number;
}

export interface PatientAuditContext {
  actorId?: string;
  actorRole?: string;
  requestPath?: string;
}

export function validateAuthorizedPatientAccess(
  user?: UserClaims,
  requestedPatientId?: string
): { authorizedPatientId?: string; error?: { status: number; code: string; message: string } } {
  const currentPatientId = user?.patientId;
  const targetPatientId = requestedPatientId || currentPatientId;

  if (!targetPatientId) {
    return {
      error: {
        status: 400,
        code: "BAD_REQUEST",
        message: "Patient ID is required",
      },
    };
  }

  // If querying another patient's records, require clinical or admin role
  if (currentPatientId && targetPatientId !== currentPatientId) {
    const role = user?.role;
    const isStaff =
      user?.isAdmin ||
      ["physician", "nurse", "care_coordinator", "admin"].includes(role || "");
    if (!isStaff) {
      return {
        error: {
          status: 403,
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Forbidden: Access to this patient record is not authorized",
        },
      };
    }
  }

  return { authorizedPatientId: targetPatientId };
}

export async function getPatientProfile(
  patientId: string,
  organizationId: string,
  audit?: PatientAuditContext
): Promise<typeof patients.$inferSelect | null> {
  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.organizationId, organizationId)));

  if (!patient) {
    return null;
  }

  if (audit?.requestPath) {
    await logPhiAccess({
      organizationId,
      actorId: audit.actorId,
      actorRole: audit.actorRole,
      patientId: patient.id,
      action: "read",
      resourceType: "PatientChart",
      resourceId: patient.id,
      requestPath: audit.requestPath,
    });
  }

  return patient;
}

export async function getPatientLabsAndVitals(
  patientId: string,
  organizationId: string,
  pagination: PaginationOffsetParams,
  audit?: PatientAuditContext
): Promise<{ readings: (typeof labReadings.$inferSelect)[] } & PaginatedResponse<typeof labReadings.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(labReadings)
    .where(and(eq(labReadings.patientId, patientId), eq(labReadings.organizationId, organizationId)));

  const totalItems = Number(totalCountResult?.count) || 0;

  const readings = await db
    .select()
    .from(labReadings)
    .where(and(eq(labReadings.patientId, patientId), eq(labReadings.organizationId, organizationId)))
    .orderBy(desc(labReadings.readingDate))
    .limit(pageSize)
    .offset(offset);

  if (audit?.requestPath) {
    await logPhiAccess({
      organizationId,
      actorId: audit.actorId,
      actorRole: audit.actorRole,
      patientId,
      action: "read",
      resourceType: "LabReading",
      requestPath: audit.requestPath,
    });
  }

  return {
    readings,
    ...formatPaginatedResponse(readings, totalItems, page, pageSize),
  };
}

export async function getPatientMedications(
  patientId: string,
  organizationId: string,
  pagination: PaginationOffsetParams,
  audit?: PatientAuditContext
): Promise<{ medications: (typeof medications.$inferSelect)[] } & PaginatedResponse<typeof medications.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(medications)
    .where(and(eq(medications.patientId, patientId), eq(medications.organizationId, organizationId)));

  const totalItems = Number(totalCountResult?.count) || 0;

  const meds = await db
    .select()
    .from(medications)
    .where(and(eq(medications.patientId, patientId), eq(medications.organizationId, organizationId)))
    .limit(pageSize)
    .offset(offset);

  if (audit?.requestPath) {
    await logPhiAccess({
      organizationId,
      actorId: audit.actorId,
      actorRole: audit.actorRole,
      patientId,
      action: "read",
      resourceType: "Medication",
      requestPath: audit.requestPath,
    });
  }

  return {
    medications: meds,
    ...formatPaginatedResponse(meds, totalItems, page, pageSize),
  };
}

export async function getPatientConditions(
  patientId: string,
  organizationId: string,
  pagination: PaginationOffsetParams,
  audit?: PatientAuditContext
): Promise<{ conditions: (typeof conditions.$inferSelect)[] } & PaginatedResponse<typeof conditions.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(conditions)
    .where(and(eq(conditions.patientId, patientId), eq(conditions.organizationId, organizationId)));

  const totalItems = Number(totalCountResult?.count) || 0;

  const conds = await db
    .select()
    .from(conditions)
    .where(and(eq(conditions.patientId, patientId), eq(conditions.organizationId, organizationId)))
    .limit(pageSize)
    .offset(offset);

  if (audit?.requestPath) {
    await logPhiAccess({
      organizationId,
      actorId: audit.actorId,
      actorRole: audit.actorRole,
      patientId,
      action: "read",
      resourceType: "Condition",
      requestPath: audit.requestPath,
    });
  }

  return {
    conditions: conds,
    ...formatPaginatedResponse(conds, totalItems, page, pageSize),
  };
}

export async function getPatientCareGaps(
  patientId: string,
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<{ careGaps: (typeof careGaps.$inferSelect)[] } & PaginatedResponse<typeof careGaps.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(careGaps)
    .where(and(eq(careGaps.patientId, patientId), eq(careGaps.organizationId, organizationId)));

  const totalItems = Number(totalCountResult?.count) || 0;

  const gaps = await db
    .select()
    .from(careGaps)
    .where(and(eq(careGaps.patientId, patientId), eq(careGaps.organizationId, organizationId)))
    .limit(pageSize)
    .offset(offset);

  return {
    careGaps: gaps,
    ...formatPaginatedResponse(gaps, totalItems, page, pageSize),
  };
}
