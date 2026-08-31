import { http } from "./http";
import type {
  AuditLogsResponse,
  AdminUsersResponse,
  AdminProvidersResponse,
  AdminEmployersResponse,
} from "@cliniq/api-spec";

export type {
  AuditLogItem,
  AuditLogsResponse,
  StaffUserItem,
  AdminUsersResponse,
  AdminProviderItem,
  AdminProvidersResponse,
  AdminEmployerItem,
  AdminEmployersResponse,
} from "@cliniq/api-spec";

export interface AdminQueryParams {
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export async function getAdminAuditLogsApi(params?: {
  patientId?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogsResponse> {
  return http.get<AuditLogsResponse>("/api/audit/logs", { params });
}

export async function getAdminUsersApi(params?: AdminQueryParams): Promise<AdminUsersResponse> {
  return http.get<AdminUsersResponse>("/api/admin/users", { params });
}

export async function getAdminProvidersApi(params?: AdminQueryParams): Promise<AdminProvidersResponse> {
  return http.get<AdminProvidersResponse>("/api/admin/providers", { params });
}

export async function getAdminEmployersApi(params?: AdminQueryParams): Promise<AdminEmployersResponse> {
  return http.get<AdminEmployersResponse>("/api/admin/employers", { params });
}
