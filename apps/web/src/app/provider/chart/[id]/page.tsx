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
  VitalsChart,
} from "@cliniq/ui";
import {
  Activity,
  AlertTriangle,
  FileText,
  Mic,
  Video,
} from "lucide-react";

export default function PatientChartPage() {
  const [tab, setTab] = React.useState<"encounters" | "vitals" | "gaps" | "meds">("encounters");

  return (
    <div className="space-y-6">
      {/* Top Patient Banner */}
      <div className="rounded border border-[var(--line)] bg-[var(--paper-raised)] p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-lg">
              SJ
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-medium text-[var(--ink)]">Sarah Johnson</h1>
                <Badge variant="success" dot>PROVEN NORMOTENSIVE (OHS: 82)</Badge>
              </div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
                MRN: <span className="text-[var(--ink)]">948204</span> · DOB: 1988-04-12 (38yo F) · Group: <span className="text-[var(--ink)]">Apex Global Tech</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/provider/scribe">
              <Button size="sm" className="font-mono text-xs gap-1.5">
                <Mic className="size-3.5" /> Start Live Scribe
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5">
              <Video className="size-3.5" /> Direct Call
            </Button>
          </div>
        </div>
      </div>

      {/* Dual-Column Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Clinical Summary & Allergies/Conditions */}
        <div className="space-y-6">
          {/* Active Diagnoses & ICD-10 */}
          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Active Conditions (ICD-10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono pt-4">
              <div className="flex items-center justify-between p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
                <span className="font-medium text-[var(--ink)]">Type 2 Diabetes Mellitus</span>
                <Badge variant="outline">E11.9</Badge>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
                <span className="font-medium text-[var(--ink)]">Essential Hypertension</span>
                <Badge variant="outline">I10</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Active Prescriptions */}
          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Active Regimens (RxNorm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono pt-4">
              <div className="p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
                <p className="font-semibold text-[var(--ink)]">Metformin HCl 500mg</p>
                <p className="text-[11px] text-[var(--ink-faint)]">Oral Tablet · Twice daily with meals</p>
              </div>
              <div className="p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
                <p className="font-semibold text-[var(--ink)]">Lisinopril 10mg</p>
                <p className="text-[11px] text-[var(--ink-faint)]">Oral Tablet · Once daily</p>
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Allergies & Contraindications</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono pt-4">
              <div className="flex items-center justify-between p-2.5 rounded border border-rose-500/30 bg-rose-500/5 text-rose-400">
                <span className="font-medium">Penicillin (Severe Hives)</span>
                <Badge variant="destructive">Severe</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 Cols): Tabbed Longitudinal Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 border-b border-[var(--line)] pb-3">
            <Button
              variant={tab === "encounters" ? "default" : "ghost"}
              size="sm"
              className="font-mono text-xs"
              onClick={() => setTab("encounters")}
            >
              <FileText className="size-3.5 mr-1.5" /> Encounter Timeline
            </Button>
            <Button
              variant={tab === "vitals" ? "default" : "ghost"}
              size="sm"
              className="font-mono text-xs"
              onClick={() => setTab("vitals")}
            >
              <Activity className="size-3.5 mr-1.5" /> Vitals LOINC
            </Button>
            <Button
              variant={tab === "gaps" ? "default" : "ghost"}
              size="sm"
              className="font-mono text-xs"
              onClick={() => setTab("gaps")}
            >
              <AlertTriangle className="size-3.5 mr-1.5" /> HEDIS Invariants
            </Button>
          </div>

          {/* Tab 1: Encounters */}
          {tab === "encounters" && (
            <div className="space-y-4">
              <Card notch className="p-5 bg-[var(--paper-raised)]">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-3">
                  <div>
                    <h4 className="font-semibold text-[var(--ink)] text-base">Virtual Telemedicine Encounter</h4>
                    <p className="font-mono text-xs text-[var(--ink-muted)]">Aug 15, 2026 · Attested by Elena Rostova, RN</p>
                  </div>
                  <Badge variant="success" dot>PROVEN & COMMITTED</Badge>
                </div>
                <div className="space-y-2 text-xs font-mono text-[var(--ink-muted)] leading-relaxed">
                  <p><strong className="text-[var(--ink)]">Subjective:</strong> Patient presented for routine quarterly follow-up for Type 2 Diabetes and Hypertension. Adherence to diet and oral medication verified.</p>
                  <p><strong className="text-[var(--ink)]">Objective:</strong> BP 118/78 mmHg, Fasting Glucose 92 mg/dL, HbA1c 5.4%.</p>
                  <p><strong className="text-[var(--ink)]">Assessment:</strong> Well-controlled T2D and Hypertension. No acute clinical invariant violations.</p>
                  <p><strong className="text-[var(--ink)]">Plan:</strong> Maintain current medication regimen. Dispatched annual diabetic retinal screening order.</p>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 2: Vitals */}
          {tab === "vitals" && (
            <VitalsChart
              title="Systolic / Diastolic Trend (LOINC 85354-9)"
              metricType="blood-pressure"
              data={[
                { date: "May 10", systolic: 128, diastolic: 82 },
                { date: "Jun 14", systolic: 124, diastolic: 80 },
                { date: "Jul 22", systolic: 120, diastolic: 79 },
                { date: "Aug 08", systolic: 118, diastolic: 78 },
                { date: "Aug 29", systolic: 116, diastolic: 76 },
              ]}
            />
          )}

          {/* Tab 3: Care Gaps */}
          {tab === "gaps" && (
            <Card notch className="p-4 bg-[var(--paper-raised)] border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[var(--ink)] text-sm">Annual Diabetic Retinal Eye Exam</h4>
                  <p className="font-mono text-xs text-[var(--ink-muted)]">HEDIS Code: CDC-E · Due before Q3</p>
                </div>
                <Badge variant="warning" dot>OPEN INVARIANT</Badge>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


