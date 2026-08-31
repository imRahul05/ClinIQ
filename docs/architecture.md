# System Architecture & Monorepo Topology

ClinIQ is an enterprise-grade virtual care and clinical intelligence platform built upon the **Decoupled Overlay Architecture**. It unifies three healthcare paradigms into a single, high-performance monorepo:

1. **Medplum (FHIR R4 Foundation & Standards Tier)**: Headless HL7 FHIR R4 data repository, SMART on FHIR authorization, standard LOINC biomarker codebook, and dynamic questionnaire engines.
2. **Apex Health IQ (Clinical AI & Operational Intelligence Engine)**: Ambient AI clinical scribe (Deepgram Nova-2 + Vercel AI SDK multi-provider engine with cascading fallback), 3-tier nurse fan-out call routing, AI inbound fax OCR & classification, B2B employer ER deflection savings ledger, and immutable HIPAA PHI audit logging.
3. **FooMedical (Patient Engagement & Digital Health Layer)**: Modern consumer patient portal, CMS/AHC HRSN social determinants screening, longitudinal vital trend visualizers, and SMART Health Links digital health passports.

---

## 1. High-Level System Architecture & Provenance Matrix

ClinIQ achieves zero vendor lock-in and seamless upstream upgradability by separating standards-based healthcare data (FHIR R4) from dynamic operational intelligence (PostgreSQL + Drizzle ORM).

```mermaid
flowchart TB
    %% --- STYLES & COLOR CLASSES ---
    classDef portalStyle fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a,font-weight:bold;
    classDef fhirStyle fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b,font-weight:bold;
    classDef apexStyle fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95,font-weight:bold;
    classDef dbStyle fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#78350f,font-weight:bold;
    classDef aiStyle fill:#ffe4e6,stroke:#e11d48,stroke-width:2px,color:#881337,font-weight:bold;
    classDef glueStyle fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0c4a6e,font-weight:bold;

    %% --- SUBGRAPHS ---
    subgraph UI_TIER ["1. Unified Client Portals (Next.js 16 App Router + Base UI)"]
        P_PORTAL["🧑 Patient Portal<br/>(Vitals, Maya AI, Intake, SMART Links)"]:::portalStyle
        PR_PORTAL["👩‍⚕️ Provider Workspace<br/>(Patient Chart, Scribe, AI Fax Inbox)"]:::portalStyle
        EM_PORTAL["🏢 Employer Analytics<br/>(ER Avoidance Ledger, Care Gaps)"]:::portalStyle
        AD_PORTAL["🛡️ System Admin<br/>(NPI Registry, HIPAA PHI Audits)"]:::portalStyle
    end

    subgraph GLUE_TIER ["2. ClinIQ Unified Monorepo & Gateway Layer"]
        HTTP_CLIENT["Centralized HTTP Client<br/>(apps/web/src/lib/api/http.ts)"]:::glueStyle
        API_GW["Express 5 API Gateway<br/>(apps/api-server: Port 4000)"]:::glueStyle
        WS_GW["WebSockets Realtime Server<br/>(Presence & Signaling)"]:::glueStyle
        API_SPEC["@cliniq/api-spec<br/>(Zod Schemas & Strict Types)"]:::glueStyle
    end

    subgraph MEDPLUM_TIER ["3. Medplum Standards Tier (HL7 FHIR R4)"]
        MED_SDK["@medplum/core & @medplum/react-hooks<br/>(Off-the-shelf NPM packages)"]:::fhirStyle
        FHIR_CORE["@cliniq/fhir-core<br/>(Singleton Client & LOINC Codebook)"]:::fhirStyle
        MED_SERVER["Medplum FHIR R4 Engine<br/>(Self-Hosted Port 8103 / Cloud)"]:::fhirStyle
        FHIR_RESOURCES[("FHIR R4 Resources<br/>• Patient • Observation<br/>• Questionnaire • DocumentReference")]:::fhirStyle
    end

    subgraph APEX_TIER ["4. Apex Health IQ Engine (Operations & AI)"]
        CALL_ROUTER["3-Tier Nurse Call Fan-Out<br/>(Assigned ➔ On-Duty ➔ Pool)"]:::apexStyle
        SCRIBE_ENGINE["Ambient Clinical Scribe<br/>(Live Transcript Buffers)"]:::apexStyle
        FAX_CLASSIFIER["AI Fax Classification OCR<br/>(Document Categorization)"]:::apexStyle
        SAVINGS_LEDGER["ER Deflection ROI Ledger<br/>(PMPM & Value Accounting)"]:::apexStyle
        AUDIT_LOGGER["HIPAA PHI Access Trail<br/>(Immutable Request Audits)"]:::apexStyle
    end

    subgraph AI_SERVICES ["5. Clinical AI & Speech Services"]
        DEEPGRAM["Deepgram Nova-2 WebRTC<br/>(Sub-second Medical STT)"]:::aiStyle
        AI_SDK["Vercel AI SDK Multi-Provider Engine<br/>(Anthropic, OpenAI, Google Gemini)"]:::aiStyle
    end

    subgraph DB_TIER ["6. Relational Persistence (@cliniq/db)"]
        DRIZZLE["Drizzle ORM Client<br/>(Type-Safe Queries & Migrations)"]:::dbStyle
        PG_DB[("PostgreSQL Database<br/>• Multi-Tenant Orgs • Call Sessions<br/>• ER Savings • Audit Logs • Users")]:::dbStyle
    end

    %% --- CONNECTIONS ---
    P_PORTAL & PR_PORTAL & EM_PORTAL & AD_PORTAL --> HTTP_CLIENT
    P_PORTAL & PR_PORTAL --> WS_GW
    HTTP_CLIENT --> API_GW
    API_GW --> API_SPEC

    API_GW --> FHIR_CORE
    FHIR_CORE --> MED_SDK
    MED_SDK --> MED_SERVER
    MED_SERVER --> FHIR_RESOURCES

    API_GW --> CALL_ROUTER & SCRIBE_ENGINE & FAX_CLASSIFIER & SAVINGS_LEDGER & AUDIT_LOGGER
    WS_GW --> CALL_ROUTER & SCRIBE_ENGINE

    SCRIBE_ENGINE --> DEEPGRAM
    SCRIBE_ENGINE & FAX_CLASSIFIER --> AI_SDK
    SCRIBE_ENGINE -.->|"Attested SOAP Note"| FHIR_CORE

    CALL_ROUTER & SAVINGS_LEDGER & AUDIT_LOGGER & API_GW --> DRIZZLE
    DRIZZLE --> PG_DB
```

