import { z } from "zod";

// ============================================================================
// ERROR ENVELOPE & PROTOCOL SCHEMAS
// ============================================================================

/**
 * Standard machine-readable error codes across ClinIQ API services.
 */
export const APIErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "AUTHENTICATION_REQUIRED",
  "INSUFFICIENT_PERMISSIONS",
  "RESOURCE_NOT_FOUND",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
  "BAD_REQUEST",
]);
export type APIErrorCode = z.infer<typeof APIErrorCodeSchema>;

/**
 * Machine- and human-readable error payload.
 */
export const APIErrorDetailSchema = z.object({
  code: APIErrorCodeSchema.or(z.string()),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type APIErrorDetail = z.infer<typeof APIErrorDetailSchema>;
export interface IAPIErrorDetail extends APIErrorDetail {}

/**
 * Standardized top-level API error envelope.
 */
export const APIErrorEnvelopeSchema = z.object({
  error: APIErrorDetailSchema,
});
export type APIErrorEnvelope = z.infer<typeof APIErrorEnvelopeSchema>;
export interface IAPIErrorEnvelope extends APIErrorEnvelope {}

// ============================================================================
// PAGINATION DOMAIN SCHEMAS
// ============================================================================

/**
 * Standard query parameters for list and search endpoints.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export interface IPaginationQuery extends PaginationQuery {}

/**
 * Standard pagination metadata attached to paginated response payloads.
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export interface IPaginationMeta extends PaginationMeta {}

/**
 * TypeScript interface representing a standardized paginated response.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// AUTH & CLAIMS DOMAIN SCHEMAS
// ============================================================================

/**
 * Valid user roles across ClinIQ clinical, administrative, and patient portals.
 */
export const UserRoleSchema = z.enum([
  "patient",
  "physician",
  "nurse",
  "care_coordinator",
  "employer_admin",
  "admin",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Normalized user claims attached to request tokens and session contexts.
 */
export const UserClaimsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Valid email address is required"),
  role: UserRoleSchema,
  organizationId: z.string().min(1, "Organization ID is required"),
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  isAdmin: z.boolean().optional(),
});
export type UserClaims = z.infer<typeof UserClaimsSchema>;
export interface IUserClaims extends UserClaims {}

/**
 * Authenticated user profile returned in auth responses.
 */
export const AuthUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Valid email address is required"),
  role: UserRoleSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID is required"),
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  isAdmin: z.boolean().optional(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;
export interface IAuthUser extends AuthUser {}

/**
 * Successful authentication response containing session token and user profile.
 */
export const AuthResponseSchema = z.object({
  token: z.string().min(1, "JWT token is required"),
  user: AuthUserSchema,
  medplumToken: z.string().optional(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export interface IAuthResponse extends AuthResponse {}

/**
 * Standard email and password login payload.
 */
export const LoginSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;
export interface ILoginInput extends LoginInput {}

/**
 * Self-registration payload for new patients.
 */
export const RegisterPatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  organizationSlug: z.string().optional(),
  employerId: z.string().uuid().optional(),
});
export type RegisterPatientInput = z.infer<typeof RegisterPatientSchema>;
export interface IRegisterPatientInput extends RegisterPatientInput {}

/**
 * Exchange request to swap a Medplum bearer token for a ClinIQ session token.
 */
export const TokenExchangeSchema = z.object({
  token: z.string().min(1, "Medplum access token is required for exchange"),
});
export type TokenExchangeInput = z.infer<typeof TokenExchangeSchema>;
export interface ITokenExchangeInput extends TokenExchangeInput {}

// ── MEDPLUM AUTH & HYBRID SESSION SCHEMAS ────────────────────────────────────

/**
 * OAuth token structure returned by Medplum identity provider.
 */
export const MedplumAuthTokenSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional(),
  tokenType: z.string().default("Bearer"),
  expiresIn: z.number().int().positive().optional(),
  scope: z.string().optional(),
  idToken: z.string().optional(),
});
export type MedplumAuthToken = z.infer<typeof MedplumAuthTokenSchema>;
export interface IMedplumAuthToken extends MedplumAuthToken {}

/**
 * Medplum FHIR resource profile types.
 */
export const MedplumProfileTypeSchema = z.enum([
  "Practitioner",
  "Patient",
  "User",
  "ClientApplication",
  "RelatedPerson",
]);
export type MedplumProfileType = z.infer<typeof MedplumProfileTypeSchema>;

/**
 * Medplum OAuth claims decoded from SMART on FHIR access tokens.
 */
export const MedplumUserClaimsSchema = z.object({
  sub: z.string().min(1, "Subject identifier is required"),
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email().optional(),
  role: z.enum(["admin", "physician", "nurse", "patient", "employer_admin"]),
  organizationId: z.string().min(1, "Organization ID is required"),
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  medplumUserId: z.string().optional(),
  medplumPractitionerId: z.string().optional(),
  medplumPatientId: z.string().optional(),
  scope: z.string().optional(),
  project: z.string().optional(),
});
export type MedplumUserClaims = z.infer<typeof MedplumUserClaimsSchema>;
export interface IMedplumUserClaims extends MedplumUserClaims {}

/**
 * Active hybrid session descriptor combining local DB session and Medplum tokens.
 */
export const MedplumSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  userId: z.string().min(1, "User ID is required"),
  profileId: z.string().min(1, "Profile ID is required"),
  profileType: MedplumProfileTypeSchema,
  projectId: z.string().min(1, "Project ID is required"),
  tokens: MedplumAuthTokenSchema,
  claims: MedplumUserClaimsSchema.optional(),
  expiresAt: z.string().min(1, "Expiration timestamp is required"),
  isActive: z.boolean().default(true),
});
export type MedplumSession = z.infer<typeof MedplumSessionSchema>;
export interface IMedplumSession extends MedplumSession {}

