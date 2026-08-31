import bcrypt from "bcryptjs";
import { db, users, organizations, employers, patients } from "@cliniq/db";
import { eq } from "drizzle-orm";
import {
  MedplumClient,
  ClientStorage,
  MemoryStorage,
  type Patient,
  type Practitioner,
  type ProjectMembership,
} from "@cliniq/fhir-core";
import {
  signUserToken,
  verifyMedplumToken,
  mapMedplumProfileToUserClaims,
  enrichWithLocalDatabase,
} from "../middleware/auth";
import type {
  LoginInput,
  RegisterPatientInput,
  UserRole,
  UserClaims,
  AuthUser,
} from "@cliniq/api-spec";
import { config } from "../config";

export interface LoginResult {
  token: string;
  user: AuthUser;
  medplumToken?: string;
}

export interface RegisterResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    patientId: string;
    organizationId: string;
  };
}

export async function loginUser(input: LoginInput): Promise<LoginResult | null> {
  const { email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check local PostgreSQL identity store
  const [localUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (localUser && localUser.passwordHash) {
    const isMatch = await bcrypt.compare(password, localUser.passwordHash);
    if (isMatch) {
      const claims: UserClaims = {
        userId: localUser.id,
        email: localUser.email,
        role: localUser.role as UserRole,
        organizationId: localUser.organizationId,
        patientId: localUser.patientId || undefined,
        providerId: localUser.providerId || undefined,
        employerId: localUser.employerId || undefined,
        isAdmin: localUser.isAdmin,
      };

      const token = signUserToken(claims);

      return {
        token,
        user: {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role as UserRole,
          firstName: localUser.firstName || undefined,
          lastName: localUser.lastName || undefined,
          organizationId: localUser.organizationId,
          patientId: localUser.patientId || undefined,
          providerId: localUser.providerId || undefined,
          employerId: localUser.employerId || undefined,
          isAdmin: localUser.isAdmin,
        },
      };
    }
  }

  // 2. Attempt Medplum authentication if local credentials do not match or user is in Medplum IdP
  try {
    const medplumClient = new MedplumClient({
      baseUrl: config.medplum.baseUrl,
      storage: new ClientStorage(new MemoryStorage()),
    });

    await medplumClient.startLogin({
      email: normalizedEmail,
      password,
    });

    const medplumAccessToken = medplumClient.getAccessToken();
    if (medplumAccessToken) {
      const profile = (await medplumClient.getProfileAsync()) as
        | Patient
        | Practitioner
        | ProjectMembership
        | undefined;
      const membership = medplumClient.getProjectMembership() as
        | ProjectMembership
        | undefined;

      const initialClaims = mapMedplumProfileToUserClaims({
        profile,
        membership,
        emailFallback: normalizedEmail,
      });

      const enriched = await enrichWithLocalDatabase(initialClaims);
      const token = signUserToken(enriched);

      return {
        token,
        medplumToken: medplumAccessToken,
        user: {
          id: enriched.userId,
          email: enriched.email,
          role: enriched.role,
          organizationId: enriched.organizationId,
          patientId: enriched.patientId,
          providerId: enriched.providerId,
          employerId: enriched.employerId,
          isAdmin: enriched.isAdmin,
        },
      };
    }
  } catch {
    // Medplum authentication failure falls through to returning null
  }

  return null;
}

export async function registerPatient(
  input: RegisterPatientInput
): Promise<{ result?: RegisterResult; error?: { status: number; message: string } }> {
  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    organizationSlug,
    employerId,
  } = input;

  const normalizedEmail = email.toLowerCase().trim();

  // Find or default organization
  let org = (await db.select().from(organizations).limit(1))[0];
  if (organizationSlug) {
    const found = (
      await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, organizationSlug))
    )[0];
    if (found) {
      org = found;
    }
  }

  if (!org) {
    return { error: { status: 400, message: "No active organization available for registration" } };
  }

  // Find or default employer
  let emp = (
    await db
      .select()
      .from(employers)
      .where(eq(employers.organizationId, org.id))
      .limit(1)
  )[0];
  if (employerId) {
    const found = (
      await db.select().from(employers).where(eq(employers.id, employerId))
    )[0];
    if (found) {
      emp = found;
    }
  }

  if (!emp) {
    return { error: { status: 400, message: "No active employer available for patient assignment" } };
  }

  // Hash password using bcrypt
  const passwordHash = await bcrypt.hash(password, 10);

  // Attempt creating FHIR Patient resource in Medplum
  let medplumPatientId: string | undefined;
  try {
    const medplumClient = new MedplumClient({
      baseUrl: config.medplum.baseUrl,
      storage: new ClientStorage(new MemoryStorage()),
    });

    const createdPatient = await medplumClient.createResource<Patient>({
      resourceType: "Patient",
      name: [
        {
          given: [firstName],
          family: lastName,
        },
      ],
      telecom: [
        {
          system: "email",
          value: normalizedEmail,
        },
      ],
      birthDate: dateOfBirth,
    });

    medplumPatientId = createdPatient.id;
  } catch {
    // Non-blocking fallback if Medplum is in disconnected mode
  }

  // Create Patient record in operational database
  const [newPatient] = await db
    .insert(patients)
    .values({
      organizationId: org.id,
      employerId: emp.id,
      medplumPatientId: medplumPatientId || undefined,
      firstName,
      lastName,
      dateOfBirth,
      email: normalizedEmail,
    })
    .returning();

  if (!newPatient) {
    return { error: { status: 500, message: "Failed to create patient profile" } };
  }

  // Create User account in operational database
  const [newUser] = await db
    .insert(users)
    .values({
      organizationId: org.id,
      email: normalizedEmail,
      passwordHash,
      role: "patient",
      firstName,
      lastName,
      patientId: newPatient.id,
    })
    .returning();

  if (!newUser) {
    return { error: { status: 500, message: "Failed to create user account" } };
  }

  const token = signUserToken({
    userId: newUser.id,
    email: newUser.email,
    role: "patient",
    organizationId: org.id,
    patientId: newPatient.id,
    isAdmin: false,
  });

  return {
    result: {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: "patient",
        firstName: newUser.firstName || undefined,
        lastName: newUser.lastName || undefined,
        patientId: newPatient.id,
        organizationId: org.id,
      },
    },
  };
}

export async function exchangeMedplumToken(
  tokenToVerify: string
): Promise<{ token: string; user: AuthUser } | null> {
  const claims = await verifyMedplumToken(tokenToVerify);
  if (!claims) {
    return null;
  }

  const cliniqToken = signUserToken(claims);

  return {
    token: cliniqToken,
    user: {
      id: claims.userId,
      email: claims.email,
      role: claims.role,
      organizationId: claims.organizationId,
      patientId: claims.patientId,
      providerId: claims.providerId,
      employerId: claims.employerId,
      isAdmin: claims.isAdmin,
    },
  };
}
