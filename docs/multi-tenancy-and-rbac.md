# Multi-Tenancy & Access Control (RBAC) Architecture

ClinIQ implements an enterprise-grade **Dual-Dimension Multi-Tenancy** and **Role-Based Access Control (RBAC)** architecture designed for health systems, medical groups, and employer wellness programs.

---

## 1. Dual-Dimension Multi-Tenancy Model

ClinIQ isolates data across two primary hierarchies:

```
                    ┌─────────────────────────┐
                    │    Root Organization    │  (e.g., Nuvi Health System)
                    │   (Provider Network)    │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │  Employer Tenant A    │       │  Employer Tenant B    │  (e.g., Apex Global Tech)
     │ (Corporate Plan 1000) │       │ (Corporate Plan 500)  │
     └───────────┬───────────┘       └───────────┬───────────┘
                 │                               │
                 ▼                               ▼
       Covered Lives (Patients)        Covered Lives (Patients)
```

### Tenancy Rules:
1. **Organization Isolation**: Clinicians and resources belong to an `organization_id`. Database queries for charts, queues, and faxes are strictly scoped by `organization_id`.
2. **Employer Sub-Tenancy**: Patients belong to both an `organization_id` (the healthcare provider network) and an `employer_id` (the sponsor health plan).
3. **Employer Portal Scoping**: HR administrators and plan sponsors can only view aggregated, de-identified metrics and savings ledgers where `employer_id = user.employerId`. They have zero access to individual identifiable medical records.

---

## 2. Role-Based Access Control (RBAC) Matrix

ClinIQ defines four standard personas with distinct authorization boundaries:

| Permission / Capability | `patient` | `nurse` / `physician` | `employer_admin` | `admin` |
| :--- | :---: | :---: | :---: | :---: |
| **View Own Medical Chart & Labs** | ✅ | ❌ | ❌ | ❌ |
| **Complete Self-Intake Questionnaires** | ✅ | ❌ | ❌ | ❌ |
| **Book Appointment Slots ($find / $hold)** | ✅ | ❌ | ❌ | ❌ |
| **Access Patient Panel & Longitudinal Charts** | ❌ | ✅ (Assigned Org) | ❌ | ✅ |
| **Use Ambient AI Scribe & Sign SOAP Notes** | ❌ | ✅ | ❌ | ❌ |
| **Accept Virtual Care Calls (On-Duty)** | ❌ | ✅ | ❌ | ❌ |
| **Triage Inbound AI Faxes** | ❌ | ✅ | ❌ | ❌ |
| **View Population Risk & ER Savings Ledger** | ❌ | ❌ | ✅ (Assigned Emp) | ✅ |
| **View HEDIS Care Gap Closure Rates** | ❌ | ✅ (Clinical) | ✅ (Aggregated) | ✅ |
| **Manage Staff Accounts & NPI Verification** | ❌ | ❌ | ❌ | ✅ |
| **Inspect HIPAA PHI Audit Logs** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Middleware Enforcement (`apps/api-server/src/middleware/auth.ts`)

Authorization is enforced at the HTTP boundary via Express middleware with **Medplum JWKS RS256/ES256 cryptographic verification** and live FHIR profile mapping:

```typescript
import { authMiddleware, requireRole, orgId } from "../middleware/auth";

// Only authenticated nurses or physicians within the tenant can access the clinical chart
router.get(
  "/chart/:patientId",
  authMiddleware,
  requireRole("nurse", "physician"),
  async (req, res) => {
    const currentOrgId = orgId(req);
    // Handler automatically scoped to req.user.organizationId
  }
);
```

### Key Security Mechanics:
1. **Asymmetric JWKS Verification**: `authMiddleware` verifies the Medplum Bearer access token signature against `/.well-known/jwks.json` using `jose`.
2. **Dynamic Profile Resolution**: Automatically resolves the live `Practitioner` or `Patient` FHIR resource from Medplum to extract `providerId`, `patientId`, and role.
3. **Database Context Enrichment**: Enriches the user claims with local PostgreSQL `employerId` and `organizationId` mappings.
4. **Zero-Trust Route Guards**: `requireRole` and `requireAdmin` verify the resolved claims, blocking unauthorized requests with `403 Forbidden`.

---

## 4. How to Modify or Extend Access Control

### Step 1: Add a New Role
In `packages/db/src/schema/index.ts`, update the role definitions if adding a new system-level role:
```typescript
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: varchar("name", { length: 50 }).notNull(), // e.g. "care_manager", "biller"
  description: text("description"),
});
```

### Step 2: Update API Spec Enums
In `packages/api-spec/src/schemas.ts`, update `AuthUserSchema`:
```typescript
export const AuthUserSchema = z.object({
  id: z.string(),
  role: z.enum(["patient", "nurse", "physician", "employer_admin", "admin", "care_manager"]),
  organizationId: z.string(),
  employerId: z.string().optional(),
});
```

### Step 3: Guard Routes with `requireRole`
In `apps/api-server/src/routes/*.ts`:
```typescript
router.post("/billing/submit", requireRole(["admin", "biller"]), async (req, res) => {
  // Billing submission logic
});
```

### Step 4: Add UI Navigation Guard
In `apps/web/src/app/(portal)/layout.tsx`, check `user.role` before rendering privileged tabs.
