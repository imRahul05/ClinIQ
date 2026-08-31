# Backend & Real-Time Engine Guide (`apps/api-server`)

The ClinIQ API server is built with **Express 5**, **Node.js 22**, **WebSockets**, **Deepgram STT**, and **Vercel AI SDK** (Anthropic Claude, OpenAI, and Google Gemini with cascading fallback), providing clinical intelligence, 3-tier telephony routing, and HIPAA compliance.

---

## 1. Directory Structure

```
apps/api-server/
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod environment validation & runtime secrets
│   │   ├── ai.config.ts        # Centralized model registry & task routing
│   │   └── index.ts            # Configuration barrel export
│   ├── lib/
│   │   ├── logger.ts           # Structured Pino JSON logging
│   │   ├── audit.ts            # Immutable HIPAA PHI access logger
│   │   ├── ws.ts               # WebSocket presence & signaling engine
│   │   ├── callRouting.ts      # 3-tier nurse fan-out routing algorithm
│   │   └── ai/                 # Vercel AI SDK multi-provider integration
│   │       ├── client.ts       # Direct provider client resolvers
│   │       ├── scribe.ts       # Clinical SOAP note generator with cascading fallback
│   │       └── fax.ts          # Document classification & OCR entity parsing
│   ├── middleware/
│   │   ├── auth.ts             # Medplum JWKS RS256 verification, FHIR profile mapping & org scoping
│   │   └── errorHandler.ts     # Global Express 5 async error handling
│   ├── routes/
│   │   ├── auth.ts             # Medplum OAuth exchange (/api/auth/exchange) & identity (/api/auth/me)
│   │   ├── calls.ts            # Call session initiation & WebSockets signaling
│   │   ├── scribe.ts           # Ambient transcription & SOAP note signing
│   │   ├── patient.ts          # Longitudinal records & vitals API
│   │   ├── provider.ts         # Clinical worklist & patient panel API
│   │   ├── employer.ts         # Population health & ER savings ledger API
│   │   ├── careGaps.ts         # HEDIS quality measure tracking
│   │   ├── fax.ts              # Inbound fax OCR & document classification
│   │   ├── audit.ts            # Searchable HIPAA PHI audit trail API
│   │   ├── admin.ts            # User provisioning & NPI registry check
│   │   └── index.ts            # Central router registry
│   ├── app.ts                  # Express application setup, CORS, and middleware
│   └── index.ts                # HTTP & WebSocket server bootstrap
```

---

## 2. 3-Tier Smart Call Routing Algorithm

When a patient initiates a virtual care consultation, the call router in `src/lib/callRouting.ts` executes a 3-tier cascade:

```
  Patient clicks "Connect with Care Team"
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │ Tier 1: Assigned Primary Nurse      │ ──► Nurse is Available? ──► Ring Assigned Nurse
  └──────────────────┬──────────────────┘               │
                     │ (Nurse offline/busy)             ▼
                     ▼                               (No response in 15s)
  ┌─────────────────────────────────────┐               │
  │ Tier 2: Active On-Duty Nurses       │ ◄─────────────┘
  │ (Filtered by Tenant Organization)   │ ──► On-duty staff online? ──► Fan-Out Ring
  └──────────────────┬──────────────────┘               │
                     │ (All busy)                       ▼
                     ▼                               (No response in 20s)
  ┌─────────────────────────────────────┐               │
  │ Tier 3: Broadcast Tenant Pool       │ ◄─────────────┘
  │ (All licensed clinicians in org)    │ ──► Emergency Broadcast & Queue Callback
  └─────────────────────────────────────┘
```

> [!TIP]
> For a detailed sequence diagram and code-level breakdown of how `callRouting.ts` intersects PostgreSQL `nurse_availability` with real-time WebSocket connection state, see [**Architecture FAQ: 3-Tier Call Routing & WebSockets**](./architecture-faq-and-extensibility.md#1-core-deep-dive-3-tier-call-routing--real-time-websockets).

---

## 3. Ambient AI Scribe Workflow

```
 ┌──────────────┐     WebRTC Audio Chunk     ┌──────────────────┐
 │  Clinician / ├───────────────────────────►│  Deepgram Nova 2 │
 │ Patient Call │                            │  (Medical STT)   │
 │              │                            └─────────┬────────┘
 └──────────────┘                                      │ Live Word Stream
                                                       ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     WebSocket Audio Buffer                   │
 └──────────────────────────────┬───────────────────────────────┘
                                │ On "Generate SOAP" Trigger
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │    Vercel AI SDK Multi-Provider Cascade (generateObject)     │
 │  • Primary: Anthropic (Claude Sonnet)                        │
 │  • Fallback 1: OpenAI (GPT-5.6 / GPT-4o)                     │
 │  • Fallback 2: Google Gemini (3.7 Flash)                     │
 │  • Subjective, Objective, Assessment, Plan (SOAP) Extraction │
 │  • Suggested ICD-10 Diagnosis Codes & Encounter Summary      │
 └──────────────────────────────┬───────────────────────────────┘
                                │ Clinician Review & Attestation
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │         FHIR R4 DocumentReference Created in Medplum         │
 └──────────────────────────────────────────────────────────────┘
```

---

## 4. Inbound AI Fax Classification

The Fax processing pipeline in `src/lib/ai/fax.ts` receives inbound digital faxes, extracts text via OCR, and invokes the configured AI model (with cascading fallback to OpenAI/Anthropic and deterministic rules):
1. **Document Classification**: Identifies if the fax is a `Discharge Summary`, `Lab Requisition`, `Specialist Referral`, `Prescription Referral`, or `General Clinical Document`.
2. **Entity Extraction**: Extracts patient details, MRN, provider, and diagnostic indications.
3. **Patient Matching**: Matches extracted identifiers against the tenant's patient database.
4. **Task Routing**: Routes the document into the responsible care coordinator's inbox.