/**
 * Medplum direct credential authentication request payload.
 */
export const MedplumLoginRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(1, "Password is required"),
  projectId: z.string().optional(),
});
export type MedplumLoginRequest = z.infer<typeof MedplumLoginRequestSchema>;
export interface IMedplumLoginRequest extends MedplumLoginRequest {}

/**
 * Verification request for Medplum bearer access tokens.
 */
export const MedplumVerifyTokenRequestSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
export type MedplumVerifyTokenRequest = z.infer<typeof MedplumVerifyTokenRequestSchema>;
export interface IMedplumVerifyTokenRequest extends MedplumVerifyTokenRequest {}

/**
 * Session verification response containing resolved user identity and claims.
 */
export const MedplumSessionResponseSchema = z.object({
  success: z.boolean(),
  session: MedplumSessionSchema.optional(),
  claims: MedplumUserClaimsSchema.optional(),
  error: z.string().optional(),
});
export type MedplumSessionResponse = z.infer<typeof MedplumSessionResponseSchema>;
export interface IMedplumSessionResponse extends MedplumSessionResponse {}


// ============================================================================
// PATIENT DOMAIN SCHEMAS
// ============================================================================

/**
 * Patient profile summary details.
 */
export const PatientProfileItemSchema = z.object({
  id: z.string().min(1, "Patient ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mrn: z.string().optional(),
  ohsScore: z.string().optional(),
  riskTier: z.string().optional(),
  sex: z.string().optional(),
  gender: z.string().optional(),
  assignedNurseId: z.string().uuid().optional(),
  status: z.string().optional(),
  riskScore: z.number().optional(),
  hasRecentErVisit: z.boolean().optional(),
  employerId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});
export type PatientProfileItem = z.infer<typeof PatientProfileItemSchema>;
export interface IPatientProfileItem extends PatientProfileItem {}

/**
 * Response payload for patient profile endpoint.
 */
export const PatientProfileResponseSchema = z.object({
  patient: PatientProfileItemSchema,
});
export type PatientProfileResponse = z.infer<typeof PatientProfileResponseSchema>;
export interface IPatientProfileResponse extends PatientProfileResponse {}

/**
 * Single laboratory or biometric vital reading.
 */
export const LabReadingItemSchema = z.object({
  id: z.string().min(1, "Reading ID is required"),
  biomarker: z.string().min(1, "Biomarker name is required"),
  value: z.string().min(1, "Reading value is required"),
  unit: z.string().optional(),
  readingDate: z.string().min(1, "Reading date is required"),
  referenceRangeLow: z.string().optional(),
  referenceRangeHigh: z.string().optional(),
  interpretation: z.string().optional(),
  patientId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});
export type LabReadingItem = z.infer<typeof LabReadingItemSchema>;
export interface ILabReadingItem extends LabReadingItem {}

/**
 * Response payload for patient lab readings and vitals.
 */
export const LabsResponseSchema = z.object({
  readings: z.array(LabReadingItemSchema),
});
export type LabsResponse = z.infer<typeof LabsResponseSchema>;
export interface ILabsResponse extends LabsResponse {}

/**
 * Single patient medication record.
 */
export const MedicationItemSchema = z.object({
  id: z.string().min(1, "Medication ID is required"),
  name: z.string().min(1, "Medication name is required"),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  prescriber: z.string().optional(),
  status: z.string().optional(),
  patientId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});
export type MedicationItem = z.infer<typeof MedicationItemSchema>;
export interface IMedicationItem extends MedicationItem {}

/**
 * Response payload for patient active medications.
 */
export const MedicationsResponseSchema = z.object({
  medications: z.array(MedicationItemSchema),
});
export type MedicationsResponse = z.infer<typeof MedicationsResponseSchema>;
export interface IMedicationsResponse extends MedicationsResponse {}

/**
 * Single chronic or acute medical condition entry.
 */
export const ConditionItemSchema = z.object({
  id: z.string().min(1, "Condition ID is required"),
  name: z.string().min(1, "Condition name is required"),
  icdCode: z.string().optional(),
  status: z.string().optional(),
  onsetDate: z.string().optional(),
  patientId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});
export type ConditionItem = z.infer<typeof ConditionItemSchema>;
export interface IConditionItem extends ConditionItem {}

/**
 * Response payload for patient conditions.
 */
export const ConditionsResponseSchema = z.object({
  conditions: z.array(ConditionItemSchema),
});
export type ConditionsResponse = z.infer<typeof ConditionsResponseSchema>;
export interface IConditionsResponse extends ConditionsResponse {}

/**
 * HEDIS quality care gap measure item.
 */
export const CareGapItemSchema = z.object({
  id: z.string().min(1, "Care gap ID is required"),
  measure: z.string().min(1, "Care measure code is required"),
  measureName: z.string().min(1, "Measure display name is required"),
  hedisCode: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["open", "closed"]).or(z.string()),
  closedDate: z.string().optional(),
  closedEvidence: z.string().optional(),
  closedBy: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});
