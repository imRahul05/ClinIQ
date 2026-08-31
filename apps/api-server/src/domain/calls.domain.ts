import { db, callSessions, patients } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import type {
  CreateCallSessionInput,
  UpdateCallSessionInput,
  RingResult,
} from "@cliniq/api-spec";
import { ringProvidersForCall } from "../lib/callRouting";
import { logPhiAccess } from "../lib/audit";

export interface CreateCallParams extends CreateCallSessionInput {
  organizationId: string;
  actorId?: string;
  actorRole?: string;
  requestPath: string;
}

export interface UpdateCallParams extends UpdateCallSessionInput {
  id: string;
  organizationId: string;
  providerId?: string;
}

export interface CreateCallResult {
  callSession: typeof callSessions.$inferSelect;
  routing: RingResult;
}

export async function createCall(
  params: CreateCallParams
): Promise<{ result?: CreateCallResult; notFound?: boolean }> {
  const { organizationId, patientId, callType, reason, urgency, actorId, actorRole, requestPath } = params;

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.organizationId, organizationId)));

  if (!patient) {
    return { notFound: true };
  }

  const roomName = `cliniq-room-${patientId.slice(0, 8)}-${Date.now()}`;

  const [session] = await db
    .insert(callSessions)
    .values({
      organizationId,
      patientId,
      callType,
      reason,
      urgency,
      roomName,
      status: "ringing",
    })
    .returning();

  if (!session) {
    return {};
  }

  // Trigger 3-tier smart call routing
  const routing = await ringProvidersForCall({
    organizationId,
    assignedNurseId: patient.assignedNurseId,
    callSessionId: session.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    reason,
  });

  await logPhiAccess({
    organizationId,
    actorId,
    actorRole,
    patientId,
    action: "create",
    resourceType: "CallSession",
    resourceId: session.id,
    requestPath,
  });

  return {
    result: {
      callSession: session,
      routing,
    },
  };
}

export async function getCallById(
  id: string,
  organizationId: string
): Promise<typeof callSessions.$inferSelect | null> {
  const [session] = await db
    .select()
    .from(callSessions)
    .where(and(eq(callSessions.id, id), eq(callSessions.organizationId, organizationId)));

  return session || null;
}

export async function updateCall(
  params: UpdateCallParams
): Promise<typeof callSessions.$inferSelect | null> {
  const { id, organizationId, status, nurseId, durationSeconds, transcriptText, reason, providerId } = params;
  const effectiveProviderId = nurseId || providerId;

  const updateFields: Record<string, unknown> = {};

  if (status) {
    updateFields.status = status;
    if (status === "in_progress") {
      updateFields.answeredAt = new Date();
      if (effectiveProviderId) {
        updateFields.nurseId = effectiveProviderId;
      }
    } else if (status === "completed" || status === "cancelled") {
      updateFields.endedAt = new Date();
    }
  }

  if (durationSeconds !== undefined) {
    updateFields.durationSeconds = durationSeconds;
  }
  if (transcriptText !== undefined) {
    updateFields.transcriptText = transcriptText;
  }
  if (reason !== undefined) {
    updateFields.reason = reason;
  }

  const [updatedSession] = await db
    .update(callSessions)
    .set(updateFields)
    .where(and(eq(callSessions.id, id), eq(callSessions.organizationId, organizationId)))
    .returning();

  return updatedSession || null;
}
