# FHIR R4 & Self-Hosted Medplum Integration (`packages/fhir-core`)

ClinIQ is designed to be **100% self-hosted, self-contained, and independent**. We use the official open-source `@medplum/core` SDK as an off-the-shelf library pointing directly to our own self-hosted FHIR infrastructure.

---

## 1. Zero External Cloud Dependencies

Unlike proprietary health cloud SaaS, ClinIQ does **NOT** require any external Medplum Cloud accounts, client IDs, or client secrets:

```
 ┌────────────────────────────────────────────────────────┐
 │                   ClinIQ Application                   │
 │            (Next.js 16 Web + Express 5 API)            │
 └───────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
 ┌──────────────────────┐          ┌──────────────────────┐
 │ Self-Hosted Medplum  │          │  ClinIQ PostgreSQL   │
 │   (Local Port 8103)  │          │  (Local Port 5432)   │
 └──────────┬───────────┘          └──────────────────────┘
            │
            ▼
 ┌──────────────────────┐
 │   Local Postgres DB  │
 └──────────────────────┘
```

- **Open-Source FHIR Engine**: Runs locally or in your private VPC using standard Docker containers (`medplum/medplum-server:latest`).
- **Zero Third-Party Vendor Auth**: Authentication and token verification are handled internally by ClinIQ.
- **Upgradability**: Medplum SDK npm packages (`@medplum/core`, `@medplum/fhirtypes`, `@medplum/react-hooks`) are used as standard libraries, so you can bump versions anytime without touching core application logic.

---

## 2. Local Self-Hosted Client (`src/client.ts`)

The singleton client in `packages/fhir-core/src/client.ts` connects directly to your self-hosted endpoint (`http://localhost:8103/` by default):

```typescript
import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || "http://localhost:8103/",
});
```

---

## 3. Running Self-Hosted with Docker

To boot up local PostgreSQL, Redis, and self-hosted Medplum Server simultaneously:

```bash
# Start all self-hosted infrastructure containers
docker compose up -d
```

Services exposed:
- **PostgreSQL**: `localhost:5432` (database: `cliniq`, user/pass: `postgres`/`postgres`)
- **Self-Hosted FHIR Server**: `http://localhost:8103/`
- **Redis Cache**: `localhost:6379`
- **ClinIQ Web App**: `http://localhost:3000`
- **ClinIQ API & WebSockets**: `http://localhost:4000`

---

## 4. Standard LOINC Codebook (`src/loinc.ts`)

Standard Logical Observation Identifiers Names and Codes (LOINC) are codified for all vital signs and laboratory diagnostics:

| Biomarker / Vital Sign | LOINC Code | Standard Units | Normal Reference Range |
| :--- | :--- | :--- | :--- |
| **Systolic Blood Pressure** | `8480-6` | `mm[Hg]` | `< 120` |
| **Diastolic Blood Pressure** | `8462-4` | `mm[Hg]` | `< 80` |
| **Heart Rate (Pulse)** | `8867-4` | `/min` | `60 - 100` |
| **Body Temperature** | `8310-5` | `[degF]` | `97.0 - 99.0` |
| **Oxygen Saturation (SpO2)**| `2708-6` | `%` | `95 - 100` |
| **Fasting Blood Glucose** | `2339-0` | `mg/dL` | `70 - 99` |
| **Hemoglobin A1c** | `4548-4` | `%` | `< 5.7` |
| **Total Cholesterol** | `2093-3` | `mg/dL` | `< 200` |
| **Serum Creatinine** | `2160-0` | `mg/dL` | `0.6 - 1.2` |

---

## 5. Dynamic FHIR Questionnaires (`src/questionnaires.ts`)

Dynamic questionnaires render directly from FHIR `Questionnaire` definitions:
1. **Adult Clinical Intake (`Questionnaire/adult-intake`)**: General health history and medications.
2. **AHC HRSN Social Determinants (`Questionnaire/ahc-hrsn-screening`)**: CMS screening for housing, food security, and transportation barriers.

---

## 6. SMART Health Links Digital Passport

SMART Health Links (SHL) enable patients to share cryptographically verified immunizations and laboratory records with external healthcare providers or border authorities with zero reliance on cloud vendor accounts.