export type CareGapItem = z.infer<typeof CareGapItemSchema>;
export interface ICareGapItem extends CareGapItem {}

/**
 * Response payload for patient care gaps.
 */
export const CareGapsResponseSchema = z.object({
  careGaps: z.array(CareGapItemSchema),
});
export type CareGapsResponse = z.infer<typeof CareGapsResponseSchema>;
export interface ICareGapsResponse extends CareGapsResponse {}

/**
 * Payload to update or close a care gap via PATCH /api/care-gaps/:id.
 */
export const UpdateCareGapSchema = z.object({
  status: z.enum(["open", "closed"]).default("closed"),
  evidence: z.string().min(3, "Clinical closure evidence is required"),
  closedEncounterId: z.string().uuid().optional(),
});
export type UpdateCareGapInput = z.infer<typeof UpdateCareGapSchema>;
export interface IUpdateCareGapInput extends UpdateCareGapInput {}

/**
 * Payload to satisfy and close an open care gap (Legacy / Alias).
 */
export const CloseCareGapSchema = z.object({
  careGapId: z.string().uuid("Valid Care Gap UUID is required").optional(),
  evidence: z.string().min(3, "Clinical closure evidence is required"),
  closedEncounterId: z.string().uuid().optional(),
});
export type CloseCareGapInput = z.infer<typeof CloseCareGapSchema>;
export interface ICloseCareGapInput extends CloseCareGapInput {}


// ============================================================================
// PROVIDER DOMAIN SCHEMAS
// ============================================================================

/**
 * Clinical worklist patient card summary.
 */