---

## 2. Where Each Capability Comes From (Provenance Matrix)

ClinIQ intentionally combines battle-tested components from specialized healthcare domains:

| Subsystem / Feature | Source Heritage | Implementation in ClinIQ | Key Files & Modules |
| :--- | :--- | :--- | :--- |
| **HL7 FHIR R4 Engine** | **Medplum** | Standard FHIR R4 REST API, SMART on FHIR tokens, off-the-shelf SDKs. | `packages/fhir-core/src/client.ts`<br/>`packages/fhir-core/src/transform.ts` |
| **LOINC Biomarkers** | **Medplum / HL7** | Codified vital signs (BP, Pulse, SpO2, Blood Glucose, HbA1c, Lipids). | `packages/fhir-core/src/loinc.ts` |
| **FHIR Questionnaires** | **Medplum / FooMedical** | CMS AHC-HRSN screening, adult clinical intake questionnaires. | `packages/fhir-core/src/questionnaires.ts`<br/>`apps/web/src/app/patient/intake/` |
| **SMART Health Links** | **Medplum / SMART** | Cryptographic digital health passport & verifiable immunization cards. | `apps/web/src/app/patient/health-links/` |
| **Ambient AI Scribe** | **Apex Health IQ** | Real-time audio stream transcription, Vercel AI SDK SOAP generation & ICD-10 extraction with cascading fallback. | `apps/api-server/src/routes/scribe.ts`<br/>`apps/api-server/src/lib/ai/scribe.ts`<br/>`apps/web/src/app/provider/scribe/` |
| **3-Tier Nurse Routing** | **Apex Health IQ** | Smart cascade: Assigned primary nurse ➔ On-duty org nurses ➔ Org broadcast pool. | `apps/api-server/src/lib/callRouting.ts`<br/>`apps/api-server/src/routes/calls.ts`<br/>`packages/db/src/schema/index.ts` (`nurse_availability`) |
| **AI Digital Fax Inbox** | **Apex Health IQ** | Inbound document OCR, multi-class triage, patient MRN auto-matching. | `apps/api-server/src/routes/fax.ts`<br/>`apps/web/src/app/provider/fax/` |
| **ER Savings Ledger** | **Apex Health IQ** | Transactional B2B employer ER/Urgent Care deflection accounting & PMPM ROI. | `apps/api-server/src/routes/employer.ts`<br/>`packages/db/src/schema/index.ts` (`financial_event_ledger`) |
| **HIPAA PHI Audit Trail** | **Apex Health IQ** | Immutable logging of actor, IP, patient ID, resource type, and action. | `apps/api-server/src/lib/audit.ts`<br/>`packages/db/src/schema/index.ts` (`audit_logs`) |
| **Modern UI & Portals** | **ClinIQ Monorepo** | Next.js 16 App Router, Base UI primitives, Tailwind CSS v4, unified dark mode. | `apps/web/src/app/`<br/>`packages/ui/` |

