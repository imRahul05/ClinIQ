# ClinIQ Documentation Suite

Welcome to the official developer and architecture documentation for **ClinIQ**, an enterprise-grade, intelligent healthcare platform uniting **Medplum FHIR R4**, **FooMedical** self-service patient workflows, and **Apex Health IQ** ambient clinical AI into a unified, modular monorepo.

---

## 📚 Documentation Index

| Guide | Description |
| :--- | :--- |
| [**Architecture Overview**](./architecture.md) | High-level system topology, Decoupled Overlay Architecture, and package breakdown. |
| [**Architecture FAQ & Extensibility**](./architecture-faq-and-extensibility.md) | 3-tier routing mechanics, WebSockets to Postgres link, swappable AI/STT adapters, and RCM. |
| [**Frontend Guide (`apps/web`)**](./frontend.md) | Next.js 16 App Router, Base UI, Tailwind CSS v4, centralized HTTP client, and portal layouts. |
| [**Backend & Real-Time Engine (`apps/api-server`)**](./backend.md) | Express 5, WebSockets, 3-tier nurse call routing, Deepgram STT, and Vercel AI SDK multi-provider clinical scribe with cascading fallbacks. |
| [**Database & Schemas (`packages/db`)**](./database.md) | PostgreSQL, Drizzle ORM, tenancy models, telephony buffers, ER avoidance ledgers, and audit logs. |
| [**FHIR R4 & Medplum Integration (`packages/fhir-core`)**](./fhir-medplum.md) | Upstream Medplum client SDK, LOINC clinical codes, questionnaires, and SMART Health Links. |
| [**Multi-Tenancy & Access Control (RBAC)**](./multi-tenancy-and-rbac.md) | Organization & Employer dual tenancy, role matrix, permission checking, and how to customize auth. |
| [**Graph-Based Knowledge System (Graphify)**](./knowledge-graph-graphify.md) | Codebase knowledge graph, AST semantic indexing at `graphify-out/`, and relationship exploration. |
| [**Extending the Platform (Developer Guide)**](./extending-the-platform.md) | Step-by-step tutorials for adding new portals, API routes, FHIR resources, and AI tools. |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` (v9 or v10)
- **Database**: PostgreSQL (v15+) or Neon Serverless Postgres
- **FHIR Server**: Medplum Cloud or self-hosted Medplum instance

### 2. Installation & Build
```bash
# Clone and enter directory
cd ClinIQ

# Install all workspace dependencies
pnpm install

# Run strict TypeScript typechecks across all 8 packages
pnpm run typecheck

# Build the Next.js 16 web application
pnpm run build
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in `apps/api-server` and `apps/web` (Model configurations are managed in `apps/api-server/src/config/ai.config.ts`):
```env
# Database & Secrets
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cliniq
JWT_SECRET=super-secret-jwt-key-change-in-production

# Medplum FHIR Server
MEDPLUM_BASE_URL=https://api.medplum.com/
MEDPLUM_CLIENT_ID=your-medplum-client-id

# AI & Speech Direct Provider Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-openai-api...
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
DEEPGRAM_API_KEY=your-deepgram-api-key
```

### 4. Running Locally
```bash
# Seed demo data (organizations, employers, providers, patients, vitals)
pnpm run seed

# Run Next.js 16 web application (port 3000)
pnpm --filter @cliniq/web dev

# Run Express 5 API server & WebSockets (port 4000)
pnpm --filter @cliniq/api-server dev
```
