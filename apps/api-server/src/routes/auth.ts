import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, users, organizations, employers, patients, providers } from "@cliniq/db";
import { eq } from "drizzle-orm";
import { signUserToken } from "../middleware/auth";
import { LoginSchema, RegisterPatientSchema } from "@cliniq/api-spec";

const router = Router();

// Multi-persona login (Credentials & Demo)
router.post("/login", async (req, res) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid login credentials format", details: parseResult.error.format() });
    return;
  }

  const { email, password } = parseResult.data;

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Verify password or demo password bypass
  const isMatch = user.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : password === "demo123";

  if (!isMatch && password !== "demo123") {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signUserToken({
    userId: user.id,
    email: user.email,
    role: user.role as "patient" | "physician" | "nurse" | "care_coordinator" | "employer_admin" | "admin",
    organizationId: user.organizationId,
    patientId: user.patientId || undefined,
    providerId: user.providerId || undefined,
    employerId: user.employerId || undefined,
    isAdmin: user.isAdmin,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      patientId: user.patientId,
      providerId: user.providerId,
      employerId: user.employerId,
      isAdmin: user.isAdmin,
    },
  });
});

// Patient Self-Registration
router.post("/register", async (req, res) => {
  const parseResult = RegisterPatientSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid registration data", details: parseResult.error.format() });
    return;
  }

  const { firstName, lastName, email, password, dateOfBirth, organizationSlug, employerId } = parseResult.data;

  // Find or default organization
  let org = (await db.select().from(organizations).limit(1))[0];
  if (organizationSlug) {
    const found = (await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)))[0];
    if (found) org = found;
  }

  if (!org) {
    res.status(400).json({ error: "No active organization available for registration" });
    return;
  }

  // Find or default employer
  let emp = (await db.select().from(employers).where(eq(employers.organizationId, org.id)).limit(1))[0];
  if (employerId) {
    const found = (await db.select().from(employers).where(eq(employers.id, employerId)))[0];
    if (found) emp = found;
  }

  if (!emp) {
    res.status(400).json({ error: "No active employer available for patient assignment" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create Patient record
  const [newPatient] = await db.insert(patients).values({
    organizationId: org.id,
    employerId: emp.id,
    firstName,
    lastName,
    dateOfBirth,
    email: email.toLowerCase().trim(),
  }).returning();

  if (!newPatient) {
    res.status(500).json({ error: "Failed to create patient profile" });
    return;
  }

  // Create User account
  const [newUser] = await db.insert(users).values({
    organizationId: org.id,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "patient",
    firstName,
    lastName,
    patientId: newPatient.id,
  }).returning();

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

export default router;
