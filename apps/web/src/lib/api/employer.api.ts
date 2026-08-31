import { http } from "./http";
import type {
  EmployerOverviewResponse,
  SavingsLedgerResponse,
  HedisGapsResponse,
} from "@cliniq/api-spec";

export type {
  RiskDistribution,
  EmployerOverviewResponse,
  SavingsLedgerEventItem,
  SavingsLedgerResponse,
  HedisGapsResponse,
} from "@cliniq/api-spec";

export async function getEmployerOverviewApi(employerId?: string): Promise<EmployerOverviewResponse> {
  return http.get<EmployerOverviewResponse>("/api/employer/overview", { params: { employerId } });
}

export async function getEmployerSavingsLedgerApi(employerId?: string): Promise<SavingsLedgerResponse> {
  return http.get<SavingsLedgerResponse>("/api/employer/savings-ledger", { params: { employerId } });
}

export async function getEmployerHedisGapsApi(): Promise<HedisGapsResponse> {
  return http.get<HedisGapsResponse>("/api/employer/hedis-gaps");
}

