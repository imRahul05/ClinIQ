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

export async function getPatientProfileApi(): Promise<PatientProfileResponse> {
  return http.get<PatientProfileResponse>("/api/patient/profile");
}

export async function getPatientLabsApi(patientId?: string): Promise<LabsResponse> {
  return http.get<LabsResponse>("/api/patient/labs-and-vitals", { params: { patientId } });
}

export async function getPatientMedicationsApi(patientId?: string): Promise<MedicationsResponse> {
  return http.get<MedicationsResponse>("/api/patient/medications", { params: { patientId } });
}

export async function getPatientConditionsApi(patientId?: string): Promise<ConditionsResponse> {
  return http.get<ConditionsResponse>("/api/patient/conditions", { params: { patientId } });
}

export async function getPatientCareGapsApi(patientId?: string): Promise<CareGapsResponse> {
  return http.get<CareGapsResponse>("/api/patient/care-gaps", { params: { patientId } });
}

