import {
  MedplumClient,
  ClientStorage,
  MemoryStorage,
  isProfileResource,
  type ProfileResource,
} from "@medplum/core";
import type {
  Patient,
  Practitioner,
  Reference,
  Project,
  User,
  ContactPoint,
  PractitionerQualification,
  RelatedPerson,
  ClientApplication,
  Resource,
} from "@medplum/fhirtypes";
import { fhirDefaults } from "./config";
import { formatFhirHumanName } from "./transform";

/**
 * ============================================================================
 * ANTI-CORRUPTION LAYER (ACL) PATTERN - FHIR & MEDPLUM INTEGRATION
 * ============================================================================
 *
 * In Domain-Driven Design (DDD), an Anti-Corruption Layer (ACL) serves as a
 * protective boundary isolating the internal ubiquitous domain language and
 * business models from external subsystems, third-party schemas, and legacy APIs.
 *
 * In ClinIQ's Option 3 Hybrid Architecture:
 * 1. External FHIR / Medplum Core Subsystem:
 *    - Medplum functions as the authoritative Identity Provider (IdP), OAuth2 /
 *      OpenID Connect (OIDC) authentication server, and FHIR R4 clinical repository.
 *    - Security and compartmentalized access controls (IDOR / BOLA prevention) are
 *      enforced natively via FHIR AccessPolicy rules.
 *
 * 2. ClinIQ High-Performance Operational Subsystems:
 *    - Ambient AI Scribe engine (audio streaming, multi-LLM orchestration).
 *    - Real-Time WebRTC Telephony & Nurse Call Routing (sub-millisecond state).
 *    - AI Fax Ingestion & OCR pipeline.
 *    - B2B Employer Risk Snapshots & Financial ER Deflection Ledgers.
 *
 * 3. Anti-Corruption Layer Responsibilities:
 *    - Translates external FHIR R4 resource models (Patient, Practitioner,
 *      Observation, Encounter) into ClinIQ's domain-specific data structures.
 *    - Encapsulates Medplum SDK lifecycle, execution runtime discrimination
 *      (Server-Side Rendering [SSR] vs Browser DOM), token lifecycle management,
 *      and isolated memory storage adapters.
 *    - Prevents cross-request session contamination in multi-tenant SSR environments
 *      by enforcing isolated client storage per server request.
 *    - Provides typed profile resolution and claims mapping to drive ClinIQ's
 *      downstream authorization middleware without coupling them to raw FHIR structures.
 * ============================================================================
 */

/**
 * Configuration options for creating or retrieving a MedplumClient instance.
 */
export interface MedplumConfig {
  readonly baseUrl?: string;
  readonly accessToken?: string;
  readonly clientId?: string;
  readonly onUnauthenticated?: () => void;
}

/**
 * Snapshot of an active Medplum authentication session.
 */
export interface MedplumSessionInfo {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly profileRef?: Reference<ProfileResource>;
  readonly projectRef?: Reference<Project>;
  readonly isAuthenticated: boolean;
}

/**
 * Standardized claims extracted from a Medplum profile for ClinIQ authorization.
 */
export interface MedplumUserClaimsInfo {
  readonly userId: string;
  readonly userType: "Practitioner" | "Patient" | "User" | "Other";
  readonly email?: string;
  readonly role: "physician" | "nurse" | "admin" | "patient";
  readonly organizationId: string;
  readonly practitionerId?: string;
  readonly patientId?: string;
  readonly displayName: string;
}

let browserClientInstance: MedplumClient | null = null;

/**
 * Checks whether the current execution runtime is Server-Side (Node.js / Next.js SSR / API server)
 * or Client-Side (Browser DOM).
 */
export function isServerRuntime(): boolean {
  return typeof window === "undefined";
}

/**
 * Returns a configured MedplumClient instance for self-hosted FHIR infrastructure.
 *
 * Execution Context Rules:
 * - Server / SSR (typeof window === "undefined"): Instantiates an isolated client
 *   backed by `new ClientStorage(new MemoryStorage())`. This prevents token and session
 *   state leakage between concurrent incoming HTTP requests on Node.js/Next.js servers.
 * - Browser (typeof window !== "undefined"): Maintains a stable singleton instance
 *   backed by standard browser storage.
 *
 * @param config Optional client configuration (baseUrl, accessToken, clientId, callbacks).
 * @returns Configured MedplumClient instance.
 */
