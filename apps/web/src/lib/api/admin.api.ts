import { http } from "./http";

export interface AuditLogItem {
  id: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  requestPath?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLogItem[];
}

export async function getAdminAuditLogsApi(params?: {
  patientId?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogsResponse> {
  return http.get<AuditLogsResponse>("/api/audit/logs", { params });
}
