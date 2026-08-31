import { db, auditLogs } from "@cliniq/db";
import { eq, and, desc, sql } from "drizzle-orm";
import type {
  AuditLogQuery,
  PaginationMeta,
} from "@cliniq/api-spec";
import { buildPaginationMeta } from "../lib/pagination";

export interface AuditLogsQueryResult {
  logs: (typeof auditLogs.$inferSelect)[];
  data: (typeof auditLogs.$inferSelect)[];
  pagination: PaginationMeta;
}

export async function getAuditLogs(
  organizationId: string,
  filter: AuditLogQuery
): Promise<AuditLogsQueryResult> {
  const { limit, offset, patientId, actorId } = filter;

  const whereClause =
    patientId && actorId
      ? and(
          eq(auditLogs.organizationId, organizationId),
          eq(auditLogs.patientId, patientId),
          eq(auditLogs.actorId, actorId)
        )
      : patientId
      ? and(eq(auditLogs.organizationId, organizationId), eq(auditLogs.patientId, patientId))
      : actorId
      ? and(eq(auditLogs.organizationId, organizationId), eq(auditLogs.actorId, actorId))
      : eq(auditLogs.organizationId, organizationId);

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(whereClause);

  const totalItems = Number(totalCountResult?.count) || 0;
  const page = Math.floor(offset / limit) + 1;

  const logs = await db
    .select()
    .from(auditLogs)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    logs,
    data: logs,
    pagination: buildPaginationMeta(totalItems, page, limit),
  };
}
