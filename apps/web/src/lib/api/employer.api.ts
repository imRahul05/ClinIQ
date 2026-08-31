import { http } from "./http";

export interface EmployerOverviewResponse {
  totalCoveredLives: number;
  averageOhs: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    rising: number;
  };
}

export interface SavingsLedgerResponse {
  totalErAvoided: number;
  grossSavings: number;
  netSavings: number;
  estimatedPmpmSavings: number;
  recentEvents: Array<{
    id: string;
    eventType: string;
    grossSavings: string;
    netSavings: string;
    eventDate: string;
  }>;
}

export interface HedisGapsResponse {
  totalGaps: number;
  closedGaps: number;
  closureRatePercent: number;
}

export async function getEmployerOverviewApi(employerId?: string): Promise<EmployerOverviewResponse> {
  return http.get<EmployerOverviewResponse>("/api/employer/overview", { params: { employerId } });
}

export async function getEmployerSavingsLedgerApi(employerId?: string): Promise<SavingsLedgerResponse> {
  return http.get<SavingsLedgerResponse>("/api/employer/savings-ledger", { params: { employerId } });
}

export async function getEmployerHedisGapsApi(): Promise<HedisGapsResponse> {
  return http.get<HedisGapsResponse>("/api/employer/hedis-gaps");
}
