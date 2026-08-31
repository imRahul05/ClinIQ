import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
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
  authMiddleware,
  verifyMedplumToken,
  mapMedplumProfileToUserClaims,
  enrichWithLocalDatabase,
} from "../middleware/auth";
import {
  LoginSchema,
  RegisterPatientSchema,
  TokenExchangeSchema,
  type UserRole,
  type UserClaims,
} from "@cliniq/api-spec";
import { config } from "../config";

const router = Router();

/**
 * Multi-persona login supporting local PostgreSQL credentials and Medplum IdP authentication.
 * Insecure hardcoded credential bypasses (e.g. demo123) have been strictly eliminated.
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid login credentials format",
      details: parseResult.error.format(),
    });
    return;
  }

  const { email, password } = parseResult.data;
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
      const token = signUserToken({
        userId: localUser.id,
        email: localUser.email,
        role: localUser.role as UserRole,
        organizationId: localUser.organizationId,
        patientId: localUser.patientId || undefined,
        providerId: localUser.providerId || undefined,
        employerId: localUser.employerId || undefined,
        isAdmin: localUser.isAdmin,
      });

      res.json({
        token,
        user: {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          organizationId: localUser.organizationId,
          patientId: localUser.patientId,
          providerId: localUser.providerId,
          employerId: localUser.employerId,
          isAdmin: localUser.isAdmin,
        },
      });
      return;
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

      res.json({
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
      });
      return;
    }
  } catch {
    // Medplum authentication failure falls through to generic 401
  }

  res.status(401).json({ error: "Invalid email or password" });
});

/**
 * Patient Self-Registration creating records in Medplum FHIR and PostgreSQL.
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const parseResult = RegisterPatientSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid registration data",
      details: parseResult.error.format(),
    });
    return;
  }

  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    organizationSlug,
    employerId,
  } = parseResult.data;

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
    res.status(400).json({ error: "No active organization available for registration" });
    return;
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
    res.status(400).json({ error: "No active employer available for patient assignment" });
    return;
  }

  // Hash password using strong bcrypt rounds
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
    res.status(500).json({ error: "Failed to create patient profile" });
    return;
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
    res.status(500).json({ error: "Failed to create user account" });
    return;
  }

  const token = signUserToken({
    userId: newUser.id,
    email: newUser.email,
    role: "patient",
    organizationId: org.id,
    patientId: newPatient.id,
    isAdmin: false,
  });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: "patient",
      firstName,
      lastName,
      patientId: newPatient.id,
      organizationId: org.id,
    },
  });
});

/**
 * Exchange a Medplum SMART on FHIR / OAuth token for a ClinIQ session token.
 */
router.post("/exchange", async (req: Request, res: Response): Promise<void> => {
  let tokenToVerify: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    tokenToVerify = authHeader.split(" ")[1];
  } else {
    const parseResult = TokenExchangeSchema.safeParse(req.body);
    if (parseResult.success) {
      tokenToVerify = parseResult.data.token;
    }
  }

  if (!tokenToVerify) {
    res.status(400).json({
      error: "Missing Medplum token in Authorization header or body payload",
    });
    return;
  }

  const claims = await verifyMedplumToken(tokenToVerify);
  if (!claims) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired Medplum token" });
    return;
  }

  const cliniqToken = signUserToken(claims);

  res.json({
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
  });
});

/**
 * Retrieve current authenticated session identity.
 */
router.get("/me", authMiddleware, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json({ user: req.user });
});

export default router;

