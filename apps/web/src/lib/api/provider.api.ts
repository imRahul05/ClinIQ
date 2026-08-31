import { http } from "./http";
import type {
  WorklistResponse,
  PatientChartResponse,
  ProviderAvailabilityResponse,
} from "@cliniq/api-spec";

export type {
  WorklistPatient,
  WorklistResponse,
  PatientChartResponse,
  ProviderAvailabilityResponse,
} from "@cliniq/api-spec";

export interface WorklistQueryParams {
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export async function getProviderWorklistApi(params?: WorklistQueryParams): Promise<WorklistResponse> {
  return http.get<WorklistResponse>("/api/provider/worklist", { params });
}

export async function getPatientChartApi(patientId: string): Promise<PatientChartResponse> {
  return http.get<PatientChartResponse>(`/api/provider/chart/${patientId}`);
}

export async function setProviderAvailabilityApi(
  isAvailable: boolean,
  status?: string
): Promise<ProviderAvailabilityResponse> {
  return http.put<ProviderAvailabilityResponse>("/api/provider/availability", {
    isAvailable,
    status,
  });
}