export const WorklistPatientSchema = z.object({
  id: z.string().min(1, "Patient ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ohsScore: z.string().optional(),
  riskTier: z.string().optional(),
  hasRecentErVisit: z.boolean().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mrn: z.string().optional(),
  status: z.string().optional(),
  assignedNurseId: z.string().uuid().optional(),
});
export type WorklistPatient = z.infer<typeof WorklistPatientSchema>;
export interface IWorklistPatient extends WorklistPatient {}

/**
 * Response payload for clinical worklist query.
 */
export const WorklistResponseSchema = z.object({
  patients: z.array(WorklistPatientSchema),
});
export type WorklistResponse = z.infer<typeof WorklistResponseSchema>;
export interface IWorklistResponse extends WorklistResponse {}

/**
 * Structured SOAP clinical documentation note.
 */
export const ScribeSoapNoteSchema = z.object({
  subjective: z.string().describe("Patient history, reported symptoms, and chief complaint"),
  objective: z.string().describe("Physical exam observations, vital signs, and diagnostic findings"),
  assessment: z.string().describe("Differential diagnosis and clinical impression"),
  plan: z.string().describe("Therapeutic plan, prescribed medications, follow-up, and patient education"),
});
export type ScribeSoapNote = z.infer<typeof ScribeSoapNoteSchema>;
export interface IScribeSoapNote extends ScribeSoapNote {}

/**
 * Encounter summary within patient chart.
 */
export const EncounterItemSchema = z.object({
  id: z.string().min(1, "Encounter ID is required"),
  type: z.string().min(1, "Encounter type is required"),
  summary: z.string().optional(),
  soapNote: ScribeSoapNoteSchema.optional(),
  status: z.string().optional(),
  signedAt: z.string().optional(),
  signedBy: z.string().uuid().optional(),
  erDeflectionFlag: z.boolean().optional(),
  createdAt: z.string().min(1, "Creation timestamp is required"),
});
export type EncounterItem = z.infer<typeof EncounterItemSchema>;
export interface IEncounterItem extends EncounterItem {}

/**
 * Chart care gap summary representation.
 */
export const ChartCareGapItemSchema = z.object({
  id: z.string().min(1, "Care gap ID is required"),
  measureName: z.string().min(1, "Measure display name is required"),
  status: z.string().min(1, "Status is required"),
  dueDate: z.string().optional(),
  measure: z.string().optional(),
  hedisCode: z.string().optional(),
});
export type ChartCareGapItem = z.infer<typeof ChartCareGapItemSchema>;
export interface IChartCareGapItem extends ChartCareGapItem {}

/**
 * Response payload for comprehensive longitudinal patient chart.
 */
export const PatientChartResponseSchema = z.object({
  patient: WorklistPatientSchema,
  encounters: z.array(EncounterItemSchema),
  careGaps: z.array(ChartCareGapItemSchema),
});
export type PatientChartResponse = z.infer<typeof PatientChartResponseSchema>;
export interface IPatientChartResponse extends PatientChartResponse {}

/**
 * Provider on-duty availability state payload.
 */
export const ProviderAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  status: z.string().optional(),
});
export type ProviderAvailabilityInput = z.infer<typeof ProviderAvailabilitySchema>;
export interface IProviderAvailabilityInput extends ProviderAvailabilityInput {}

/**
 * Response payload returning updated provider availability state.
 */
export const ProviderAvailabilityResponseSchema = z.object({
  availability: z.object({
    isAvailable: z.boolean(),
    status: z.string(),
  }),
});
export type ProviderAvailabilityResponse = z.infer<typeof ProviderAvailabilityResponseSchema>;
export interface IProviderAvailabilityResponse extends ProviderAvailabilityResponse {}


// ============================================================================
// EMPLOYER DOMAIN SCHEMAS
// ============================================================================

/**
 * Population health risk distribution breakdown across tiers.
 */
export const RiskDistributionSchema = z.object({
  low: z.number().int().nonnegative().describe("Count of low risk covered lives"),
  moderate: z.number().int().nonnegative().describe("Count of moderate risk covered lives"),
  high: z.number().int().nonnegative().describe("Count of high risk covered lives"),
  rising: z.number().int().nonnegative().describe("Count of rising risk covered lives"),
});
export type RiskDistribution = z.infer<typeof RiskDistributionSchema>;
export interface IRiskDistribution extends RiskDistribution {}

/**
 * Response payload for employer population health overview dashboard.
 */
export const EmployerOverviewResponseSchema = z.object({
  totalCoveredLives: z.number().int().nonnegative(),
  averageOhs: z.number().nonnegative(),
  riskDistribution: RiskDistributionSchema,
});
export type EmployerOverviewResponse = z.infer<typeof EmployerOverviewResponseSchema>;
export interface IEmployerOverviewResponse extends EmployerOverviewResponse {}

/**
 * Financial savings event recorded on ledger.
 */
export const SavingsLedgerEventItemSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
  eventType: z.string().min(1, "Event type is required"),
  grossSavings: z.string().min(1, "Gross savings amount is required"),
  netSavings: z.string().min(1, "Net savings amount is required"),
  eventDate: z.string().min(1, "Event date is required"),
});
export type SavingsLedgerEventItem = z.infer<typeof SavingsLedgerEventItemSchema>;
export interface ISavingsLedgerEventItem extends SavingsLedgerEventItem {}

/**
 * Response payload for employer ER deflection & ROI savings ledger.
 */
export const SavingsLedgerResponseSchema = z.object({
  totalErAvoided: z.number().int().nonnegative(),
  grossSavings: z.number().nonnegative(),
  netSavings: z.number().nonnegative(),
  estimatedPmpmSavings: z.number().nonnegative(),
  recentEvents: z.array(SavingsLedgerEventItemSchema),
});
export type SavingsLedgerResponse = z.infer<typeof SavingsLedgerResponseSchema>;
export interface ISavingsLedgerResponse extends SavingsLedgerResponse {}

/**
 * Response payload for HEDIS care gap closure rate analytics.
 */
