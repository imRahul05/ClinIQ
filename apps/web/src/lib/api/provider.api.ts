import { http } from "./http";

export interface WorklistPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ohsScore?: string;
  riskTier?: string;
  hasRecentErVisit?: boolean;
}

export interface WorklistResponse {
  patients: WorklistPatient[];
}

export interface PatientChartResponse {
  patient: WorklistPatient;
  encounters: Array<{
    id: string;
    type: string;
    summary?: string;
    soapNote?: { subjective: string; objective: string; assessment: string; plan: string };
    createdAt: string;
  }>;
  careGaps: Array<{
    id: string;
    measureName: string;
    status: string;
    dueDate?: string;
  }>;
}

export async function getProviderWorklistApi(): Promise<WorklistResponse> {
  return http.get<WorklistResponse>("/api/provider/worklist");
}

export async function getPatientChartApi(patientId: string): Promise<PatientChartResponse> {
  return http.get<PatientChartResponse>(`/api/provider/chart/${patientId}`);
}

export async function setProviderAvailabilityApi(isAvailable: boolean, status?: string): Promise<{ availability: { isAvailable: boolean; status: string } }> {
  return http.post("/api/provider/availability", { isAvailable, status });
}
