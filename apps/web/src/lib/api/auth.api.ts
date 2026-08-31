import { http } from "./http";
import type { LoginInput, RegisterPatientInput } from "@cliniq/api-spec";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "patient" | "physician" | "nurse" | "care_coordinator" | "employer_admin" | "admin";
    firstName?: string;
    lastName?: string;
    organizationId: string;
    patientId?: string;
    providerId?: string;
    employerId?: string;
    isAdmin?: boolean;
  };
}

export async function loginApi(input: LoginInput): Promise<AuthResponse> {
  return http.post<AuthResponse>("/api/auth/login", input);
}

export async function registerPatientApi(input: RegisterPatientInput): Promise<AuthResponse> {
  return http.post<AuthResponse>("/api/auth/register", input);
}