export function getMedplumClient(config?: MedplumConfig): MedplumClient {
  const baseUrl = config?.baseUrl || fhirDefaults.baseUrl;

  if (isServerRuntime()) {
    const serverClient = new MedplumClient({
      baseUrl,
      accessToken: config?.accessToken,
      clientId: config?.clientId,
      onUnauthenticated: config?.onUnauthenticated,
      storage: new ClientStorage(new MemoryStorage()),
    });

    if (config?.accessToken) {
      serverClient.setAccessToken(config.accessToken);
    }

    return serverClient;
  }

  if (!browserClientInstance || (config?.baseUrl && config.baseUrl !== browserClientInstance.getBaseUrl())) {
    browserClientInstance = new MedplumClient({
      baseUrl,
      accessToken: config?.accessToken,
      clientId: config?.clientId,
      onUnauthenticated: config?.onUnauthenticated,
    });

    if (config?.accessToken) {
      browserClientInstance.setAccessToken(config.accessToken);
    }
  }

  return browserClientInstance;
}

/**
 * Creates an isolated, request-scoped MedplumClient instance with a dedicated in-memory
 * storage engine. Intended for Express route middleware, Next.js Server Components,
 * and background workers where tokens must not bleed into global state.
 *
 * @param accessToken Bearer access token issued by Medplum IdP.
 * @param baseUrl Optional Medplum server base URL.
 * @returns An isolated MedplumClient.
 */
export function createScopedMedplumClient(
  accessToken: string,
  baseUrl?: string
): MedplumClient {
  const client = new MedplumClient({
    baseUrl: baseUrl || fhirDefaults.baseUrl,
    accessToken,
    storage: new ClientStorage(new MemoryStorage()),
  });
  client.setAccessToken(accessToken);
  return client;
}

/**
 * Default global Medplum client instance for direct imports.
 */
export const medplum: MedplumClient = getMedplumClient();

// ── SESSION MANAGEMENT HELPER FUNCTIONS ──────────────────────────────────────

/**
 * Extracts active session details from a MedplumClient instance.
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns MedplumSessionInfo or null if not authenticated.
 */
export function getMedplumSession(
  client: MedplumClient = medplum
): MedplumSessionInfo | null {
  const activeLogin = client.getActiveLogin();
  const token = client.getAccessToken();

  if (!token && !activeLogin?.accessToken) {
    return null;
  }

  return {
    accessToken: token || activeLogin?.accessToken || "",
    refreshToken: activeLogin?.refreshToken,
    profileRef: activeLogin?.profile as Reference<ProfileResource> | undefined,
    projectRef: activeLogin?.project as Reference<Project> | undefined,
    isAuthenticated: client.isAuthenticated(),
  };
}

/**
 * Explicitly sets access and refresh tokens on a MedplumClient instance.
 *
 * @param accessToken Bearer access token.
 * @param refreshToken Optional refresh token.
 * @param client MedplumClient instance (defaults to global client).
 */
export function setMedplumSession(
  accessToken: string,
  refreshToken?: string,
  client: MedplumClient = medplum
): void {
  client.setAccessToken(accessToken, refreshToken);
}

/**
 * Clears active session, tokens, and storage for a MedplumClient instance.
 *
 * @param client MedplumClient instance (defaults to global client).
 */
export function clearMedplumSession(client: MedplumClient = medplum): void {
  client.clear();
}

/**
 * Validates whether the Medplum client is currently authenticated with a valid session.
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns Boolean indicating active authentication status.
 */
export function isMedplumAuthenticated(
  client: MedplumClient = medplum
): boolean {
  return client.isAuthenticated();
}

/**
 * Retrieves the raw access token from the Medplum client.
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns Current access token string or null.
 */
export function getMedplumAccessToken(
  client: MedplumClient = medplum
): string | null {
  const token = client.getAccessToken();
  return token || null;
}

