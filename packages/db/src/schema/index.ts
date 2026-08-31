import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// ── ORGANIZATIONS ─────────────────────────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  settings: jsonb("settings").default({}),
  acceptsJoinRequests: boolean("accepts_join_requests").default(false).notNull(),
  isProduction: boolean("is_production").default(false).notNull(),
  ensFeedEmployerId: uuid("ens_feed_employer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── EMPLOYERS ─────────────────────────────────────────────────────────────────
export const employers = pgTable("employers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  sector: text("sector"),
  hqCity: text("hq_city"),
  hqState: text("hq_state"),
  coveredLives: integer("covered_lives").default(0),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  renewalDate: date("renewal_date"),
  pmpmRate: decimal("pmpm_rate", { precision: 10, scale: 2 }),
  erCostPerVisit: decimal("er_cost_per_visit", { precision: 10, scale: 2 }).default("1850.00"),
  ucCostPerVisit: decimal("uc_cost_per_visit", { precision: 10, scale: 2 }).default("220.00"),
  coveragePlan: jsonb("coverage_plan"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── ROLES ─────────────────────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("roles_org_name_idx").on(t.organizationId, t.name),
]);

// ── PROVIDERS ─────────────────────────────────────────────────────────────────
export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  medplumUserId: text("medplum_user_id"),
  medplumPractitionerId: text("medplum_practitioner_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  credential: text("credential"),
  specialty: text("specialty"),
  role: text("role").notNull(),
  npi: text("npi"),
  npiVerified: boolean("npi_verified").default(false),
  npiVerifiedAt: timestamp("npi_verified_at"),
  npiData: jsonb("npi_data"),
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  licenseExpiry: date("license_expiry"),
  dea: text("dea"),
  email: text("email"),
  phone: text("phone"),
  statesLicensed: jsonb("states_licensed"),
  languages: jsonb("languages"),
  availabilitySchedule: jsonb("availability_schedule"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("providers_org_idx").on(t.organizationId),
  index("providers_medplum_user_idx").on(t.medplumUserId),
  index("providers_medplum_practitioner_idx").on(t.medplumPractitionerId),
]);

// ── PROVIDER EMPLOYERS MAPPING ────────────────────────────────────────────────
export const providerEmployers = pgTable("provider_employers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => employers.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("provider_employers_provider_idx").on(t.providerId),
  index("provider_employers_org_idx").on(t.organizationId),
  uniqueIndex("provider_employers_pair_idx").on(t.providerId, t.employerId),
]);

// ── NURSE AVAILABILITY ────────────────────────────────────────────────────────
export const nurseAvailability = pgTable("nurse_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id)
    .unique(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  isAvailable: boolean("is_available").default(false).notNull(),
  status: text("status").default("offline").notNull(),
  maxConcurrentCalls: integer("max_concurrent_calls").default(1).notNull(),
  currentCallCount: integer("current_call_count").default(0).notNull(),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("nurse_availability_org_status_idx").on(t.organizationId, t.status),
]);

// ── PATIENTS ──────────────────────────────────────────────────────────────────
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  employerId: uuid("employer_id").notNull().references(() => employers.id),
  medplumPatientId: text("medplum_patient_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  sex: text("sex"),
  gender: text("gender"),
  email: text("email"),
  phone: text("phone"),
  address: jsonb("address"),
  mrn: text("mrn"),
  assignedNurseId: uuid("assigned_nurse_id").references(() => providers.id),
  status: text("status").default("active"),
  ohsScore: decimal("ohs_score", { precision: 5, scale: 2 }),
  riskTier: text("risk_tier").default("low"),
  riskScore: integer("risk_score").default(0),
  hasRecentErVisit: boolean("has_recent_er_visit").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("patients_org_employer_idx").on(t.organizationId, t.employerId),
  index("patients_org_risk_tier_idx").on(t.organizationId, t.riskTier),
  index("patients_medplum_patient_idx").on(t.medplumPatientId),
  uniqueIndex("patients_identity_uidx").on(
    t.organizationId,
    t.employerId,
    t.firstName,
    t.lastName,
    t.dateOfBirth,
  ),
]);

// ── USERS ─────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  medplumUserId: text("medplum_user_id"),
  medplumPractitionerId: text("medplum_practitioner_id"),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  role: text("role").notNull(),
  roleId: uuid("role_id").references(() => roles.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  patientId: uuid("patient_id"),
  providerId: uuid("provider_id"),
  employerId: uuid("employer_id"),
  isDemo: boolean("is_demo").default(false),
  isAdmin: boolean("is_admin").default(false).notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("users_org_idx").on(t.organizationId),
  index("users_medplum_user_idx").on(t.medplumUserId),
  index("users_medplum_practitioner_idx").on(t.medplumPractitionerId),
  index("users_patient_idx").on(t.patientId),
  index("users_provider_idx").on(t.providerId),
]);

// ── REFRESH TOKENS ────────────────────────────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("refresh_tokens_user_idx").on(t.userId),
]);

