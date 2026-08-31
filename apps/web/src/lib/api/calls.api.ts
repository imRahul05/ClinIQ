import { http } from "./http";
import type {
  InitiateCallInput,
  AnswerCallInput,
  GenerateSoapNoteInput,
  SignEncounterInput,
  CallSessionResponse,
  ScribeSoapNote,
} from "@cliniq/api-spec";

export type {
  CallSessionResponse,
  InitiateCallPayload,
  RingResult,
  CallStrategy,
} from "@cliniq/api-spec";

export async function initiateCallApi(input: InitiateCallInput): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls/initiate", input);
}

export async function answerCallApi(input: AnswerCallInput): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls/answer", input);
}

export async function endCallApi(
  callSessionId: string,
  durationSeconds: number,
  transcriptText?: string
): Promise<CallSessionResponse> {
  return http.post<CallSessionResponse>("/api/calls/end", {
    callSessionId,
    durationSeconds,
    transcriptText,
  });
}

export async function generateSoapNoteApi(input: GenerateSoapNoteInput): Promise<{
  soapNote: ScribeSoapNote;
  suggestedCodes: string[];
  summary: string;
}> {
  return http.post<{
    soapNote: ScribeSoapNote;
    suggestedCodes: string[];
    summary: string;
  }>("/api/scribe/generate-soap", input);
}

export async function signEncounterApi(
  input: SignEncounterInput
): Promise<{ encounter: { id: string; status: string } }> {
  return http.post<{ encounter: { id: string; status: string } }>("/api/scribe/sign-encounter", input);
}

