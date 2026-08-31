# Extending the Platform (Developer Cookbook)

This guide provides practical, step-by-step instructions for common extension scenarios in ClinIQ.

---

## 1. Adding a New FHIR Resource Workflow

### Scenario: Add FHIR `AllergyIntolerance` Support
1. **Import Types**: In `@cliniq/fhir-core`, import `AllergyIntolerance` from `@medplum/fhirtypes`.
2. **Create Converter / Helper**: In `packages/fhir-core/src/transform.ts`:
   ```typescript
   import type { AllergyIntolerance } from "@medplum/fhirtypes";

   export interface FormattedAllergy {
     id: string;
     substance: string;
     criticality: string;
     recordedDate?: string;
   }

   export function formatAllergy(allergy: AllergyIntolerance): FormattedAllergy {
     return {
       id: allergy.id || "",
       substance: allergy.code?.text || allergy.code?.coding?.[0]?.display || "Unknown",
       criticality: allergy.criticality || "low",
       recordedDate: allergy.recordedDate,
     };
   }
   ```
3. **Add API Module**: In `apps/web/src/lib/api/patient.api.ts`:
   ```typescript
   export async function fetchPatientAllergiesApi(patientId: string) {
     return httpClient.get(`/api/patient/${patientId}/allergies`);
   }
   ```
4. **Render in UI**: In `apps/web/src/app/patient/records/page.tsx` or `apps/web/src/app/provider/chart/[id]/page.tsx`, use standard `@cliniq/ui` components (`DataTable`, `Badge`, `Card`).

---

## 2. Adding a New API Endpoint

### Scenario: Create a Custom Prior Authorization Route
1. **Define Contract in `@cliniq/api-spec`**:
   In `packages/api-spec/src/schemas.ts`:
   ```typescript
   export const PriorAuthRequestSchema = z.object({
     patientId: z.string().uuid(),
     procedureCode: z.string(),
     diagnosisCode: z.string(),
     clinicalRationale: z.string(),
   });
   export type PriorAuthRequest = z.infer<typeof PriorAuthRequestSchema>;
   ```
2. **Implement Endpoint in `apps/api-server`**:
   In `apps/api-server/src/routes/priorAuth.ts`:
   ```typescript
   import { Router } from "express";
   import { requireAuth, requireRole, requireOrgTenancy } from "../middleware/auth";
   import { PriorAuthRequestSchema } from "@cliniq/api-spec";

   export const priorAuthRouter = Router();

   priorAuthRouter.post(
     "/submit",
     requireAuth,
     requireRole(["nurse", "physician"]),
     requireOrgTenancy,
     async (req, res) => {
       const body = PriorAuthRequestSchema.parse(req.body);
       // Business logic
       res.json({ success: true, authorizationNumber: "PA-92810" });
     }
   );
   ```
3. **Register Router in `apps/api-server/src/routes/index.ts`**:
   ```typescript
   apiRouter.use("/prior-auth", priorAuthRouter);
   ```

---

## 3. Adding a New Web Portal Page

### Scenario: Add a Care Plans Page to Patient Portal
1. **Create Page**: Add `apps/web/src/app/patient/care-plans/page.tsx`:
   ```tsx
   "use client";

   import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@cliniq/ui";
   import { Target, CheckCircle2 } from "lucide-react";

   export default function CarePlansPage() {
     return (
       <div className="space-y-6">
         <div>
           <h1 className="text-2xl font-bold text-white">Your Active Care Plans</h1>
           <p className="text-sm text-slate-400">Personalized goals established with your care team.</p>
         </div>
         <Card className="border-slate-800 bg-slate-900 text-slate-100">
           <CardHeader>
             <CardTitle className="text-base text-white flex items-center gap-2">
               <Target className="w-4 h-4 text-blue-400" /> Hypertension Management Plan
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-2 text-xs">
             <p>Goal: Maintain systolic blood pressure below 120 mmHg.</p>
             <Badge variant="success">On Track</Badge>
           </CardContent>
         </Card>
       </div>
     );
   }
   ```
2. **Add to Navigation**: Update `NAV_ITEMS` in `apps/web/src/app/patient/layout.tsx`:
   ```typescript
   { href: "/patient/care-plans", label: "Care Plans", icon: Target },
   ```

---

## 4. Adding or Swapping Third-Party Services (AI, STT, OCR, RCM)

ClinIQ enforces the **Pluggable Adapter Pattern** for all external speech, AI, document parsing, and billing vendors:
- **Speech-to-Text**: Swap Deepgram with OpenAI Whisper or AWS Transcribe Medical.
- **Clinical Intelligence**: Configure primary & fallback models across Anthropic (Claude Opus/Sonnet), OpenAI (GPT-5.6 Sol/Terra, GPT-4o), and Google (Gemini 3.7 Flash/Pro) by editing `apps/api-server/src/config/ai.config.ts` using the Vercel AI SDK.
- **Document Parsing**: Plug in LlamaParse or AWS Textract for complex fax tables.
- **RCM & Billing**: Integrate Stedi Healthcare or Change Healthcare for automated EDI 837/835 claim cycles.

> [!TIP]
> For complete TypeScript interfaces, architectural diagrams, and step-by-step code recipes, consult the [**Architecture FAQ & Extensibility Blueprint**](./architecture-faq-and-extensibility.md#3-pluggable-adapter-pattern--multi-vendor-extensibility).

---

## 5. Verification Checklist Before Committing

Always run this three-step verification before submitting any pull request:
```bash
# 1. Typecheck all packages
pnpm run typecheck

# 2. Production build verification
pnpm run build

# 3. Update the knowledge graph
graphify update .
```