export const HedisGapsResponseSchema = z.object({
  totalGaps: z.number().int().nonnegative(),
  closedGaps: z.number().int().nonnegative(),
  closureRatePercent: z.number().nonnegative(),
});
export type HedisGapsResponse = z.infer<typeof HedisGapsResponseSchema>;
export interface IHedisGapsResponse extends HedisGapsResponse {}


// ============================================================================
// ADMIN DOMAIN SCHEMAS
// ============================================================================

/**
 * Audit log entry for PHI access trail.
 */
export const AuditLogItemSchema = z.object({
  id: z.string().min(1, "Log ID is required"),
  actorEmail: z.string().optional(),
  actorRole: z.string().optional(),
  action: z.string().min(1, "Action is required"),
  resourceType: z.string().min(1, "Resource type is required"),
  requestPath: z.string().optional(),
  ipAddress: z.string().optional(),
  createdAt: z.string().min(1, "Creation timestamp is required"),
  actorId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  resourceId: z.string().optional(),
  userAgent: z.string().optional(),
  organizationId: z.string().uuid().optional(),
});
export type AuditLogItem = z.infer<typeof AuditLogItemSchema>;
export interface IAuditLogItem extends AuditLogItem {}

/**
 * Response payload for paginated PHI audit logs query.
 */
export const AuditLogsResponseSchema = z.object({
  logs: z.array(AuditLogItemSchema),
});
export type AuditLogsResponse = z.infer<typeof AuditLogsResponseSchema>;
export interface IAuditLogsResponse extends AuditLogsResponse {}

/**
 * Query parameters for searching PHI audit logs.
 */
export const AuditLogQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
export interface IAuditLogQuery extends AuditLogQuery {}

/**
 * Organization staff user profile entry.
 */
export const StaffUserItemSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  isAdmin: z.boolean().optional(),
  mfaEnabled: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type StaffUserItem = z.infer<typeof StaffUserItemSchema>;
export interface IStaffUserItem extends StaffUserItem {}

/**
 * Response payload listing organization users.
 */
export const AdminUsersResponseSchema = z.object({
  users: z.array(StaffUserItemSchema),
});
export type AdminUsersResponse = z.infer<typeof AdminUsersResponseSchema>;
export interface IAdminUsersResponse extends AdminUsersResponse {}

/**
 * Organization provider details entry.
 */
export const AdminProviderItemSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  credential: z.string().optional(),
  specialty: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  npi: z.string().optional(),
  npiVerified: z.boolean().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
});
export type AdminProviderItem = z.infer<typeof AdminProviderItemSchema>;
export interface IAdminProviderItem extends AdminProviderItem {}

/**
 * Response payload listing organization providers.
 */
export const AdminProvidersResponseSchema = z.object({
  providers: z.array(AdminProviderItemSchema),
});
export type AdminProvidersResponse = z.infer<typeof AdminProvidersResponseSchema>;
export interface IAdminProvidersResponse extends AdminProvidersResponse {}

/**
 * Employer group contract details entry.
 */
export const AdminEmployerItemSchema = z.object({
  id: z.string().min(1, "Employer ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Employer name is required"),
  sector: z.string().optional(),
  hqCity: z.string().optional(),
  hqState: z.string().optional(),
  coveredLives: z.number().int().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  renewalDate: z.string().optional(),
  pmpmRate: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
});
export type AdminEmployerItem = z.infer<typeof AdminEmployerItemSchema>;
export interface IAdminEmployerItem extends AdminEmployerItem {}

/**
 * Response payload listing employer groups.
 */
export const AdminEmployersResponseSchema = z.object({
  employers: z.array(AdminEmployerItemSchema),
});
export type AdminEmployersResponse = z.infer<typeof AdminEmployersResponseSchema>;
export interface IAdminEmployersResponse extends AdminEmployersResponse {}


// ============================================================================
// TELEPHONY & CALL ROUTING DOMAIN SCHEMAS
// ============================================================================

/**
 * 3-tier intelligent call routing strategies.
 */
export const CallStrategySchema = z.enum([
  "assigned_primary",
  "available_on_duty",
  "broadcast",
]);
export type CallStrategy = z.infer<typeof CallStrategySchema>;

/**
 * Notification outcome returned after dispatching ring events to providers.
 */
export const RingResultSchema = z.object({
  strategy: CallStrategySchema,
  notifiedProviderIds: z.array(z.string()),
});
export type RingResult = z.infer<typeof RingResultSchema>;
export interface IRingResult extends RingResult {}

/**
 * Payload to initiate or create a telehealth call session via POST /api/calls.
 */
export const CreateCallSessionSchema = z.object({
  patientId: z.string().uuid("Valid Patient UUID is required"),
  callType: z.enum(["video", "audio"]).default("video"),
  reason: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});
