import { http } from "./http";
import type {
  CreateCallSessionInput,
  InitiateCallInput,
  UpdateCallSessionInput,
  AnswerCallInput,
  CreateSoapNoteInput,
  GenerateSoapNoteInput,
  SignEncounterInput,
  CallSessionResponse,
  ScribeSoapNote,
} from "@cliniq/api-spec";

export type {
  CallSessionResponse,
  CreateCallSessionInput,
  InitiateCallPayload,
  UpdateCallSessionInput,
  RingResult,
  CallStrategy,
} from "@cliniq/api-spec";

/**
 * POST /api/calls
 * Initiate or create a virtual telehealth consultation session.
 */
export async function initiateCallApi(input: CreateCallSessionInput | InitiateCallInput): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls", input);
}

/**
 * PATCH /api/calls/:id
 * Answer incoming ringing call session.
 */
export async function answerCallApi(input: AnswerCallInput | { callSessionId: string }): Promise<CallSessionResponse> {
  const sessionId = input.callSessionId;
  return http.patch<CallSessionResponse>(`/api/calls/${sessionId}`, { status: "in_progress" });
}

/**
 * PATCH /api/calls/:id
 * Conclude active call session and persist duration & ambient transcript.
 */
export async function endCallApi(
  callSessionId: string,
  durationSeconds: number,
  transcriptText?: string
): Promise<CallSessionResponse> {
  return http.patch<CallSessionResponse>(`/api/calls/${callSessionId}`, {
    status: "completed",
    durationSeconds,
    transcriptText,
  });
}

/**
 * GET /api/calls/:id
 * Retrieve call session state by ID.
 */
export async function getCallSessionApi(callSessionId: string): Promise<CallSessionResponse> {
  return http.get<CallSessionResponse>(`/api/calls/${callSessionId}`);
}

/**
 * POST /api/scribe/notes
 * Synthesize AI clinical SOAP note from encounter audio transcript.
 */
export async function generateSoapNoteApi(input: CreateSoapNoteInput | GenerateSoapNoteInput): Promise<{
  soapNote: ScribeSoapNote;
  suggestedCodes: string[];
  summary: string;
}> {
  return http.post<{
    soapNote: ScribeSoapNote;
    suggestedCodes: string[];
    summary: string;
  }>("/api/scribe/notes", input);
}

/**
 * POST /api/scribe/signatures
 * Clinician digital sign-off on synthesized encounter documentation.
 */
export async function signEncounterApi(
  input: SignEncounterInput
): Promise<{ encounter: { id: string; status: string } }> {
  return http.post<{ encounter: { id: string; status: string } }>("/api/scribe/signatures", input);
}
