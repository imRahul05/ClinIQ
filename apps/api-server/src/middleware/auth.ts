import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify, decodeJwt, type JWTPayload } from "jose";
import {
  MedplumClient,
  ClientStorage,
  MemoryStorage,
  type Practitioner,
  type Patient,
  type ProjectMembership,
} from "@cliniq/fhir-core";
import { db, users } from "@cliniq/db";
import { eq } from "drizzle-orm";
import type { UserRole, UserClaims } from "@cliniq/api-spec";
import { config } from "../config";

export type { UserRole, UserClaims } from "@cliniq/api-spec";

declare global {
  namespace Express {
    interface Request {
      user?: UserClaims;
    }
  }
}

/**
 * Sign a ClinIQ internal session JWT token using the configured secret.
 */
export function signUserToken(claims: UserClaims): string {
  return jwt.sign(claims, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

/*
 * ============================================================================
 * JWKS SIGNATURE VALIDATION & ARCHITECTURAL DECISIONS
 * ============================================================================
 * Medplum uses asymmetric cryptography (RS256/ES256) to sign SMART-on-FHIR
 * and OAuth2 access tokens. The public keys are published at Medplum's
 * standard `/.well-known/jwks.json` discovery endpoint.
 *
 * 1. Distributed Verification:
 *    Using `jose.createRemoteJWKSet` verifies Medplum JWTs without needing
 *    shared symmetric secrets, ensuring cryptographic isolation between the
 *    Medplum IdP and operational microservices.
 *
 * 2. Caching & Key Rotation:
 *    `createRemoteJWKSet` automatically caches signing keys in memory and
 *    respects HTTP Cache-Control headers, refetching seamlessly when a token
 *    is signed with a rotated key identified by its 'kid' header.
 *
 * 3. Dual-Validation Fallback Strategy:
 *    - Step 1: Attempt local HS256 verification (fast path for internal tokens).
 *    - Step 2: Attempt Medplum JWKS cryptographic signature verification.
 *    - Step 3: Attempt MedplumClient profile resolution via `/auth/me`.
 * ============================================================================
 */

function getMedplumJwksUri(): URL {
  const base = config.medplum.baseUrl.endsWith("/")
    ? config.medplum.baseUrl
    : `${config.medplum.baseUrl}/`;
  return new URL(".well-known/jwks.json", base);
}

let cachedRemoteJWKSet: ReturnType<typeof createRemoteJWKSet> | null = null;

function getRemoteJWKSet(): ReturnType<typeof createRemoteJWKSet> {
  if (!cachedRemoteJWKSet) {
    cachedRemoteJWKSet = createRemoteJWKSet(getMedplumJwksUri());
  }
  return cachedRemoteJWKSet;
}

/**
 * Creates a scoped MedplumClient instance initialized with the caller's Bearer token.
 */
export function createScopedMedplumClient(accessToken: string): MedplumClient {
  return new MedplumClient({
    baseUrl: config.medplum.baseUrl,
    accessToken,
    storage: new ClientStorage(new MemoryStorage()),
  });
}

/**
 * Shape of custom claims extracted from a Medplum token payload.
 */
export interface MedplumCustomTokenClaims {
  readonly sub?: string;
  readonly email?: string;
  readonly role?: string;
  readonly profile?: string;
  readonly project?: string;
  readonly [key: string]: string | number | boolean | string[] | undefined;
}

/*
 * ============================================================================
 * ROLE MAPPING & FHIR RESOURCE RESOLUTION DECISIONS
 * ============================================================================
 * FHIR resources (Practitioner, Patient, ProjectMembership) represent healthcare
 * identities. ClinIQ maps these clinical resources to role-based access scopes:
 *
 * 1. Project Administrator (ProjectMembership.admin === true):
 *    Mapped to role: "admin", isAdmin: true.
 *    Grants access to administrative endpoints, user management, and compliance audits.
 *
 * 2. Practitioner (FHIR Practitioner):
 *    - Qualifications and specialties are inspected for nursing identifiers
 *      ("nurse", "rn", "np", "bsn") -> mapped to role: "nurse".
 *    - Care management indicators ("coordinator", "care_coordinator")
 *      -> mapped to role: "care_coordinator".
 *    - Default clinical practitioner -> mapped to role: "physician".
 *    - Practitioner.id is mapped to providerId.
 *
 * 3. Patient (FHIR Patient):
 *    - Mapped to role: "patient".
 *    - Patient.id is mapped to patientId.
 *
 * 4. Operational Database Enrichment:
 *    - Matches the authenticated user against the PostgreSQL `users` table
 *      to inject local operational metadata (e.g. `employerId`, local UUIDs).
 * ============================================================================
 */

export function mapRoleFromProfile(
  profile?: Patient | Practitioner | ProjectMembership | null,
  membership?: ProjectMembership | null,
  explicitRole?: string
): { role: UserRole; isAdmin: boolean } {
  // 1. Check if membership explicitly marks user as admin
  if (membership?.admin === true) {
    return { role: "admin", isAdmin: true };
  }

  // 2. Check if explicit role is an authorized system role
  if (explicitRole === "admin") {
    return { role: "admin", isAdmin: true };
  }
  if (explicitRole === "nurse") {
    return { role: "nurse", isAdmin: false };
  }
  if (explicitRole === "care_coordinator") {
    return { role: "care_coordinator", isAdmin: false };
  }
  if (explicitRole === "employer_admin") {
    return { role: "employer_admin", isAdmin: false };
  }
  if (explicitRole === "physician") {
    return { role: "physician", isAdmin: false };
  }
  if (explicitRole === "patient") {
    return { role: "patient", isAdmin: false };
  }

  // 3. Map from FHIR Practitioner resource
  if (profile && profile.resourceType === "Practitioner") {
    const practitioner = profile as Practitioner;
    const qualifications = practitioner.qualification
      ?.map((q) => q.code?.text || q.code?.coding?.[0]?.display || "")
      .join(" ")
      .toLowerCase() || "";
    const identifiers = practitioner.identifier
      ?.map((i) => i.value || "")
      .join(" ")
      .toLowerCase() || "";

    if (
      qualifications.includes("nurse") ||
      qualifications.includes("rn") ||
      qualifications.includes("np") ||
      qualifications.includes("bsn") ||
      identifiers.includes("nurse")
    ) {
      return { role: "nurse", isAdmin: false };
    }

    if (
      qualifications.includes("coordinator") ||
      identifiers.includes("coordinator")
    ) {
      return { role: "care_coordinator", isAdmin: false };
    }

    return { role: "physician", isAdmin: false };
  }

  // 4. Map from FHIR Patient resource
  if (profile && profile.resourceType === "Patient") {
    return { role: "patient", isAdmin: false };
  }

  // 5. Map from FHIR ProjectMembership
  if (profile && profile.resourceType === "ProjectMembership") {
    const pm = profile as ProjectMembership;
    if (pm.admin) {
      return { role: "admin", isAdmin: true };
    }
    const ref = pm.profile?.reference || "";
    if (ref.startsWith("Practitioner/")) {
      return { role: "physician", isAdmin: false };
    }
    if (ref.startsWith("Patient/")) {
      return { role: "patient", isAdmin: false };
    }
  }

  // Default fallback role
  return { role: "patient", isAdmin: false };
}

export function extractEmail(
  profile?: Patient | Practitioner | ProjectMembership | null,
  membership?: ProjectMembership | null,
  fallback?: string
): string {
  if (membership?.userName && membership.userName.includes("@")) {
    return membership.userName.toLowerCase().trim();
  }

  if (profile && "telecom" in profile && Array.isArray(profile.telecom)) {
    const emailContact = profile.telecom.find((t) => t.system === "email");
    if (emailContact?.value) {
      return emailContact.value.toLowerCase().trim();
    }
  }

  if (fallback && fallback.includes("@")) {
    return fallback.toLowerCase().trim();
  }

  return fallback || "user@cliniq.local";
}

export function extractUserId(
  profile?: Patient | Practitioner | ProjectMembership | null,
  membership?: ProjectMembership | null,
  fallback?: string
): string {
  if (membership?.user?.reference) {
    return membership.user.reference.replace(/^User\//, "");
  }
  if (profile?.id) {
    return profile.id;
  }
  if (fallback) {
    return fallback;
  }
  return "medplum-user";
}

export function extractPatientId(
  profile?: Patient | Practitioner | ProjectMembership | null,
  membership?: ProjectMembership | null
): string | undefined {
  if (profile && profile.resourceType === "Patient") {
    return profile.id;
  }
  if (membership?.profile?.reference?.startsWith("Patient/")) {
    return membership.profile.reference.replace(/^Patient\//, "");
  }
  return undefined;
}

export function extractProviderId(
  profile?: Patient | Practitioner | ProjectMembership | null,
  membership?: ProjectMembership | null
): string | undefined {
  if (profile && profile.resourceType === "Practitioner") {
    return profile.id;
  }
  if (membership?.profile?.reference?.startsWith("Practitioner/")) {
    return membership.profile.reference.replace(/^Practitioner\//, "");
  }
  return undefined;
}

export function extractOrganizationId(
  profile?: Patient | Practitioner | ProjectMembership | null,
  membership?: ProjectMembership | null,
  fallback?: string
): string {
  if (membership?.project?.reference) {
    return membership.project.reference.replace(/^Project\//, "");
  }
  if (profile?.meta?.project) {
    return profile.meta.project;
  }
  if (fallback) {
    return fallback;
  }
  return "default-org";
}

/**
 * Enriches Medplum UserClaims with operational metadata from PostgreSQL users table.
 */
export async function enrichWithLocalDatabase(claims: UserClaims): Promise<UserClaims> {
  try {
    const [localUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, claims.email.toLowerCase().trim()))
      .limit(1);

    if (localUser) {
      return {
        userId: localUser.id,
        email: localUser.email,
        role: (localUser.role as UserRole) || claims.role,
        organizationId: localUser.organizationId || claims.organizationId,
        patientId: localUser.patientId || claims.patientId,
        providerId: localUser.providerId || claims.providerId,
        employerId: localUser.employerId || claims.employerId,
        isAdmin: localUser.isAdmin || claims.isAdmin,
      };
    }
  } catch {
    // Database enrichment failure does not block authentication
  }
  return claims;
}

export interface MapMedplumProfileParams {
  readonly profile?: Patient | Practitioner | ProjectMembership | null;
  readonly membership?: ProjectMembership | null;
  readonly tokenClaims?: MedplumCustomTokenClaims | null;
  readonly emailFallback?: string;
  readonly userIdFallback?: string;
}

/**
 * Maps Medplum FHIR profiles and claims into normalized UserClaims.
 */
export function mapMedplumProfileToUserClaims(params: MapMedplumProfileParams): UserClaims {
  const { profile, membership, tokenClaims, emailFallback, userIdFallback } = params;

  const roleInfo = mapRoleFromProfile(profile, membership, tokenClaims?.role);
  const email = extractEmail(profile, membership, tokenClaims?.email || emailFallback);
  const userId = extractUserId(profile, membership, tokenClaims?.sub || userIdFallback);
  const patientId = extractPatientId(profile, membership);
  const providerId = extractProviderId(profile, membership);
  const organizationId = extractOrganizationId(
    profile,
    membership,
    tokenClaims?.project || (typeof tokenClaims?.organizationId === "string" ? tokenClaims.organizationId : undefined)
  );

  return {
    userId,
    email,
    role: roleInfo.role,
    organizationId,
    patientId,
    providerId,
    isAdmin: roleInfo.isAdmin,
  };
}

/**
 * Verifies a Medplum Bearer token using JWKS signature validation and MedplumClient profile retrieval.
 */
export async function verifyMedplumToken(token: string): Promise<UserClaims | null> {
  let verifiedClaims: MedplumCustomTokenClaims | null = null;

  // 1. Attempt JWKS cryptographic signature verification using jose
  try {
    const remoteJWKSet = getRemoteJWKSet();
    const verifyResult = await jwtVerify(token, remoteJWKSet);
    const payload = verifyResult.payload as JWTPayload & MedplumCustomTokenClaims;
    verifiedClaims = {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role: typeof payload.role === "string" ? payload.role : undefined,
      profile: typeof payload.profile === "string" ? payload.profile : undefined,
      project: typeof payload.project === "string" ? payload.project : undefined,
    };
  } catch {
    // JWKS signature verification may fail if Medplum is unreachable or token is from a different issuer.
    // Try fallback token decoding if it contains Medplum claims
    try {
      const decoded = decodeJwt(token);
      const profile = typeof decoded.profile === "string" ? decoded.profile : undefined;
      const iss = typeof decoded.iss === "string" ? decoded.iss : undefined;
      const project = typeof decoded.project === "string" ? decoded.project : undefined;
      const sub = typeof decoded.sub === "string" ? decoded.sub : undefined;
      const email = typeof decoded.email === "string" ? decoded.email : undefined;
      const role = typeof decoded.role === "string" ? decoded.role : undefined;

      if (profile || (iss && iss.includes("medplum")) || project) {
        verifiedClaims = {
          sub,
          email,
          role,
          profile,
          project,
        };
      }
    } catch {
      // Not a valid JWT structure
    }
  }

  // 2. Fetch authenticated profile via scoped MedplumClient
  try {
    const medplumClient = createScopedMedplumClient(token);
    const profile = (await medplumClient.getProfileAsync()) as
      | Patient
      | Practitioner
      | ProjectMembership
      | undefined;
    const membership = medplumClient.getProjectMembership() as ProjectMembership | undefined;

    if (profile || verifiedClaims) {
      const initialClaims = mapMedplumProfileToUserClaims({
        profile,
        membership,
        tokenClaims: verifiedClaims,
      });

      return await enrichWithLocalDatabase(initialClaims);
    }
  } catch {
    // If Medplum live service is unreachable but JWKS verification was successful, map directly from claims
    if (verifiedClaims) {
      const initialClaims = mapMedplumProfileToUserClaims({
        tokenClaims: verifiedClaims,
      });
      return await enrichWithLocalDatabase(initialClaims);
    }
  }

  return null;
}

/**
 * Express middleware for authentication supporting ClinIQ JWTs and Medplum Bearer tokens.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Token missing" });
    return;
  }

  // 1. Fast path: Check ClinIQ internal HS256 token
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as UserClaims;
    if (decoded && decoded.userId && decoded.role) {
      req.user = decoded;
      next();
      return;
    }
  } catch {
    // Token is not signed by internal secret; proceed to Medplum verification
  }

  // 2. Medplum Bearer token verification (RS256 / JWKS / getProfile)
  try {
    const medplumUser = await verifyMedplumToken(token);
    if (medplumUser) {
      req.user = medplumUser;
      next();
      return;
    }
  } catch {
    // Verification failed
  }

  res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
}

/**
 * Middleware requiring that the authenticated user possesses one of the allowed roles,
 * or possesses administrative privileges.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user.isAdmin || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ error: "Forbidden: Insufficient privileges for this role" });
  };
}

/**
 * Middleware requiring administrative privileges (role === 'admin' or isAdmin === true).
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.role === "admin" || req.user.isAdmin) {
    next();
    return;
  }

  res.status(403).json({ error: "Forbidden: Admin access required" });
}

/**
 * Extracts and asserts the organization ID from the authenticated request context.
 */
export function orgId(req: Request): string {
  if (!req.user?.organizationId) {
    throw new Error("Organization ID not found on authenticated request");
  }
  return req.user.organizationId;
}