export type CreateCallSessionInput = z.infer<typeof CreateCallSessionSchema>;
export interface ICreateCallSessionInput extends CreateCallSessionInput {}

/**
 * Payload to initiate an inbound or outbound telehealth call session (Alias).
 */
export const InitiateCallSchema = CreateCallSessionSchema;
export type InitiateCallInput = z.infer<typeof InitiateCallSchema>;
export interface IInitiateCallInput extends InitiateCallInput {}

/**
 * Alias for InitiateCallInput representing the request payload.
 */
export const InitiateCallPayloadSchema = InitiateCallSchema;
export type InitiateCallPayload = z.infer<typeof InitiateCallPayloadSchema>;
export interface IInitiateCallPayload extends InitiateCallPayload {}

/**
 * Payload for updating an active call session (answering, completing, modifying) via PATCH /api/calls/:id.
 */
export const UpdateCallSessionSchema = z.object({
  status: z.enum(["ringing", "in_progress", "completed", "cancelled"]).optional(),
  nurseId: z.string().uuid().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  transcriptText: z.string().optional(),
  reason: z.string().optional(),
});
export type UpdateCallSessionInput = z.infer<typeof UpdateCallSessionSchema>;
export interface IUpdateCallSessionInput extends UpdateCallSessionInput {}

/**
 * Payload for answering a ringing call session (Legacy / Alias).
 */
export const AnswerCallSchema = z.object({
  callSessionId: z.string().uuid("Valid Call Session UUID is required").optional(),
});
export type AnswerCallInput = z.infer<typeof AnswerCallSchema>;
export interface IAnswerCallInput extends AnswerCallInput {}

/**
 * Payload for ending an active call session (Legacy / Alias).
 */
export const EndCallSchema = z.object({
  callSessionId: z.string().uuid("Valid Call Session UUID is required").optional(),
  durationSeconds: z.number().int().nonnegative().default(0),
  transcriptText: z.string().optional(),
});
export type EndCallInput = z.infer<typeof EndCallSchema>;
export interface IEndCallInput extends EndCallInput {}

/**
 * Inbound WebSocket authentication message format.
 */
export const WebSocketAuthMessageSchema = z.object({
  type: z.literal("auth"),
  token: z.string().min(1, "Bearer token is required for WebSocket authentication"),
});
export type WebSocketAuthMessage = z.infer<typeof WebSocketAuthMessageSchema>;
export interface IWebSocketAuthMessage extends WebSocketAuthMessage {}

/**
 * Detailed representation of an active or concluded telehealth call session.
 */
export const CallSessionItemSchema = z.object({
  id: z.string().min(1, "Call session ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  roomName: z.string().min(1, "Room name is required"),
  callType: z.enum(["video", "audio"]),
  status: z.enum(["ringing", "in_progress", "completed"]).or(z.string()),
  nurseId: z.string().optional(),
  reason: z.string().optional(),
  urgency: z.string().optional(),
  initiatedAt: z.string().optional(),
  answeredAt: z.string().optional(),
  endedAt: z.string().optional(),
  durationSeconds: z.number().int().optional(),
  transcriptText: z.string().optional(),
  organizationId: z.string().optional(),
});
export type CallSessionItem = z.infer<typeof CallSessionItemSchema>;
export interface ICallSessionItem extends CallSessionItem {}

/**
 * Response payload returned when creating, answering, or retrieving a call session.
 */
export const CallSessionResponseSchema = z.object({
  callSession: CallSessionItemSchema,
  routing: RingResultSchema.optional(),
});
export type CallSessionResponse = z.infer<typeof CallSessionResponseSchema>;
export interface ICallSessionResponse extends CallSessionResponse {}


// ============================================================================
// AI & SCRIBE DOMAIN SCHEMAS
// ============================================================================

/**
 * Patient context supplied during AI clinical scribe SOAP note synthesis.
 */
export const ScribePatientContextSchema = z.object({
  patientId: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  activeConditions: z.array(z.string()).optional(),
});
export type ScribePatientContext = z.infer<typeof ScribePatientContextSchema>;
export interface IScribePatientContext extends ScribePatientContext {}

/**
 * Parameters for creating or generating structured clinical SOAP notes via POST /api/scribe/notes.
 */
export const CreateSoapNoteSchema = z.object({
  callSessionId: z.string().uuid().optional(),
  encounterId: z.string().uuid().optional(),
  transcript: z.string().min(10, "Encounter transcript must be at least 10 characters"),
  patientContext: ScribePatientContextSchema.optional(),
});
export type CreateSoapNoteInput = z.infer<typeof CreateSoapNoteSchema>;
export interface ICreateSoapNoteInput extends CreateSoapNoteInput {}

/**
 * Parameters for generating structured clinical SOAP notes from encounter audio transcripts (Alias).
 */
export const GenerateSoapNoteSchema = CreateSoapNoteSchema;
export type GenerateSoapNoteInput = z.infer<typeof GenerateSoapNoteSchema>;
export interface IGenerateSoapNoteInput extends GenerateSoapNoteInput {}

/**
 * Parameters passed to backend AI scribe generation function.
 */
export const GenerateSoapNoteParamsSchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
  patientContext: ScribePatientContextSchema.optional(),
});
export type GenerateSoapNoteParams = z.infer<typeof GenerateSoapNoteParamsSchema>;
export interface IGenerateSoapNoteParams extends GenerateSoapNoteParams {}