---

## 3. End-to-End Runtime Architecture (How the Website Works)

ClinIQ operates as a synchronized distributed application with clear request boundaries and zero direct component-to-database leaks.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as 🧑 Patient (Browser)
    actor Provider as 👩‍⚕️ Clinician (Browser)
    participant NextJS as 🌐 Next.js 16 (apps/web)
    participant HTTP as ⚡ Centralized HTTP Client
    participant Express as 🚀 Express 5 API Server
    participant WS as 🔌 WebSocket Server
    participant FHIR as 🏥 Medplum FHIR Core
    participant DB as 🐘 PostgreSQL (Drizzle)
    participant AI as 🧠 Claude 3.5 & Deepgram

    %% Flow 1: Authentication & Navigation
    Note over Patient,NextJS: 1. User Session & Multi-Tenancy
    Patient->>NextJS: Access /patient/dashboard
    NextJS->>HTTP: fetchPatientOverviewApi()
    HTTP->>Express: GET /api/patient/overview (Bearer JWT)
    Express->>DB: Query Patients, Conditions, Care Gaps (Scoped by OrgId)
    Express->>FHIR: Query Latest LOINC Observations
    Express-->>HTTP: Return Unified JSON Payload
    HTTP-->>NextJS: Hydrate React Query Cache
    NextJS-->>Patient: Render Dashboard with Base UI & Tailwind v4

    %% Flow 2: Virtual Care & 3-Tier Nurse Routing
    Note over Patient,Provider: 2. Real-Time Telehealth & 3-Tier Call Fan-Out
    Patient->>Express: POST /api/calls/initiate { patientId, urgency }
    Express->>DB: Check Assigned Nurse Availability in nurse_availability
    Express->>WS: Broadcast call:incoming event to available nurse socket
    WS-->>Provider: Incoming Call Modal Rings on Clinician Dashboard
    Provider->>Express: POST /api/calls/accept { sessionId }
    Express->>WS: Emit call:connected to Patient and Provider

    %% Flow 3: Ambient Scribe & SOAP Generation
    Note over Provider,AI: 3. Ambient AI Clinical Documentation
    Provider->>WS: Stream WebRTC Audio Chunks
    WS->>AI: Deepgram Nova-2 Streaming STT
    AI-->>WS: Word-by-word Transcript Stream
    WS-->>Provider: Live Transcript Rendered in Scribe Workspace
    Provider->>Express: POST /api/scribe/generate-soap { transcript }
    Express->>AI: Claude 3.5 Sonnet Structured Synthesis Prompt
    AI-->>Express: { SOAP Note, ICD-10 Codes, CPT Codes, Summary }
    Express-->>Provider: Structured Note for Review & Attestation
    Provider->>Express: POST /api/scribe/sign-encounter { note, codes }
    Express->>DB: Store Encounter in encounters table
    Express->>FHIR: Create FHIR R4 DocumentReference & Encounter in Medplum
    Express->>DB: Write Immutable Audit Log in audit_logs
