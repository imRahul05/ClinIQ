import { http } from "./http";

export interface PatientProfileResponse {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
    mrn?: string;
    ohsScore?: string;
    riskTier?: string;
  };
}

export interface LabReadingItem {
  id: string;
  biomarker: string;
  value: string;
  unit?: string;
  readingDate: string;
  referenceRangeLow?: string;
  referenceRangeHigh?: string;
  interpretation?: string;
}

export interface LabsResponse {
  readings: LabReadingItem[];
}

export interface MedicationItem {
  id: string;
  name: string;
  dose?: string;
  frequency?: string;
  prescriber?: string;
  status?: string;
}

export interface MedicationsResponse {
  medications: MedicationItem[];
}

export interface ConditionItem {
  id: string;
  name: string;
  icdCode?: string;
  status?: string;
}

export interface ConditionsResponse {
  conditions: ConditionItem[];
}

export interface CareGapItem {
  id: string;
  measure: string;
  measureName: string;
  hedisCode?: string;
  dueDate?: string;
  status: "open" | "closed";
}

export interface CareGapsResponse {
  careGaps: CareGapItem[];
}

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