/**
 * Structured LLM output from ambient clinical scribe synthesis.
 */
export const ClinicalScribeOutputSchema = z.object({
  soapNote: ScribeSoapNoteSchema,
  suggestedIcdCodes: z
    .array(z.string())
    .describe("Relevant ICD-10 diagnosis codes (e.g. ['J00', 'R05.9'])"),
  summary: z.string().describe("Concise 1-2 sentence clinical summary of the encounter"),
});
export type ClinicalScribeOutput = z.infer<typeof ClinicalScribeOutputSchema>;
export interface IClinicalScribeOutput extends ClinicalScribeOutput {}

/**
 * Clinician review, edit, and digital sign-off payload for an encounter.
 */
export const SignEncounterSchema = z.object({
  encounterId: z.string().uuid("Valid Encounter UUID is required"),
  soapNote: ScribeSoapNoteSchema,
  diagnoses: z.array(z.string()).optional(),
  erDeflectionFlag: z.boolean().default(false),
});
export type SignEncounterInput = z.infer<typeof SignEncounterSchema>;
export interface ISignEncounterInput extends SignEncounterInput {}

/**
 * Categories for inbound fax document OCR classification.
 */
export const FaxClassificationCategorySchema = z.enum([
  "Discharge Summary",
  "Lab Requisition",
  "Prescription Referral",
  "General Clinical Document",
]);
export type FaxClassificationCategory = z.infer<typeof FaxClassificationCategorySchema>;

/**
 * AI classification output and extracted clinical entities from inbound fax OCR text.
 */
export const FaxClassificationResultSchema = z.object({
  classification: FaxClassificationCategorySchema,
  extractedEntities: z
    .record(z.string())
    .describe("Key clinical entities such as patientName, mrn, referringPhysician, or date"),
});
export type FaxClassificationResult = z.infer<typeof FaxClassificationResultSchema>;
export interface IFaxClassificationResult extends FaxClassificationResult {}

/**
 * Payload to create or ingest an inbound digital fax document via POST /api/fax.
 */
export const CreateFaxSchema = z.object({
  senderNumber: z.string().optional(),
  documentBase64: z.string().min(10, "Base64 document content is required"),
  fileName: z.string().optional(),
});
export type CreateFaxInput = z.infer<typeof CreateFaxSchema>;
export interface ICreateFaxInput extends CreateFaxInput {}

/**
 * Payload to ingest an inbound digital fax document for OCR parsing and AI triage (Alias).
 */
export const IngestFaxSchema = CreateFaxSchema;
export type IngestFaxInput = z.infer<typeof IngestFaxSchema>;
export interface IIngestFaxInput extends IngestFaxInput {}


// ============================================================================
// UI & CLIENT-SIDE PAGE DATA SCHEMAS
// ============================================================================

/**
 * Admin Audit Trail Table Item.
 */
export const AuditLogUiItemSchema = z.object({
  id: z.string().min(1),
  actor: z.string(),
  patient: z.string(),
  action: z.enum(["READ", "UPDATE", "DELETE", "EXPORT"]).or(z.string()),
  resource: z.string(),
  path: z.string(),
  ip: z.string(),
  timestamp: z.string(),
});
export type AuditLogUiItem = z.infer<typeof AuditLogUiItemSchema> & {
  [key: string]: string;
};
export interface IAuditLogUiItem extends AuditLogUiItem {}

/**
 * Admin User Directory Table Item.
 */
export const AdminUserAccountItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  npi: z.string(),
  npiVerified: z.boolean(),
  status: z.string(),
});
export type AdminUserAccountItem = z.infer<typeof AdminUserAccountItemSchema> & {
  [key: string]: string | boolean;
};
export interface IAdminUserAccountItem extends AdminUserAccountItem {}

/**
 * Employer HEDIS Quality Measure Table Item.
 */
