import { http } from "./http";
import type { InitiateCallInput, AnswerCallInput, GenerateSoapNoteInput, SignEncounterInput } from "@cliniq/api-spec";

export interface CallSessionResponse {
  callSession: {
    id: string;
    patientId: string;
    roomName: string;
    callType: "video" | "audio";
    status: "ringing" | "in_progress" | "completed";
  };
}

export async function initiateCallApi(input: InitiateCallInput): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls/initiate", input);
}

export async function answerCallApi(input: AnswerCallInput): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls/answer", input);
}

export async function endCallApi(callSessionId: string, durationSeconds: number, transcriptText?: string): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls/end", { callSessionId, durationSeconds, transcriptText });
}

export async function generateSoapNoteApi(input: GenerateSoapNoteInput): Promise<{
  soapNote: { subjective: string; objective: string; assessment: string; plan: string };
  suggestedCodes: string[];
  summary: string;
}> {
  return http.post("/api/scribe/generate-soap", input);
}

export async function signEncounterApi(input: SignEncounterInput): Promise<{ encounter: { id: string; status: string } }> {
  return http.post("/api/scribe/sign-encounter", input);
}