// ── CLINICAL DATA TABLES ──────────────────────────────────────────────────────
export const conditions = pgTable("conditions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  icdCode: text("icd_code"),
  status: text("status").default("active"),
  onsetDate: date("onsetDate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  dose: text("dose"),
  frequency: text("frequency"),
  prescriber: text("prescriber"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const allergies = pgTable("allergies", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  substance: text("substance").notNull(),
  reaction: text("reaction"),
  severity: text("severity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const labReadings = pgTable("lab_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  biomarker: text("biomarker").notNull(),
  value: decimal("value", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit"),
  readingDate: date("reading_date").notNull(),
  referenceRangeLow: decimal("reference_range_low", { precision: 10, scale: 3 }),
  referenceRangeHigh: decimal("reference_range_high", { precision: 10, scale: 3 }),
  interpretation: text("interpretation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const careGaps = pgTable("care_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  measure: text("measure").notNull(),
  measureName: text("measure_name").notNull(),
  hedisCode: text("hedis_code"),
  dueDate: date("due_date"),
  status: text("status").default("open"),
  closedDate: date("closed_date"),
  closedEvidence: text("closed_evidence"),
  closedBy: uuid("closed_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("care_gaps_patient_status_idx").on(t.patientId, t.status),
]);

export const patientRiskSnapshots = pgTable("patient_risk_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  employerId: uuid("employer_id").references(() => employers.id),
  month: text("month").notNull(),
  lowRiskCount: integer("low_risk_count").default(0).notNull(),
  moderateRiskCount: integer("moderate_risk_count").default(0).notNull(),
  highRiskCount: integer("high_risk_count").default(0).notNull(),
  risingRiskCount: integer("rising_risk_count").default(0).notNull(),
  averageOhs: decimal("average_ohs", { precision: 5, scale: 2 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// ── TELEHEALTH & CALLS ────────────────────────────────────────────────────────
export const callSessions = pgTable("call_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  nurseId: uuid("nurse_id").references(() => providers.id),
  callType: text("call_type").notNull().default("video"),
  status: text("status").notNull().default("ringing"),
  direction: text("direction").default("inbound"),
  roomName: text("room_name").notNull(),
  reason: text("reason"),
  urgency: text("urgency").default("medium"),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  answeredAt: timestamp("answered_at"),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  transcriptText: text("transcript_text"),
  transcriptSegments: jsonb("transcript_segments"),
  soapNote: jsonb("soap_note"),
  suggestedCodes: jsonb("suggested_codes"),
  encounterId: uuid("encounter_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("call_sessions_org_status_idx").on(t.organizationId, t.status),
]);

// ── ENCOUNTERS & SCRIBE ───────────────────────────────────────────────────────
export const encounters = pgTable("encounters", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  providerId: uuid("provider_id").references(() => providers.id),
  medplumEncounterId: text("medplum_encounter_id"),
  type: text("type").notNull(),
  summary: text("summary"),
  soapNote: jsonb("soap_note"),
  suggestedCodes: jsonb("suggested_codes"),
  confirmedCodes: jsonb("confirmed_codes"),
  aiSummary: text("ai_summary"),
  erDeflectionFlag: boolean("er_deflection_flag").default(false),
  callSessionId: uuid("call_session_id"),
  status: text("status").notNull().default("signed"),
  signedAt: timestamp("signed_at"),
  signedBy: uuid("signed_by").references(() => providers.id),
  amendsEncounterId: uuid("amends_encounter_id").references((): AnyPgColumn => encounters.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("encounters_patient_created_idx").on(t.patientId, t.createdAt),
]);

// ── MAYA AI CONVERSATIONS ─────────────────────────────────────────────────────
export const mayaConversations = pgTable("maya_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at").notNull(),
  messages: jsonb("messages").notNull(),
  source: text("source").notNull().default("ai_generated"),
}, (t) => [
  index("maya_conversations_patient_started_idx").on(t.patientId, t.startedAt),
]);

// ── FAX INBOX ─────────────────────────────────────────────────────────────────
export const faxInbox = pgTable("fax_inbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  senderNumber: text("sender_number"),
  recipientNumber: text("recipient_number"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  documentPath: text("document_path"),
  classification: text("classification"),
  extractedEntities: jsonb("extracted_entities"),
  matchedPatientId: uuid("matched_patient_id").references(() => patients.id),
  status: text("status").default("pending_review").notNull(),
  reviewedByUserId: uuid("reviewed_by_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── CARE LINE & FINANCIAL LEDGER ──────────────────────────────────────────────
export const careLineCalls = pgTable("care_line_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  employerId: uuid("employer_id").references(() => employers.id),
  patientId: uuid("patient_id").references(() => patients.id),
  providerId: uuid("provider_id").references(() => providers.id),
  callDate: date("call_date").notNull(),
  callerReason: text("caller_reason"),
  triageDisposition: text("triage_disposition"),
  erDeflected: boolean("er_deflected").default(false),
  ucDeflected: boolean("uc_deflected").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialEventLedger = pgTable("financial_event_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  employerId: uuid("employer_id").notNull().references(() => employers.id),
  patientId: uuid("patient_id").references(() => patients.id),
  eventType: text("event_type").notNull(), // 'er_avoided' | 'uc_avoided' | 'pmpm_billing'
  grossSavings: decimal("gross_savings", { precision: 10, scale: 2 }).notNull(),
  netSavings: decimal("net_savings", { precision: 10, scale: 2 }).notNull(),
  referenceId: uuid("reference_id"),
  eventDate: date("event_date").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── AUDIT LOG (PHI ACCESS TRAIL) ──────────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  actorId: uuid("actor_id"),
  actorEmail: text("actor_email"),
  actorRole: text("actor_role"),
  patientId: uuid("patient_id"),
  action: text("action").notNull(), // 'read' | 'create' | 'update' | 'delete' | 'export'
  resourceType: text("resource_type").notNull(), // 'PatientChart' | 'LabReading' | 'Encounter' | 'Medication'
  resourceId: text("resource_id"),
  requestPath: text("request_path"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("audit_logs_org_created_idx").on(t.organizationId, t.createdAt),
  index("audit_logs_patient_idx").on(t.patientId),
]);
