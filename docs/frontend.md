# Frontend Application Guide (`apps/web`)

The ClinIQ web application is built with **Next.js 16 (`next@16.3.3`)**, **Base UI (`@base-ui-components/react`)**, and **Tailwind CSS v4**, delivering responsive user experiences across mobile and desktop.

---

## 1. Directory Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── signin/page.tsx         # 1-click role-based demo sign-in
│   │   ├── patient/                    # Patient self-service portal
│   │   │   ├── layout.tsx              # Mobile bottom navigation & desktop sidebar
│   │   │   ├── dashboard/page.tsx      # OHS score, vitals summary, care gaps
│   │   │   ├── intake/page.tsx         # Dynamic FHIR questionnaire renderer
│   │   │   ├── records/page.tsx        # LOINC vitals time-series & lab records
│   │   │   ├── appointments/page.tsx   # FHIR $find / $hold slot scheduling
│   │   │   ├── messages/page.tsx       # Encrypted care team messaging
│   │   │   ├── care-call/page.tsx      # Telehealth video room & Maya AI companion
│   │   │   └── health-links/page.tsx   # SMART Health Links QR passport generator
│   │   ├── provider/                   # Clinical staff & nurse workspace
│   │   │   ├── layout.tsx              # On-duty presence toggle & navigation
│   │   │   ├── dashboard/page.tsx      # Triage queue & panel worklist
│   │   │   ├── patients/page.tsx       # Searchable patient roster
│   │   │   ├── chart/[id]/page.tsx     # Dual-column longitudinal patient chart
│   │   │   ├── scribe/page.tsx         # Live Ambient AI Scribe workspace
│   │   │   ├── scribe-review/page.tsx  # Claude SOAP note review & digital signature
│   │   │   └── fax/page.tsx            # AI Fax inbox & entity classification
│   │   ├── employer/                   # B2B employer analytics
│   │   │   ├── layout.tsx              # Employer portal navigation
│   │   │   ├── overview/page.tsx       # Population risk tiering & OHS stratification
│   │   │   ├── savings/page.tsx        # ER avoidance savings ledger
│   │   │   └── care-gaps/page.tsx      # HEDIS quality measure reporting
│   │   ├── admin/                      # System administration & compliance
│   │   │   ├── layout.tsx              # Admin navigation
│   │   │   ├── users/page.tsx          # Staff management & NPI verification
│   │   │   └── audit/page.tsx          # Searchable HIPAA PHI Audit Trail
│   │   ├── globals.css                 # Tailwind CSS v4 directives & color tokens
│   │   ├── layout.tsx                  # Root layout with QueryClient & MedplumProvider
│   │   └── page.tsx                    # Interactive landing & system overview
│   ├── components/
│   │   └── providers/
│   │       └── AppProviders.tsx        # Medplum, React Query, and Base UI context
│   └── lib/
│       ├── api/
│       │   ├── http.ts                 # Centralized HTTP client (fetch wrapper)
│       │   ├── auth.api.ts             # Authentication API client
│       │   ├── patient.api.ts          # Patient data API client
│       │   ├── provider.api.ts         # Provider workspace API client
│       │   ├── calls.api.ts            # Scribe, Telehealth & Maya AI API client
│       │   ├── employer.api.ts         # Employer metrics API client
│       │   └── admin.api.ts            # User & Audit API client
│       ├── medplum.ts                  # Medplum client hook bindings
│       └── utils.ts                    # Classname merging utilities (`cn`)
```

---

## 2. Component System: Base UI + Tailwind v4

ClinIQ uses **Base UI** (`@base-ui-components/react`) as its unstyled accessible primitive foundation, styled with **Tailwind CSS v4** and `@cliniq/ui`:

- **Zero Radix Dependencies**: High-performance, lightweight DOM structures.
- **Strict Accessibility (WCAG AAA)**: Full keyboard navigation, ARIA roles, and focus traps.
- **Shared Tokens**: Palette standardized on deep Navy (`#030712`, `#0f172a`), Clinical Blue (`#2563eb`), Gold (`#f59e0b`), and Emerald (`#10b981`).

---

## 3. Centralized Axios HTTP Client Pattern

Direct `fetch` calls in components are strictly forbidden. All communication routes through `apps/web/src/lib/api/http.ts` using a hardened **Axios** instance with interceptors:

```typescript
import { http } from "@/lib/api/http";
import type { LabsResponse } from "@cliniq/api-spec";

export async function fetchPatientLabsApi(patientId: string): Promise<LabsResponse> {
  return http.get<LabsResponse>(`/api/patient/labs-and-vitals?patientId=${patientId}`);
}
```

### Key Features:
- **Automatic Token Interceptor**: Automatically attaches the active Medplum SMART-on-FHIR Bearer token (`medplum.getAccessToken()`) to every outgoing request.
- **Normalized Error Handling**: Automatically transforms HTTP 4xx/5xx and network errors into strongly-typed `ApiError` instances.
- **Canonical Monorepo Schemas**: All API modules and UI components import response models directly from `@cliniq/api-spec` rather than defining ad-hoc local interfaces.
- **Strict Type Safety**: Zero `any` and zero `unknown` types across all API functions.

---

## 4. State Management Strategy

- **Server Cache**: TanStack React Query (`@tanstack/react-query`) handles query caching, background refetching, and mutation invalidation.
- **FHIR Resource & Auth State**: `@medplum/react-hooks` (`useMedplum`, `useResource`, `useSearch`) for reactive authentication, profile context, and direct FHIR standard operations.
- **Realtime State**: Native WebSockets for incoming call notifications and live audio transcript streaming.
