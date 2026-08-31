import {
  db,
  patients,
  financialEventLedger,
  careGaps,
} from "@cliniq/db";
import { eq, and, desc } from "drizzle-orm";
import type {
  EmployerOverviewResponse,
  SavingsLedgerResponse,
  HedisGapsResponse,
} from "@cliniq/api-spec";

export async function getEmployerOverview(
  organizationId: string,
  employerId?: string
): Promise<EmployerOverviewResponse> {
  const empPatients = await db
    .select()
    .from(patients)
    .where(
      employerId
        ? and(eq(patients.organizationId, organizationId), eq(patients.employerId, employerId))
        : eq(patients.organizationId, organizationId)
    );

  const totalMembers = empPatients.length;
  const riskCounts = {
    low: empPatients.filter((p) => p.riskTier === "low").length,
    moderate: empPatients.filter((p) => p.riskTier === "moderate").length,
    high: empPatients.filter((p) => p.riskTier === "high").length,
    rising: empPatients.filter((p) => p.riskTier === "rising").length,
  };

  const avgOhs =
    totalMembers > 0
      ? Number(
          (
            empPatients.reduce((acc, p) => acc + (Number(p.ohsScore) || 75), 0) / totalMembers
          ).toFixed(1)
        )
      : 0;

  return {
    totalCoveredLives: totalMembers,
    averageOhs: avgOhs,
    riskDistribution: riskCounts,
  };
}

export async function getEmployerSavingsLedger(
  organizationId: string,
  employerId?: string
): Promise<SavingsLedgerResponse> {
  const events = await db
    .select()
    .from(financialEventLedger)
    .where(
      employerId
        ? and(eq(financialEventLedger.organizationId, organizationId), eq(financialEventLedger.employerId, employerId))
        : eq(financialEventLedger.organizationId, organizationId)
    )
    .orderBy(desc(financialEventLedger.eventDate));

  const totalGrossSavings = events.reduce((sum, ev) => sum + Number(ev.grossSavings), 0);
  const totalNetSavings = events.reduce((sum, ev) => sum + Number(ev.netSavings), 0);
  const totalErAvoided = events.filter((ev) => ev.eventType === "er_avoided").length;

  // Calculate dynamic PMPM based on active covered lives
  const [patientCount] = await db
    .select()
    .from(patients)
    .where(
      employerId
        ? and(eq(patients.organizationId, organizationId), eq(patients.employerId, employerId))
        : eq(patients.organizationId, organizationId)
    );

  const activeLives = patientCount ? 1 : 0;
  const estimatedPmpmSavings = activeLives > 0 ? Number((totalNetSavings / activeLives / 12).toFixed(2)) : 0;

  const formattedEvents = events.slice(0, 20).map((ev) => ({
    id: ev.id,
    eventType: ev.eventType,
    grossSavings: String(ev.grossSavings),
    netSavings: String(ev.netSavings),
    eventDate: ev.eventDate ? (typeof ev.eventDate === "string" ? ev.eventDate : new Date(ev.eventDate).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
  }));

  return {
    totalErAvoided,
    grossSavings: Number(totalGrossSavings.toFixed(2)),
    netSavings: Number(totalNetSavings.toFixed(2)),
    estimatedPmpmSavings,
    recentEvents: formattedEvents,
  };
}

export async function getEmployerHedisGaps(
  organizationId: string
): Promise<HedisGapsResponse> {
  const gaps = await db
    .select()
    .from(careGaps)
    .where(eq(careGaps.organizationId, organizationId));

  const total = gaps.length;
  const closed = gaps.filter((g) => g.status === "closed").length;
  const closureRatePercent = total > 0 ? Number(((closed / total) * 100).toFixed(1)) : 0;

  return {
    totalGaps: total,
    closedGaps: closed,
    closureRatePercent,
  };
}
