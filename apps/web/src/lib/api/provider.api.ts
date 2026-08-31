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

export async function getProviderWorklistApi(): Promise<WorklistResponse> {
  return http.get<WorklistResponse>("/api/provider/worklist");
}

export async function getPatientChartApi(patientId: string): Promise<PatientChartResponse> {
  return http.get<PatientChartResponse>(`/api/provider/chart/${patientId}`);
}

export async function setProviderAvailabilityApi(
  isAvailable: boolean,
  status?: string
): Promise<ProviderAvailabilityResponse> {
  return http.post<ProviderAvailabilityResponse>("/api/provider/availability", {
    isAvailable,
    status,
  });
}

