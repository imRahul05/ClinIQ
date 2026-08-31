import { db, nurseAvailability, providerEmployers } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import { sendToUser, getAvailableProviderIds } from "./ws";
import { logger } from "./logger";

export interface RingResult {
  strategy: "assigned_primary" | "available_on_duty" | "broadcast";
  notifiedProviderIds: string[];
}

export async function ringProvidersForCall(params: {
  organizationId: string;
  employerId?: string;
  assignedNurseId?: string | null;
  callSessionId: string;
  patientName: string;
  reason?: string;
}): Promise<RingResult> {
  const { organizationId, assignedNurseId, callSessionId, patientName, reason } = params;

  const payload = {
    callSessionId,
    patientName,
    reason: reason || "Virtual consultation request",
    timestamp: new Date().toISOString(),
  };

  // Strategy 1: Check if assigned primary nurse is on-duty and online
  if (assignedNurseId) {
    const [nurseRecord] = await db
      .select()
      .from(nurseAvailability)
      .where(
        and(
          eq(nurseAvailability.providerId, assignedNurseId),
          eq(nurseAvailability.isAvailable, true),
          eq(nurseAvailability.status, "available")
        )
      );

    if (nurseRecord) {
      const delivered = sendToUser(assignedNurseId, "incoming_call", payload);
      if (delivered) {
        logger.info({ assignedNurseId, callSessionId }, "Call routed directly to assigned primary nurse");
        return {
          strategy: "assigned_primary",
          notifiedProviderIds: [assignedNurseId],
        };
      }
    }
  }

  // Strategy 2: Fan out to available on-duty nurses in the organization
  const availableNurses = await db
    .select()
    .from(nurseAvailability)
    .where(
      and(
        eq(nurseAvailability.organizationId, organizationId),
        eq(nurseAvailability.isAvailable, true),
        eq(nurseAvailability.status, "available")
      )
    );

  const activeProviderIds = getAvailableProviderIds(organizationId);
  const eligibleIds = availableNurses
    .map((n) => n.providerId)
    .filter((id) => activeProviderIds.includes(id));

  if (eligibleIds.length > 0) {
    for (const providerId of eligibleIds) {
      sendToUser(providerId, "incoming_call", payload);
    }
    logger.info({ eligibleIds, callSessionId }, "Call routed to available on-duty nurse pool");
    return {
      strategy: "available_on_duty",
      notifiedProviderIds: eligibleIds,
    };
  }

  // Strategy 3: Broadcast to all connected providers in org
  for (const providerId of activeProviderIds) {
    sendToUser(providerId, "incoming_call", payload);
  }
  logger.warn({ activeProviderIds, callSessionId }, "Call broadcasted to all connected clinical staff");
  return {
    strategy: "broadcast",
    notifiedProviderIds: activeProviderIds,
  };
}
