import { http } from "./http";
import type {
  PatientProfileResponse,
  LabsResponse,
  MedicationsResponse,
  ConditionsResponse,
  CareGapsResponse,
} from "@cliniq/api-spec";

export type {
  PatientProfileResponse,
  LabReadingItem,
  LabsResponse,
  MedicationItem,
  MedicationsResponse,
  ConditionItem,
  ConditionsResponse,
  CareGapItem,
  CareGapsResponse,
} from "@cliniq/api-spec";

export interface PatientListParams {
  patientId?: string;
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export async function getPatientProfileApi(): Promise<PatientProfileResponse> {
  return http.get<PatientProfileResponse>("/api/patient/profile");
}

export async function getPatientLabsApi(params?: string | PatientListParams): Promise<LabsResponse> {
  const queryParams = typeof params === "string" ? { patientId: params } : params;
  return http.get<LabsResponse>("/api/patient/labs-and-vitals", { params: queryParams });
}

export async function getPatientMedicationsApi(params?: string | PatientListParams): Promise<MedicationsResponse> {
  const queryParams = typeof params === "string" ? { patientId: params } : params;
  return http.get<MedicationsResponse>("/api/patient/medications", { params: queryParams });
}

export async function getPatientConditionsApi(params?: string | PatientListParams): Promise<ConditionsResponse> {
  const queryParams = typeof params === "string" ? { patientId: params } : params;
  return http.get<ConditionsResponse>("/api/patient/conditions", { params: queryParams });
}

export async function getPatientCareGapsApi(params?: string | PatientListParams): Promise<CareGapsResponse> {
  const queryParams = typeof params === "string" ? { patientId: params } : params;
  return http.get<CareGapsResponse>("/api/patient/care-gaps", { params: queryParams });
}
