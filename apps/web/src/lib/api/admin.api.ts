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

export async function getAdminAuditLogsApi(params?: {
  patientId?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogsResponse> {
  return http.get<AuditLogsResponse>("/api/audit/logs", { params });
}

export async function getAdminUsersApi(): Promise<AdminUsersResponse> {
  return http.get<AdminUsersResponse>("/api/admin/users");
}

export async function getAdminProvidersApi(): Promise<AdminProvidersResponse> {
  return http.get<AdminProvidersResponse>("/api/admin/providers");
}

export async function getAdminEmployersApi(): Promise<AdminEmployersResponse> {
  return http.get<AdminEmployersResponse>("/api/admin/employers");
}