```

### Key Execution Highlights:
1. **Centralized HTTP Gateway**: Components never call `fetch()` directly. All requests pass through `src/lib/api/http.ts`, which injects JWT credentials, enforces tenant isolation headers, and unwraps typed responses.
2. **Dual-Path Data Resolution**:
   - **Clinical FHIR Path**: Standardized health records resolve via `@cliniq/fhir-core` and Medplum.
   - **Operational Relational Path**: High-throughput telemetry, nurse queues, and financial accounting resolve via `@cliniq/db` and Drizzle ORM.
3. **Bi-Directional Telephony**: Real-time nurse status heartbeats and call signaling run over WebSockets (`ws`), executing the 3-tier cascade in under 200ms.

---

## 4. Upstream Upgradability & Maintenance Runbook

A cornerstone of ClinIQ's architecture is **zero vendor lock-in** and **frictionless upstream updates**. Because Medplum packages are consumed as un-forked npm libraries and isolated inside `@cliniq/fhir-core`, you can upgrade Medplum versions without touching core business logic or risking git merge conflicts.

```mermaid
flowchart TD
    %% Upstream Upgrade Workflow
    classDef checkStep fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef actionStep fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b;
    classDef testStep fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef finishStep fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95;

    UPSTREAM["🚀 Upstream Medplum Release<br/>(e.g., @medplum/core v5.2.0)"]:::checkStep
    BUMP_CMD["1. Run Package Update<br/>pnpm update @medplum/* --recursive"]:::actionStep
    TYPECHECK["2. Strict Typecheck Verification<br/>pnpm run typecheck:libs"]:::testStep
    TRANSFORM_CHECK["3. Validate FHIR Transformers<br/>packages/fhir-core/src/transform.ts"]:::testStep
    APP_BUILD["4. Verify App Compilation<br/>pnpm run build"]:::testStep
    GRAPH_UPDATE["5. Update Knowledge Graph<br/>graphify update ."]:::finishStep
    DEPLOY["6. Safe Zero-Downtime Deploy"]:::finishStep

    UPSTREAM --> BUMP_CMD
    BUMP_CMD --> TYPECHECK
    TYPECHECK -->|TypeScript OK| TRANSFORM_CHECK
    TRANSFORM_CHECK -->|No Contract Drift| APP_BUILD
    APP_BUILD -->|Build Clean| GRAPH_UPDATE
    GRAPH_UPDATE --> DEPLOY
```

### Upstream Upgrade Procedure

#### 1. Upgrading Medplum Packages
To bump Medplum packages (`@medplum/core`, `@medplum/fhirtypes`, `@medplum/react-hooks`):
```bash
# Bump Medplum packages across workspace
pnpm update @medplum/core @medplum/fhirtypes @medplum/react-hooks --recursive

