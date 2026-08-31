import { http } from "./http";
import type {
  LoginInput,
  RegisterPatientInput,
  AuthResponse,
} from "@cliniq/api-spec";

export type {
  UserRole,
  UserClaims,
  AuthResponse,
} from "@cliniq/api-spec";

export async function loginApi(input: LoginInput): Promise<AuthResponse> {
  return http.post<AuthResponse>("/api/auth/login", input);
}

export async function registerPatientApi(input: RegisterPatientInput): Promise<AuthResponse> {
  return http.post<AuthResponse>("/api/auth/register", input);
}

