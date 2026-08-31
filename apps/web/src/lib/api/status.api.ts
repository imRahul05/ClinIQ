import { http } from "./http";
import type { SystemStatusResponse } from "@cliniq/api-spec";

export type {
  SystemStatusResponse,
  SubsystemStatus,
  ThirdPartyDependencyStatus,
  HealthStatusLevel,
  SystemOverallState,
  ServiceCategory,
} from "@cliniq/api-spec";

export interface StatusQueryParams {
  fresh?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Fetches the operational system status from the public /status endpoint.
 * Zero-leak: Returns aggregated system availability, latencies, and 3rd-party status.
 */
export async function getSystemStatusApi(params?: StatusQueryParams): Promise<SystemStatusResponse> {
  return http.get<SystemStatusResponse>("/api/status", { params });
}