# Run strict TypeScript compiler across all packages
pnpm run typecheck
```

#### 2. Why Upgrades Never Break Business Logic
- **No Forked Medplum Code**: ClinIQ consumes `@medplum/*` exclusively via standard npm imports.
- **Isolating Adapters**: All FHIR type mappings and formatters live in `packages/fhir-core/src/transform.ts`. If Medplum adds or refines FHIR fields, updates are made in this single adapter file.
- **Relational Independence**: PostgreSQL operational tables (`packages/db/src/schema/index.ts`) operate completely independently of FHIR server versioning.

#### 3. Database Schema Evolutions (Drizzle ORM)
When extending operational models (e.g. adding new telehealth telemetry or employer billing fields):
```bash
# 1. Edit schema in packages/db/src/schema/index.ts
# 2. Push directly to development database
pnpm --filter @cliniq/db db:push

# 3. Or generate versioned migration SQL for production
pnpm --filter @cliniq/db db:generate
```

#### 4. Updating Clinical AI Models & Prompts
All LLM prompts for SOAP generation, ICD-10 extraction, and Fax OCR classification are centralized in `apps/api-server/src/lib/ai.ts`. Model upgrades (e.g. Claude 3.5 Sonnet to future iterations) are accomplished simply by updating the model parameter in `ai.ts` without modifying API contracts or UI components.

---

## 5. Scalability & Enterprise Deployment Blueprint

ClinIQ is engineered to scale horizontally across multi-region health systems and high-volume employer groups:

```mermaid
flowchart LR
    %% Scalability Architecture
    classDef edgeStyle fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef clusterStyle fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b;
    classDef dataStyle fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#78350f;

    subgraph EDGE ["1. Edge & Client Tier"]
        CDN["Global CDN / Cloudflare"]:::edgeStyle
        WEB_NODES["Next.js 16 Web Cluster<br/>(Stateless SSR/Client Nodes)"]:::edgeStyle
    end

    subgraph API_CLUSTER ["2. API & Real-Time Tier"]
        LB["Load Balancer (Round-Robin / IP-Hash)"]:::clusterStyle
        API_1["Express 5 API Node 1"]:::clusterStyle
        API_2["Express 5 API Node 2"]:::clusterStyle
        REDIS_BUS[("Redis Pub/Sub Bus<br/>(WebSocket Fan-Out Sync)")]:::clusterStyle
    end

    subgraph STORAGE_CLUSTER ["3. High-Availability Persistence"]
        PG_PRIMARY[("PostgreSQL Primary<br/>(Writes & Drizzle ORM)")]:::dataStyle
        PG_REPLICA[("PostgreSQL Read Replica<br/>(High-Volume Reporting)")]:::dataStyle
        MED_PODS["Self-Hosted Medplum Server Cluster<br/>(Port 8103)"]:::dataStyle
    end

    CDN --> WEB_NODES
    WEB_NODES --> LB
    LB --> API_1 & API_2
    API_1 & API_2 <--> REDIS_BUS
    API_1 & API_2 --> PG_PRIMARY
    API_1 & API_2 -.->|"Read Queries"| PG_REPLICA
    API_1 & API_2 --> MED_PODS
    MED_PODS --> PG_PRIMARY
```

### Scalability Principles:
1. **Stateless API Tier**: Express 5 nodes store zero session state in-memory; authentication is verified via cryptographically signed JWTs.
2. **Distributed WebSockets via Redis Pub/Sub**: When scaling out API instances, nurse presence and incoming call broadcasts are synchronized across all nodes using Redis Pub/Sub.
3. **Database Connection Pooling**: Drizzle ORM utilizes connection pooling with PostgreSQL (compatible with PgBouncer or Neon Serverless scale-to-zero compute).
4. **Self-Hosted FHIR Clustering**: Medplum servers run in lightweight Docker containers behind standard load balancers, storing FHIR resources in dedicated partitioned tables.

---

## 6. Technology Stack Matrix

| Layer | Technology | Rationale & Responsibility |
| :--- | :--- | :--- |
| **Web Framework** | Next.js 16 (`next@16.3.3`) | App Router, React 19 Server/Client Components, Turbopack builds. |
| **UI Primitives** | Base UI (`@base-ui-components/react`) | Unstyled, accessible, zero-Radix DOM primitives for clinical workflows. |
| **Design System** | Tailwind CSS v4 (`@tailwindcss/postcss`) | CSS design tokens with specialized clinical Navy, Blue, Emerald, and Gold palette. |
| **Data Fetching** | TanStack React Query (`@tanstack/react-query`) | Automatic request deduplication, background caching, and optimistic mutations. |
| **API Server** | Express 5 & Node.js (`node@22`) | High-throughput REST API with native async error handling. |
| **Realtime Engine** | `ws` WebSocket Server | Sub-100ms nurse presence tracking, call signaling, and streaming audio buffers. |
| **Speech-to-Text** | Deepgram Nova-2 WebRTC | Sub-second medical terminology transcription. |
| **Clinical AI** | Anthropic Claude 3.5 Sonnet | Structured SOAP clinical synthesis, ICD-10 & CPT extraction, Fax OCR. |
| **Database & ORM** | PostgreSQL & Drizzle ORM | Type-safe, low-latency relational data management and migrations. |
| **FHIR Standard** | HL7 FHIR R4 & Medplum SDK | Standards-compliant healthcare data interoperability without cloud lock-in. |
| **Knowledge Graph**| Graphify AST Engine | Automated codebase topology indexing and dependency visualization. |

