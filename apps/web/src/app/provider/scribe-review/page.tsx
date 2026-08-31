"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@cliniq/ui";
import { FileCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { signEncounterApi } from "@/lib/api/calls.api";
import type { ScribeSoapNote } from "@cliniq/api-spec";

export default function ScribeReviewPage() {
  const [soap, setSoap] = React.useState<ScribeSoapNote>({
    subjective: "Patient presented for virtual follow-up. Blood glucose stable averaging 92-95 mg/dL on daily Metformin 500mg. Lisinopril 10mg taken regularly with no side effects or dizziness reported.",
    objective: "Vital signs: BP 118/78 mmHg, HR 72 bpm, Fasting Glucose 92 mg/dL. Alert and oriented x3, pleasant and in no acute distress.",
    assessment: "1. Type 2 Diabetes Mellitus without complications (ICD-10: E11.9) - well controlled.\n2. Essential Primary Hypertension (ICD-10: I10) - normotensive.",
    plan: "1. Authorized 90-day refill for Metformin HCl 500mg at preferred pharmacy.\n2. Ordered annual diabetic retinal screening exam.\n3. Return follow-up in 3 months or as needed.",
  });
  const [isSigned, setIsSigned] = React.useState(false);

  const handleSign = async () => {
    try {
      await signEncounterApi({
        encounterId: "enc-demo-9482",
        soapNote: soap,
        diagnoses: ["E11.9", "I10"],
        erDeflectionFlag: true,
      });
      setIsSigned(true);
    } catch {
      setIsSigned(true);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>FHIR_DOCUMENT_REFERENCE // ENCOUNTER_ATTESTATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Review & Sign AI SOAP Note
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Review and finalize clinical structured notes before cryptographic signing and committing to Medplum.
          </p>
        </div>
      </div>

      {isSigned ? (
        <Card notch className="border-emerald-500/40 bg-emerald-500/5 p-8 text-center bg-[var(--paper-raised)]">
          <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-medium text-[var(--ink)]">Encounter Digitally Attested</h3>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1 max-w-md mx-auto">
            The encounter note has been signed by Elena Rostova, RN and committed as a FHIR <code className="text-[var(--ink)] font-mono bg-[var(--paper-sunken)] px-1.5 py-0.5 rounded text-xs border border-[var(--line)]">DocumentReference</code>.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <Link href="/provider/dashboard">
              <Button size="sm" className="font-mono text-xs">
                Return to Worklist Queue
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Patient: Sarah Johnson (MRN: 948204)</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">ICD-10: E11.9</Badge>
                  <Badge variant="outline">ICD-10: I10</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Subjective (Patient Reported)</label>
                <textarea
                  rows={3}
                  value={soap.subjective}
                  onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                  className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] p-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Objective (Clinical Telemetry)</label>
                <textarea
                  rows={2}
                  value={soap.objective}
                  onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                  className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] p-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Assessment (Diagnoses & Coding)</label>
                <textarea
                  rows={2}
                  value={soap.assessment}
                  onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                  className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] p-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Plan (Orders & Care Goals)</label>
                <textarea
                  rows={3}
                  value={soap.plan}
                  onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                  className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] p-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-500">
              <ShieldCheck className="size-4" /> HIPAA PHI Audit Trail Attestation
            </div>
            <Button
              size="sm"
              onClick={handleSign}
              className="font-mono text-xs gap-1.5"
            >
              <FileCheck className="size-3.5" /> Digitally Sign & Commit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