export const HedisMeasureItemSchema = z.object({
  id: z.string().min(1),
  measure: z.string(),
  eligible: z.number().int().nonnegative(),
  closed: z.number().int().nonnegative(),
  rate: z.string(),
  benchmark: z.string(),
  status: z.string(),
});
export type HedisMeasureItem = z.infer<typeof HedisMeasureItemSchema> & {
  [key: string]: string | number;
};
export interface IHedisMeasureItem extends HedisMeasureItem {}

/**
 * Employer Actuarial Savings Event Item.
 */
export const EmployerSavingsEventItemSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  type: z.string(),
  reason: z.string(),
  avoidedCost: z.string(),
  virtualCost: z.string(),
  netSavings: z.string(),
});
export type EmployerSavingsEventItem = z.infer<typeof EmployerSavingsEventItemSchema> & {
  [key: string]: string;
};
export interface IEmployerSavingsEventItem extends EmployerSavingsEventItem {}

/**
 * Patient Appointment Slot Item.
 */
export const AppointmentSlotItemSchema = z.object({
  id: z.string().min(1),
  time: z.string(),
  practitioner: z.string(),
  specialty: z.string(),
  type: z.enum(["video", "in-person"]),
});
export type AppointmentSlotItem = z.infer<typeof AppointmentSlotItemSchema>;
export interface IAppointmentSlotItem extends AppointmentSlotItem {}

/**
 * Patient Asynchronous Message Item.
 */
export const PatientMessageItemSchema = z.object({
  id: z.string().min(1),
  sender: z.enum(["patient", "care_team"]),
  senderName: z.string(),
  content: z.string(),
  timestamp: z.string(),
});
export type PatientMessageItem = z.infer<typeof PatientMessageItemSchema>;
export interface IPatientMessageItem extends PatientMessageItem {}

/**
 * Patient Longitudinal Diagnostic Lab Result Record.
 */
export const DiagnosticLabRecordSchema = z.object({
  id: z.string().min(1),
  biomarker: z.string(),
  code: z.string(),
  value: z.string(),
  unit: z.string(),
  range: z.string(),
  status: z.string(),
  date: z.string(),
});
export type DiagnosticLabRecord = z.infer<typeof DiagnosticLabRecordSchema> & {
  [key: string]: string;
};
export interface IDiagnosticLabRecord extends DiagnosticLabRecord {}

/**
 * Patient Longitudinal Active Medication Regimen Record.
 */
export const ActiveMedicationRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  dose: z.string(),
  frequency: z.string(),
  prescriber: z.string(),
  status: z.string(),
  refillDue: z.string(),
});
export type ActiveMedicationRecord = z.infer<typeof ActiveMedicationRecordSchema>;
export interface IActiveMedicationRecord extends ActiveMedicationRecord {}

/**
 * Patient Immunization Record.
 */
export const ImmunizationRecordSchema = z.object({
  id: z.string().min(1),
  vaccine: z.string(),
  date: z.string(),
  lot: z.string(),
  clinic: z.string(),
});
export type ImmunizationRecord = z.infer<typeof ImmunizationRecordSchema> & {
  [key: string]: string;
};
export interface IImmunizationRecord extends ImmunizationRecord {}

/**
 * Provider Clinical Worklist Item.
 */
export const ProviderWorklistItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  mrn: z.string(),
  dob: z.string(),
  employer: z.string(),
  riskTier: z.enum(["low", "moderate", "high"]),
  gapCount: z.number().int().nonnegative(),
  lastVisit: z.string(),
  status: z.string(),
});
export type ProviderWorklistItem = z.infer<typeof ProviderWorklistItemSchema> & {
  [key: string]: string | number;
};
export interface IProviderWorklistItem extends ProviderWorklistItem {}

/**
 * Inbound Fax Inbox Item.
 */
export const FaxInboxItemSchema = z.object({
  id: z.string().min(1),
  sender: z.string(),
  date: z.string(),
  pages: z.number().int().positive(),
  classification: z.string(),
  confidence: z.string(),
  patientMatch: z.string(),
  status: z.string(),
});
export type FaxInboxItem = z.infer<typeof FaxInboxItemSchema> & {
  [key: string]: string | number;
};
export interface IFaxInboxItem extends FaxInboxItem {}

/**
 * Provider Patient Panel Roster Item.
 */
export const PatientRosterItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  mrn: z.string(),
  dob: z.string(),
  gender: z.string(),
  phone: z.string(),
  email: z.string(),
  employer: z.string(),
  riskTier: z.enum(["low", "moderate", "high"]),
});
export type PatientRosterItem = z.infer<typeof PatientRosterItemSchema> & {
  [key: string]: string;
};
export interface IPatientRosterItem extends PatientRosterItem {}


