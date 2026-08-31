import { z } from "zod";

// ── AUTH SCHEMAS ─────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  dateOfBirth: z.string(),
  organizationSlug: z.string().optional(),
  employerId: z.string().uuid().optional(),
});
export type RegisterPatientInput = z.infer<typeof RegisterPatientSchema>;

// ── CALL & TELEHEALTH SCHEMAS ────────────────────────────────────────────────
export const InitiateCallSchema = z.object({
  patientId: z.string().uuid(),
  callType: z.enum(["video", "audio"]).default("video"),
  reason: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});
export type InitiateCallInput = z.infer<typeof InitiateCallSchema>;

export const AnswerCallSchema = z.object({
  callSessionId: z.string().uuid(),
});
export type AnswerCallInput = z.infer<typeof AnswerCallSchema>;

// ── SCRIBE & AI SCHEMAS ──────────────────────────────────────────────────────
export const ScribeSoapNoteSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
});
export type ScribeSoapNote = z.infer<typeof ScribeSoapNoteSchema>;

export const GenerateSoapNoteSchema = z.object({
  callSessionId: z.string().uuid().optional(),
  encounterId: z.string().uuid().optional(),
  transcript: z.string().min(10),
  patientContext: z.object({
    patientId: z.string().uuid(),
    age: z.number().optional(),
    gender: z.string().optional(),
    activeConditions: z.array(z.string()).optional(),
  }).optional(),
});
export type GenerateSoapNoteInput = z.infer<typeof GenerateSoapNoteSchema>;

export const SignEncounterSchema = z.object({
  encounterId: z.string().uuid(),
  soapNote: ScribeSoapNoteSchema,
  diagnoses: z.array(z.string()).optional(),
  erDeflectionFlag: z.boolean().default(false),
});
export type SignEncounterInput = z.infer<typeof SignEncounterSchema>;

// ── FAX INBOX SCHEMAS ────────────────────────────────────────────────────────
export const IngestFaxSchema = z.object({
  senderNumber: z.string().optional(),
  documentBase64: z.string().min(10),
  fileName: z.string().optional(),
});
export type IngestFaxInput = z.infer<typeof IngestFaxSchema>;

// ── CARE GAPS SCHEMAS ────────────────────────────────────────────────────────
export const CloseCareGapSchema = z.object({
  careGapId: z.string().uuid(),
  evidence: z.string().min(3),
  closedEncounterId: z.string().uuid().optional(),
});
export type CloseCareGapInput = z.infer<typeof CloseCareGapSchema>;

// ── AUDIT LOG SCHEMAS ────────────────────────────────────────────────────────
export const AuditLogQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
