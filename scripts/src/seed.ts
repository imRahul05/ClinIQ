import bcrypt from "bcryptjs";
import {
  db,
  organizations,
  employers,
  roles,
  users,
  providers,
  nurseAvailability,
  patients,
  conditions,
  medications,
  labReadings,
  careGaps,
  auditLogs,
  financialEventLedger,
} from "@cliniq/db";

async function seed() {
  console.log("🌱 Seeding ClinIQ unified database...");

  // 1. Create Organization
  const [org] = await db
    .insert(organizations)
    .values({
      name: "Nuvi Health Core",
      slug: "nuvi-health",
      isProduction: false,
    })
    .returning();

  if (!org) throw new Error("Failed to create organization");
  console.log(`✅ Organization created: ${org.name}`);

  // 2. Create Employers
  const [emp1] = await db
    .insert(employers)
    .values({
      organizationId: org.id,
      name: "Apex Global Tech",
      sector: "Technology",
      hqCity: "San Francisco",
      hqState: "CA",
      coveredLives: 1250,
      pmpmRate: "45.00",
      erCostPerVisit: "1850.00",
    })
    .returning();

  if (!emp1) throw new Error("Failed to create employer");
  console.log(`✅ Employer created: ${emp1.name}`);

  // 3. Create Roles
  const [nurseRole] = await db
    .insert(roles)
    .values({
      organizationId: org.id,
      name: "nurse",
      description: "Clinical Care Coordinator & Triage Nurse",
    })
    .returning();

  const [patientRole] = await db
    .insert(roles)
    .values({
      organizationId: org.id,
      name: "patient",
      description: "Enrolled Member / Patient",
    })
    .returning();

  // 4. Create Provider
  const [provider1] = await db
    .insert(providers)
    .values({
      organizationId: org.id,
      firstName: "Elena",
      lastName: "Rostova",
      credential: "RN, BSN",
      specialty: "Virtual Care Coordination",
      role: "nurse",
      npi: "1948201948",
      npiVerified: true,
      email: "nurse.elena@apexhealthiq.demo",
    })
    .returning();

  if (!provider1) throw new Error("Failed to create provider");

  await db.insert(nurseAvailability).values({
    providerId: provider1.id,
    organizationId: org.id,
    isAvailable: true,
    status: "available",
  });
  console.log(`✅ Provider created: ${provider1.firstName} ${provider1.lastName}`);

  // 5. Create Patient
  const [patient1] = await db
    .insert(patients)
    .values({
      organizationId: org.id,
      employerId: emp1.id,
      firstName: "Sarah",
      lastName: "Johnson",
      dateOfBirth: "1988-04-12",
      gender: "Female",
      email: "sarah.johnson@apexhealthiq.demo",
      phone: "(555) 234-5678",
      mrn: "948204",
      assignedNurseId: provider1.id,
      ohsScore: "82.00",
      riskTier: "low",
      riskScore: 18,
    })
    .returning();

  if (!patient1) throw new Error("Failed to create patient");
  console.log(`✅ Patient created: ${patient1.firstName} ${patient1.lastName}`);

  // 6. Create Users
  const passwordHash = await bcrypt.hash("demo123", 10);

  await db.insert(users).values([
    {
      organizationId: org.id,
      email: "sarah.johnson@apexhealthiq.demo",
      passwordHash,
      role: "patient",
      roleId: patientRole?.id,
      firstName: "Sarah",
      lastName: "Johnson",
      patientId: patient1.id,
      isDemo: true,
    },
    {
      organizationId: org.id,
      email: "nurse.elena@apexhealthiq.demo",
      passwordHash,
      role: "nurse",
      roleId: nurseRole?.id,
      firstName: "Elena",
      lastName: "Rostova",
      providerId: provider1.id,
      isDemo: true,
    },
    {
      organizationId: org.id,
      email: "hr.admin@apexhealthiq.demo",
      passwordHash,
      role: "employer_admin",
      firstName: "Apex",
      lastName: "HR Admin",
      employerId: emp1.id,
      isDemo: true,
    },
    {
      organizationId: org.id,
      email: "admin@apexhealthiq.demo",
      passwordHash,
      role: "admin",
      firstName: "System",
      lastName: "Administrator",
      isAdmin: true,
      isDemo: true,
    },
  ]);
  console.log("✅ Seeded demo user accounts with password 'demo123'");

  // 7. Clinical Data
  await db.insert(conditions).values([
    {
      organizationId: org.id,
      patientId: patient1.id,
      name: "Type 2 Diabetes Mellitus without complications",
      icdCode: "E11.9",
      status: "active",
    },
    {
      organizationId: org.id,
      patientId: patient1.id,
      name: "Essential (Primary) Hypertension",
      icdCode: "I10",
      status: "active",
    },
  ]);

  await db.insert(medications).values([
    {
      organizationId: org.id,
      patientId: patient1.id,
      name: "Metformin HCl 500mg",
      dose: "500mg",
      frequency: "Twice daily with meals",
      prescriber: "Dr. Robert Chen, MD",
      status: "active",
    },
    {
      organizationId: org.id,
      patientId: patient1.id,
      name: "Lisinopril 10mg",
      dose: "10mg",
      frequency: "Once daily in morning",
      prescriber: "Dr. Robert Chen, MD",
      status: "active",
    },
  ]);

  await db.insert(labReadings).values([
    {
      organizationId: org.id,
      patientId: patient1.id,
      biomarker: "Fasting Blood Glucose",
      value: "92.000",
      unit: "mg/dL",
      readingDate: "2026-08-15",
      referenceRangeLow: "70.000",
      referenceRangeHigh: "99.000",
      interpretation: "Normal",
    },
    {
      organizationId: org.id,
      patientId: patient1.id,
      biomarker: "Hemoglobin A1c",
      value: "5.400",
      unit: "%",
      readingDate: "2026-08-15",
      referenceRangeLow: "4.000",
      referenceRangeHigh: "5.600",
      interpretation: "Normal",
    },
  ]);

  await db.insert(careGaps).values([
    {
      organizationId: org.id,
      patientId: patient1.id,
      measure: "CDC-E",
      measureName: "Annual Diabetic Retinal Eye Exam",
      hedisCode: "CDC-E",
      dueDate: "2026-09-30",
      status: "open",
    },
  ]);

  // 8. Financial Event Ledger
  await db.insert(financialEventLedger).values([
    {
      organizationId: org.id,
      employerId: emp1.id,
      patientId: patient1.id,
      eventType: "er_avoided",
      grossSavings: "1850.00",
      netSavings: "1805.00",
      eventDate: "2026-08-29",
      metadata: { reason: "Acute Hypertensive Guidance & Callback" },
    },
  ]);

  // 9. Audit Log
  await db.insert(auditLogs).values([
    {
      organizationId: org.id,
      actorEmail: "nurse.elena@apexhealthiq.demo",
      actorRole: "nurse",
      patientId: patient1.id,
      action: "read",
      resourceType: "PatientChart",
      requestPath: "/api/provider/chart/" + patient1.id,
      ipAddress: "192.168.1.42",
    },
  ]);

  console.log("🎉 ClinIQ database successfully seeded!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
