# ClinIQ (Apex-HealthIQ) — Enterprise Healthcare & Virtual Care Platform

ClinIQ is a modern, full-stack, multi-tenant clinical coordination and virtual care management platform. Built as a high-performance TypeScript monorepo, ClinIQ bridges asynchronous patient intake, ambient AI clinical scribing, FHIR R4 interoperability, real-time nurse triage calls, employer healthcare cost deflection analytics, and HIPAA-compliant PHI audit trails.

---

## Table of Contents

- [Monorepo Architecture](#monorepo-architecture)
- [Directory Structure & Module Guide](#directory-structure--module-guide)
  - [`apps/`](#apps)
    - [`apps/web`](#appsweb)
    - [`apps/api-server`](#appsapi-server)
  - [`packages/`](#packages)
    - [`packages/api-spec`](#packagesapi-spec)
    - [`packages/db`](#packagesdb)
    - [`packages/fhir-core`](#packagesfhir-core)
    - [`packages/ui`](#packagesui)
  - [`scripts/`](#scripts)
- [Key Features & Portals](#key-features--portals)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Seed Data & Demo Accounts](#seed-data--demo-accounts)
- [Available Scripts](#available-scripts)
- [Production Build & Deployment](#production-build--deployment)
- [Healthcare & Security Standards](#healthcare--security-standards)

---

## Monorepo Architecture

ClinIQ is organized as a **PNPM Workspace** monorepo using TypeScript strict mode. It decouples UI presentation, API endpoints, database access, FHIR R4 schemas, and API validation contracts into modular, shared packages.

```mermaid
graph TD
  subgraph Apps
    Web["apps/web (Next.js 16 App Router)"]
    API["apps/api-server (Express 5 & WebSockets)"]
  end

  subgraph Packages
    Spec["packages/api-spec (Zod Schemas & Types)"]
    DB["packages/db (Drizzle ORM & Postgres)"]
    FHIR["packages/fhir-core (Medplum & FHIR R4)"]
    UI["packages/ui (Design System & Recharts)"]
  end

  subgraph Scripts
    Seed["scripts (Database Seeder)"]
  end

  Web --> Spec
  Web --> FHIR
  Web --> UI
  
  API --> Spec
  API --> DB
  API --> FHIR

  Seed --> DB
  Seed --> FHIR
```

---

## Directory Structure & Module Guide

```
ClinIQ/
├── apps/
│   ├── api-server/             # Express 5 REST & WebSocket server with AI services
│   └── web/                    # Next.js 16 multi-portal clinical web application
├── packages/
│   ├── api-spec/               # Shared Zod validation schemas and TypeScript contracts
│   ├── db/                     # Drizzle ORM schema, PostgreSQL client & migrations
│   ├── fhir-core/              # FHIR R4 data modeling, Medplum client & LOINC codes
│   └── ui/                     # Shared UI design system, tokens, and data viz charts
├── scripts/
│   └── src/seed.ts             # Comprehensive database seed script with mock data
├── package.json                # Monorepo root package.json
├── pnpm-workspace.yaml         # PNPM workspace definition
├── tsconfig.base.json          # Base TypeScript configuration (strict mode)
└── tsconfig.json               # Root TypeScript project references
```

---

### `apps/`

#### `apps/web`
The main web frontend built on **Next.js 16** (React 19, Tailwind CSS v4, Framer Motion, and Base UI). It houses four role-gated portals:
- **`src/app/(auth)/`**: Multi-tenant authentication and registration views.
- **`src/app/provider/`**: Provider and Triage Nurse workspace:
  - `chart/`: Comprehensive EHR patient chart (conditions, medications, vitals, care gaps, timeline).
  - `dashboard/`: Queue of active and incoming patient care calls with real-time nurse availability toggles.
  - `patients/`: Filterable patient roster with risk stratification tiers (Low, Rising, High).
  - `scribe/`: Ambient AI audio transcription and real-time SOAP note generator.
  - `scribe-review/`: Encounter review, ICD-10/CPT coding confirmation, and digital signing.
  - `fax/`: Digital inbound fax inbox with automated clinical classification and entity parsing.
- **`src/app/patient/`**: Member & Patient portal:
  - `dashboard/`: Personalized health overview, upcoming visits, and active care gaps.
  - `care-call/`: On-demand virtual triage call interface with WebRTC/audio rooms.
  - `intake/`: Digital clinical intake forms (PHQ-9, GAD-7, Asthma Control, SDOH).
  - `records/`: Patient lab readings, medications, immunizations, and biometric trends.
  - `messages/`: Secure provider-patient messaging.
  - `health-links/`: Educational healthcare resources and benefit guides.
- **`src/app/employer/`**: Employer & Benefits Administrator analytics dashboard:
  - `overview/`: Covered lives metrics, population risk distribution, and engagement stats.
  - `savings/`: Financial Event Ledger tracking ER and Urgent Care deflection ROI savings.
  - `care-gaps/`: Population-wide HEDIS quality measure adherence and closed gap metrics.
- **`src/app/admin/`**: Administrative portal:
  - `users/`: User management, tenant association, and role assignments.
  - `audit/`: HIPAA-compliant PHI access trail and audit log explorer.

#### `apps/api-server`
A Node.js backend using **Express 5** and **WebSockets (`ws`)** for real-time telehealth event handling and asynchronous clinical workflows:
- **`src/routes/`**:
  - `auth.ts`: Authentication, JWT issuance, password hashing via bcrypt, and session handling.
  - `calls.ts`: Telehealth call session initiation, nurse dispatch, and status tracking.
  - `scribe.ts`: Ambient scribe audio processing, Anthropic Claude SOAP note synthesis, and encounter signing.
  - `patient.ts`: Patient chart retrieval, intake submission, and vital updates.
  - `provider.ts`: Provider schedules, nurse availability heartbeats, and roster queries.
  - `employer.ts`: Employer population analytics, PMPM calculations, and financial ledger data.
  - `careGaps.ts`: HEDIS care gap identification, tracking, and evidence-based closure.
  - `fax.ts`: Document ingestion, PDF/TIFF handling, and automated entity matching.
  - `audit.ts`: Append-only PHI access trail ingestion and querying.
  - `admin.ts`: Organization setup, role management, and system metrics.
- **`src/lib/`**:
  - `ai/`: Vercel AI SDK integration with centralized TypeScript model routing (`ai.config.ts`), multi-provider support (Anthropic, OpenAI, Google), and cascading fallback resilience for clinical SOAP synthesis and document classification.
  - `ws.ts`: WebSocket server managing live nurse availability broadcasts and incoming call rings.
  - `callRouting.ts`: Nurse routing engine matching available providers by licensure state and load.
  - `logger.ts`: Pino structured logging.
- **`src/middleware/`**:
  - `auth.ts`: JWT authentication and role-based access control (RBAC).
  - `errorHandler.ts`: Centralized error handling and safe production error sanitization.

---

### `packages/`

#### `packages/api-spec`
The single source of truth for validation schemas and TypeScript contracts shared between the frontend and backend using **Zod**:
- `LoginSchema` & `RegisterPatientSchema`
- `InitiateCallSchema` & `AnswerCallSchema`
- `GenerateSoapNoteSchema` & `SignEncounterSchema`
- `IngestFaxSchema`
- `CloseCareGapSchema`
- `AuditLogQuerySchema`

#### `packages/db`
Database layer managing connections, migrations, and table definitions using **Drizzle ORM** and PostgreSQL:
- **Core Entities**: Organizations, Employers, Roles, Users, Providers, Nurse Availability, Patients.
- **Clinical Data**: Conditions, Medications, Allergies, Lab Readings, Care Gaps, Encounters, Maya AI Conversations.
- **Telehealth & Comms**: Call Sessions, Fax Inbox.
- **Financial & Compliance**: Financial Event Ledger (ER/UC deflection savings), Audit Logs (PHI access trail).

#### `packages/fhir-core`
Health data interoperability package integrating **Medplum SDK (`@medplum/core`)** and standard healthcare terminologies:
- `client.ts`: Configured Medplum client factory for FHIR R4 operations.
- `loinc.ts`: Standard LOINC codes for clinical vitals and laboratory biomarkers (e.g., Blood Glucose, HbA1c, BP, BMI).
- `questionnaires.ts`: FHIR-compliant clinical assessments (PHQ-9 Depression, GAD-7 Anxiety, ACT Asthma, PRAPARE SDOH).
- `transform.ts`: Bidirectional transformers between internal Drizzle schemas and FHIR R4 resources (`Patient`, `Encounter`, `Observation`, `Condition`).

#### `packages/ui`
A shared component library built with Tailwind CSS and Radix/Base UI primitives:
- **Components**: `Button`, `Badge`, `Card`, `DataTable`, `BrandLogo`.
- **Visualizations**: `StatCard`, `VitalsChart` (Recharts integration for biometric time series).

---

### `scripts/`

#### `scripts/src/seed.ts`
An end-to-end database seed script that provisions:
- Demo Organization: **Nuvi Health Core** (`nuvi-health`)
- Demo Employer: **Apex Global Tech** (1,250 covered lives)
- Full clinical roster with demo Nurse Elena Rostova and Patient Sarah Johnson
- Pre-populated vitals, lab readings (HbA1c, Fasting Glucose), conditions (Type 2 Diabetes, Hypertension), open HEDIS care gaps, and financial ROI savings records.

---

## Key Features & Portals

1. **Ambient AI Clinical Scribe**
   - Captures patient-nurse dialogues in real-time.
   - Multi-provider AI pipeline (Anthropic Claude, OpenAI, Google Gemini) synthesizes multi-paragraph SOAP notes (Subjective, Objective, Assessment, Plan) with automatic cascading fallback.
   - Generates suggested billing codes (ICD-10 and CPT) for one-click provider sign-off.
2. **On-Demand Triage & Virtual Care Coordination**
   - Inbound call routing based on nurse state licensure, real-time availability, and concurrent capacity.
   - WebSocket notifications for instant call ringing across provider workstations.
3. **Employer ROI & Deflection Ledger**
   - Tracks estimated emergency room avoidance ($1,850/visit baseline) and urgent care redirection ($220/visit baseline).
   - Real-time PMPM billing metrics and total net savings calculations.
4. **Care Gap Closure & HEDIS Management**
   - Identifies open quality measures (e.g., Annual Diabetic Retinal Eye Exam, Colorectal Screening).
   - Provides digital clinical evidence upload and verified closure workflows.
5. **HIPAA PHI Access Trail**
   - Automated audit logging tracking every chart read, lab retrieval, encounter sign-off, or data export.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Language** | TypeScript ~5.9 (Strict Type Safety, no implicit `any`) |
| **Monorepo Tooling** | PNPM Workspaces, `tsc --build` |
| **Frontend Framework** | Next.js 16 (App Router), React 19 |
| **Styling & UI** | Tailwind CSS v4, Base UI, Lucide Icons, Framer Motion |
| **Charts & Data Viz** | Recharts |
| **Backend Framework** | Node.js, Express 5 |
| **Real-Time / Sockets** | WebSockets (`ws`) |
| **Database & ORM** | PostgreSQL, Drizzle ORM, `drizzle-kit` |
| **Healthcare / FHIR** | Medplum SDK (`@medplum/core`, `@medplum/fhirtypes`), FHIR R4, LOINC |
| **AI & LLM Orchestration** | Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`) |
| **Logging & Security** | Pino, Helmet, CORS, JWT, Bcrypt |

---

## Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **PNPM**: `v9.x` or higher (`npm install -g pnpm`)
- **PostgreSQL**: `v14+` running locally or a hosted PostgreSQL instance (e.g., Neon, Supabase, RDS)

---

## Environment Variables

Create `.env` files in your workspace roots as needed. Model selection is centralized in `apps/api-server/src/config/ai.config.ts`, while `.env` holds secrets and credentials:

### Backend (`apps/api-server/.env` or root `.env`)
```bash
# Database Connection
DATABASE_URL="postgres://postgres:postgres@localhost:5432/cliniq"

# Server Port
PORT=8080

# Security & JWT
JWT_SECRET="dev-secret-change-in-production-cliniq-2026"
NODE_ENV="development"
LOG_LEVEL="info"

# AI Integrations (Direct Provider Keys)
ANTHROPIC_API_KEY="sk-ant-api..."
OPENAI_API_KEY="sk-openai-api..."
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."

# Speech Recognition
DEEPGRAM_API_KEY="your-deepgram-api-key"

# Optional FHIR / Medplum Server (Defaults to http://localhost:8103/)
MEDPLUM_BASE_URL="http://localhost:8103/"
MEDPLUM_CLIENT_ID=""
```

### Frontend (`apps/web/.env.local`)
```bash
# API Server URL
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"

# Optional Medplum FHIR Server
NEXT_PUBLIC_MEDPLUM_BASE_URL="http://localhost:8103/"
NEXT_PUBLIC_MEDPLUM_CLIENT_ID=""
```

---

## Getting Started & Local Setup

### 1. Clone & Install Dependencies
```bash
# Install all dependencies across workspace packages
pnpm install
```

### 2. Configure Database & Run Migrations
Ensure PostgreSQL is running and your database exists:
```bash
# Create database (if using local psql)
psql -U postgres -c "CREATE DATABASE cliniq;"
```

### 3. Seed the Database
Populate the database with initial organizations, providers, patients, clinical data, and accounts:
```bash
pnpm seed
```

### 4. Start Development Servers

Run the web application and API server concurrently in separate terminals:

```bash
# Terminal 1: Start Express API & WebSocket Server (Port 8080)
pnpm dev:api

# Terminal 2: Start Next.js 16 Web Application (Port 3000)
pnpm dev:web
```

Once running, visit:
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Healthcheck**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## Seed Data & Demo Accounts

All seed accounts are created with the default password: **`demo123`**

| Role | Email | Portal Access | Description |
| :--- | :--- | :--- | :--- |
| **Patient** | `sarah.johnson@apexhealthiq.demo` | `/patient` | Enrolled member with chronic conditions, lab trends, and intake records. |
| **Triage Nurse / Provider** | `nurse.elena@apexhealthiq.demo` | `/provider` | Clinical coordinator with EHR patient chart, triage queue, ambient scribe, and fax access. |
| **Employer HR Admin** | `hr.admin@apexhealthiq.demo` | `/employer` | Benefits administrator viewing ER deflection ROI and HEDIS quality measures. |
| **System Administrator** | `admin@apexhealthiq.demo` | `/admin` | Enterprise administrator managing users, roles, and HIPAA audit trails. |

---

## Available Scripts

Run these scripts from the repository root:

| Command | Description |
| :--- | :--- |
| `pnpm dev:web` | Starts the Next.js frontend dev server on port `3000`. |
| `pnpm dev:api` | Starts the Express & WebSocket API server in watch mode via `tsx` on port `8080`. |
| `pnpm seed` | Executes `scripts/src/seed.ts` to populate mock clinical & organizational data. |
| `pnpm typecheck` | Runs strict TypeScript type checking across all packages, apps, and scripts. |
| `pnpm typecheck:libs` | Builds TypeScript project references for shared packages (`packages/*`). |
| `pnpm build` | Typechecks and compiles all packages and applications for production. |
| `pnpm test` | Runs test suites across all packages and apps (using Vitest). |

---

## Production Build & Deployment

### 1. Build Verification
Validate that all shared packages and applications compile with zero errors:
```bash
pnpm build
```

### 2. Deploying `apps/web` (Next.js)
The frontend can be deployed to **Vercel**, **AWS Amplify**, **Cloudflare Pages**, or a standalone **Node.js/Docker** server:
- **Environment Variables**: Set `NEXT_PUBLIC_API_BASE_URL` to your production API URL.
- **Node Server**:
  ```bash
  cd apps/web
  pnpm build
  pnpm start -p 3000
  ```

### 3. Deploying `apps/api-server` (Express & WebSockets)
The backend requires a persistent Node.js runtime to maintain active WebSocket connections for live care call triage:
- **Hosting Options**: AWS ECS / Fargate, Google Cloud Run (with WebSocket support enabled), Render, Fly.io, or Railway.
- **Production Execution**:
  ```bash
  cd apps/api-server
  pnpm build
  node dist/index.js
  ```
- **Process Management**: Use `pm2` or containerized deployments (`docker`) to manage auto-restarts and clustering.

### 4. Database Setup
- Provision a production-ready PostgreSQL instance (e.g. Neon, AWS RDS Aurora, GCP Cloud SQL).
- Supply the connection string via `DATABASE_URL` with SSL enabled (`?sslmode=require`).

---

## Healthcare & Security Standards

- **HIPAA Compliance**: Every patient record retrieval, chart update, encounter signature, and document export is written to the immutable `audit_logs` table with actor ID, IP address, and timestamp.
- **FHIR R4 Compliant**: Clinical entities conform to FHIR R4 standards using Medplum SDK and standardized LOINC nomenclature.
- **Strict Role-Based Access Control (RBAC)**: Route-level middleware enforces role validation across `patient`, `nurse`, `provider`, `employer_admin`, and `admin` scopes.
- **Defense in Depth**: Secure HTTP headers enabled via `helmet`, rate limiting on sensitive auth endpoints via `express-rate-limit`, and sanitized error propagation in production environments.
