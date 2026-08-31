"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  StatCard,
} from "@cliniq/ui";
import {
  Activity,
  Heart,
  Calendar,
  Video,
  ShieldCheck,
  AlertCircle,
  Pill,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>PATIENT_OVERVIEW // MRN-948204</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Welcome back, Sarah
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Longitudinal health score, automated clinical invariant monitors, and scheduled care encounters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patient/care-call">
            <Button size="sm" className="font-mono text-xs gap-2">
              <Video className="size-3.5" /> Launch Virtual Exam Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Health Invariant Score"
          value="82 / 100"
          change="+4 pts"
          trend="up"
          subtitle="Low Risk Tier · 89% Invariants Proven"
          icon={<Heart className="size-4 text-rose-500" />}
          loincCode="SYS: HEALTH-INDEX-v2"
        />
        <StatCard
          title="Blood Pressure"
          value="118 / 78"
          subtitle="LOINC 85354-9 · Proven Normotensive"
          trend="neutral"
          icon={<Activity className="size-4 text-emerald-500" />}
          loincCode="LOINC: 85354-9"
        />
        <StatCard
          title="Active Regimens"
          value="2 Rx Active"
          subtitle="Metformin 500mg · 1 Refill Eligible"
          icon={<Pill className="size-4 text-sky-400" />}
          loincCode="RXNORM: #860975"
        />
        <StatCard
          title="Care Invariants"
          value="1 Action Needed"
          subtitle="Diabetic Retinal Exam (HEDIS)"
          trend="down"
          icon={<AlertCircle className="size-4 text-amber-500" />}
          loincCode="HEDIS: BPD-E"
        />
      </div>

      {/* Main Grid: Actionable Health Tasks + Care Team */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Actionable Health Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Care Gap Banner */}
          <Card notch className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="warning" dot>Care Invariant Risk</Badge>
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">HEDIS Quality Measure</span>
              </div>
              <CardTitle className="text-base sm:text-lg mt-2 font-medium text-[var(--ink)]">
                Annual Diabetic Retinal Eye Exam Required
              </CardTitle>
              <CardDescription className="text-xs text-[var(--ink-muted)] font-mono leading-relaxed mt-1">
                Clinical protocol requires annual dilated retinal screening for Type 2 Diabetes to maintain proof of zero retinopathy progression.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pt-0">
              <Link href="/patient/appointments">
                <Button size="sm" className="font-mono text-xs">
                  Schedule Screening Slot
                </Button>
              </Link>
              <Link href="/patient/intake">
                <Button size="sm" variant="outline" className="font-mono text-xs">
                  Update Health Intake
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions & Questionnaires */}
          <Card notch>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Preventive Assessments & Screenings</CardTitle>
                <span className="font-mono text-[10px] text-[var(--ink-faint)]">FHIR R4 STORE</span>
              </div>
              <CardDescription className="font-mono text-xs">
                Clinical questionnaires evaluated directly against longitudinal care guarantees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3.5">
                <div>
                  <h4 className="font-mono text-xs font-semibold text-[var(--ink)]">
                    AHC HRSN Social Determinants Screening
                  </h4>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-0.5">
                    Evaluates nutrition, housing stability, and care transportation.
                  </p>
                </div>
                <Link href="/patient/intake">
                  <Button size="sm" variant="outline" className="font-mono text-xs">
                    Start Form <ArrowRight className="size-3 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3.5">
                <div>
                  <h4 className="font-mono text-xs font-semibold text-[var(--ink)]">
                    Adult Clinical Health History
                  </h4>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-0.5">
                    Recorded Aug 15, 2026 · Status: Attested in Medplum Repository
                  </p>
                </div>
                <Badge variant="success" dot>PROVEN</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Care Team & Smart Health Passports */}
        <div className="space-y-6">
          {/* Primary Care Nurse Info */}
          <Card notch>
            <CardHeader>
              <CardTitle className="text-base font-medium">Assigned Care Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs">
                  ER
                </div>
                <div>
                  <p className="font-semibold text-[var(--ink)]">Elena Rostova, RN</p>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)]">Care Coordinator · NPI 1948201948</p>
                </div>
              </div>

              <div className="rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 font-mono text-xs space-y-1">
                <p className="text-[var(--ink-muted)]">Next Scheduled Call:</p>
                <div className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                  <Calendar className="size-3.5 text-emerald-500" />
                  <span>Thursday, Sep 4, 2026 at 10:30 AM</span>
                </div>
              </div>

              <Link href="/patient/messages" className="block">
                <Button variant="secondary" className="w-full text-xs font-mono">
                  Send Secure Message
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* SMART Health Links Passport */}
          <Card notch>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" /> Cryptographic Health Passport
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Export encrypted SMART Health Links QR credentials for external hospital visits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patient/health-links">
                <Button variant="outline" className="w-full text-xs font-mono">
                  Generate SMART QR
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