// ── PROFILE RETRIEVAL HELPER FUNCTIONS ───────────────────────────────────────

/**
 * Retrieves the current authenticated user's profile resource (Patient, Practitioner, User, etc.).
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns Promise resolving to ProfileResource or null if unauthenticated.
 */
export async function getMedplumProfile(
  client: MedplumClient = medplum
): Promise<ProfileResource | null> {
  const cachedProfile = client.getProfile();
  if (cachedProfile && isProfileResource(cachedProfile)) {
    return cachedProfile as ProfileResource;
  }

  try {
    const asyncProfile = await client.getProfileAsync();
    if (asyncProfile && isProfileResource(asyncProfile)) {
      return asyncProfile as ProfileResource;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated practitioner profile, returning null if the
 * authenticated user is not a Practitioner.
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns Promise resolving to Practitioner or null.
 */
export async function getMedplumPractitionerProfile(
  client: MedplumClient = medplum
): Promise<Practitioner | null> {
  const profile = await getMedplumProfile(client);
  if (profile && profile.resourceType === "Practitioner") {
    return profile as Practitioner;
  }
  return null;
}

/**
 * Retrieves the current authenticated patient profile, returning null if the
 * authenticated user is not a Patient.
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns Promise resolving to Patient or null.
 */
export async function getMedplumPatientProfile(
  client: MedplumClient = medplum
): Promise<Patient | null> {
  const profile = await getMedplumProfile(client);
  if (profile && profile.resourceType === "Patient") {
    return profile as Patient;
  }
  return null;
}

/**
 * Resolves the authenticated Medplum profile into ClinIQ's standardized user claims.
 * Translates FHIR resources into ClinIQ application-level authorization roles
 * ('physician' | 'nurse' | 'admin' | 'patient').
 *
 * @param client MedplumClient instance (defaults to global client).
 * @returns Promise resolving to MedplumUserClaimsInfo or null.
 */
export async function getMedplumUserClaims(
  client: MedplumClient = medplum
): Promise<MedplumUserClaimsInfo | null> {
  const profile = await getMedplumProfile(client);
  if (!profile || !profile.id) {
    return null;
  }

  const profileId = profile.id;
  const organizationId = profile.meta?.project || "";
  let userType: "Practitioner" | "Patient" | "User" | "Other" = "Other";
  let role: "physician" | "nurse" | "admin" | "patient" = "patient";
  let displayName = "Unknown User";
  let practitionerId: string | undefined;
  let patientId: string | undefined;
  let email: string | undefined;

  if (profile.resourceType === "Practitioner") {
    userType = "Practitioner";
    practitionerId = profile.id;
    displayName = formatFhirHumanName(profile.name);

    // Extract email from telecom if available
    const emailTelecom = profile.telecom?.find((t: ContactPoint) => t.system === "email");
    if (emailTelecom?.value) {
      email = emailTelecom.value;
    }

    // Role classification: check qualification codes for nursing credentials
    const isNurse = profile.qualification?.some((q: PractitionerQualification) => {
      const code = q.code?.coding?.[0]?.code?.toLowerCase() || "";
      const text = q.code?.text?.toLowerCase() || "";
      return (
        code.includes("nurse") ||
        code.includes("rn") ||
        code.includes("np") ||
        text.includes("nurse") ||
        text.includes("rn") ||
        text.includes("np")
      );
    });

    role = isNurse ? "nurse" : "physician";
  } else if (profile.resourceType === "Patient") {
    userType = "Patient";
    patientId = profile.id;
    displayName = formatFhirHumanName(profile.name);
    role = "patient";

    const emailTelecom = profile.telecom?.find((t: ContactPoint) => t.system === "email");
    if (emailTelecom?.value) {
      email = emailTelecom.value;
    }
  } else {
    userType = "Other";
    displayName = formatFhirHumanName(profile.name);
    role = "patient";

    const emailTelecom = profile.telecom?.find((t: ContactPoint) => t.system === "email");
    if (emailTelecom?.value) {
      email = emailTelecom.value;
    }
  }

  return {
    userId: profileId,
    userType,
    email,
    role,
    organizationId,
    practitionerId,
    patientId,
    displayName,
  };
}


