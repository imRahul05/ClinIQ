import { db, careGaps } from "@cliniq/db";
import { eq, and, sql, desc } from "drizzle-orm";
import type {
  UpdateCareGapInput,
  PaginatedResponse,
} from "@cliniq/api-spec";
import { logPhiAccess } from "../lib/audit";
import { formatPaginatedResponse } from "../lib/pagination";

export interface PaginationOffsetParams {
  page: number;
  pageSize: number;
  offset: number;
}

export interface CloseCareGapParams extends UpdateCareGapInput {
  id: string;
  organizationId: string;
  providerId?: string;
  actorId?: string;
  actorRole?: string;
  requestPath: string;
}

export async function listCareGaps(
  organizationId: string,
  pagination: PaginationOffsetParams
): Promise<PaginatedResponse<typeof careGaps.$inferSelect>> {
  const { page, pageSize, offset } = pagination;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(careGaps)
    .where(eq(careGaps.organizationId, organizationId));

  const totalItems = Number(totalCountResult?.count) || 0;

  const gaps = await db
    .select()
    .from(careGaps)
    .where(eq(careGaps.organizationId, organizationId))
    .orderBy(desc(careGaps.createdAt))
    .limit(pageSize)
    .offset(offset);

  return formatPaginatedResponse(gaps, totalItems, page, pageSize);
}

export async function getCareGapById(
  id: string,
  organizationId: string
): Promise<typeof careGaps.$inferSelect | null> {
  const [gap] = await db
    .select()
    .from(careGaps)
    .where(and(eq(careGaps.id, id), eq(careGaps.organizationId, organizationId)));

  return gap || null;
}

export async function closeCareGap(
  params: CloseCareGapParams
): Promise<typeof careGaps.$inferSelect | null> {
  const {
    id,
    organizationId,
    status,
    evidence,
    closedEncounterId,
    providerId,
    actorId,
    actorRole,
    requestPath,
  } = params;

  const [closedGap] = await db
    .update(careGaps)
    .set({
      status: status || "closed",
      closedDate: new Date().toISOString().slice(0, 10),
      closedEvidence: evidence,
      closedBy: providerId || undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(careGaps.id, id), eq(careGaps.organizationId, organizationId)))
    .returning();

  if (!closedGap) {
    return null;
  }

  await logPhiAccess({
    organizationId,
    actorId,
    actorRole,
    patientId: closedGap.patientId,
    action: "update",
    resourceType: "CareGap" as "PatientChart",
    resourceId: closedGap.id,
    requestPath,
    details: { action: "closed_care_gap", measure: closedGap.measure, closedEncounterId },
  });

  return closedGap;
}
