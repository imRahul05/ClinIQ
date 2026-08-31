import {
  db,
  patients,
  nurseAvailability,
  encounters,
  careGaps,
} from "@cliniq/db";
import { eq, and, desc, sql } from "drizzle-orm";
import type {
  ProviderAvailabilityInput,
  PaginatedResponse,
} from "@cliniq/api-spec";
import { logPhiAccess } from "../lib/audit";
import { formatPaginatedResponse } from "../lib/pagination";

export interface PaginationOffsetParams {
  page: number;
  pageSize: number;
  offset: number;
}

export interface ProviderAuditContext {
  actorId?: string;
  actorRole?: string;
  requestPath?: string;
}

export async function getProviderWorklist(
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<{ patients: (typeof patients.$inferSelect)[] } & PaginatedResponse<typeof patients.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patients)
    .where(eq(patients.organizationId, organizationId));

  const totalItems = Number(totalCountResult?.count) || 0;

  const worklistPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.organizationId, organizationId))
    .limit(pageSize)
    .offset(offset);

  return {
    patients: worklistPatients,
    ...formatPaginatedResponse(worklistPatients, totalItems, page, pageSize),
  };
}

export async function updateProviderAvailability(
  providerId: string,
  organizationId: string,
  input: ProviderAvailabilityInput
): Promise<typeof nurseAvailability.$inferSelect> {
  const { isAvailable, status } = input;

  const [existing] = await db
    .select()
    .from(nurseAvailability)
    .where(eq(nurseAvailability.providerId, providerId));

  if (existing) {
    const [updated] = await db
      .update(nurseAvailability)
      .set({
        isAvailable: Boolean(isAvailable),
        status: status || (isAvailable ? "available" : "offline"),
        lastHeartbeat: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(nurseAvailability.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(nurseAvailability)
    .values({
      providerId,
      organizationId,
      isAvailable: Boolean(isAvailable),
      status: status || (isAvailable ? "available" : "offline"),
    })
    .returning();

  return created;
}

export interface PatientChartData {
  patient: typeof patients.$inferSelect;
  encounters: (typeof encounters.$inferSelect)[];
  careGaps: (typeof careGaps.$inferSelect)[];
}

export async function getPatientChart(
  patientId: string,
  organizationId: string,
  audit?: ProviderAuditContext
): Promise<PatientChartData | null> {
  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.organizationId, organizationId)));

  if (!patient) {
    return null;
  }

  const patientEncounters = await db
    .select()
    .from(encounters)
    .where(and(eq(encounters.patientId, patientId), eq(encounters.organizationId, organizationId)))
    .orderBy(desc(encounters.createdAt))
    .limit(50);

  const patientGaps = await db
    .select()
    .from(careGaps)
    .where(and(eq(careGaps.patientId, patientId), eq(careGaps.organizationId, organizationId)));

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

  return {
    patient,
    encounters: patientEncounters,
    careGaps: patientGaps,
  };
}
