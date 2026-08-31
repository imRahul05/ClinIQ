"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
} from "@cliniq/ui";
import {
  Users,
  Heart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function EmployerOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>POPULATION_ANALYTICS // APEX_GLOBAL_TECH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Population Health & Risk Distribution
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Actuarial health invariant scoring, risk tiering stratification, and chronic disease prevalence for 1,250 covered lives.
          </p>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Covered Lives"
          value="1,250"
          subtitle="94% Active Portal Telemetry"
          icon={<Users className="size-4 text-sky-400" />}
          loincCode="COHORT: APEX-EMPLOYER"
        />
        <StatCard
          title="Average Invariant Score"
          value="78.5 / 100"
          change="+2.1% YoY"
          trend="up"
          subtitle="Population Health Benchmark"
          icon={<Heart className="size-4 text-rose-500" />}
          loincCode="SYS: OHS-AGGREGATE"
        />
        <StatCard
          title="High Risk Cohort"
          value="48 Members"
          change="-6 this Q"
          trend="up"
          subtitle="Care Sentinel Active Monitoring"
          icon={<AlertCircle className="size-4 text-rose-500" />}
          loincCode="TIER: HIGH-ACUITY"
        />
        <StatCard
          title="Est. Annualized Savings"
          value="$77,700"
          change="ROI: 3.4x"
          trend="up"
          subtitle="ER & Inpatient Avoidance Ledger"
          icon={<TrendingUp className="size-4 text-emerald-500" />}
          loincCode="ACTUARIAL: AVOIDANCE"
        />
      </div>

      {/* Population Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card notch className="lg:col-span-2 bg-[var(--paper-raised)]">
          <CardHeader className="border-b border-[var(--line)] bg-[var(--paper-sunken)] pb-3">
            <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Health Invariant Risk Stratification</CardTitle>
            <CardDescription className="font-mono text-xs">
              Automated clinical risk tiering computed from longitudinal claims and biometric observations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-500 font-semibold">Low Risk (OHS 80-100)</span>
                <span className="text-[var(--ink)]">825 members (66%)</span>
              </div>
              <div className="h-2 rounded bg-[var(--paper-sunken)] border border-[var(--line)] overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "66%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sky-400 font-semibold">Moderate Risk (OHS 65-79)</span>
                <span className="text-[var(--ink)]">285 members (23%)</span>
              </div>
              <div className="h-2 rounded bg-[var(--paper-sunken)] border border-[var(--line)] overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: "23%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-amber-500 font-semibold">Rising Risk (OHS 50-64)</span>
                <span className="text-[var(--ink)]">92 members (7%)</span>
              </div>
              <div className="h-2 rounded bg-[var(--paper-sunken)] border border-[var(--line)] overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: "7%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-rose-500 font-semibold">High Acuity (OHS &lt;50)</span>
                <span className="text-[var(--ink)]">48 members (4%)</span>
              </div>
              <div className="h-2 rounded bg-[var(--paper-sunken)] border border-[var(--line)] overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: "4%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card notch className="bg-[var(--paper-raised)]">
          <CardHeader className="border-b border-[var(--line)] bg-[var(--paper-sunken)] pb-3">
            <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Chronic Condition Registry</CardTitle>
            <CardDescription className="font-mono text-[10px]">
              DE-IDENTIFIED PREVALENCE INDEX
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs font-mono pt-4">
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
              <span className="text-[var(--ink-muted)]">Hypertension</span>
              <span className="font-bold text-[var(--ink)]">18.4% (230)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
              <span className="text-[var(--ink-muted)]">Type 2 Diabetes</span>
              <span className="font-bold text-[var(--ink)]">9.2% (115)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
              <span className="text-[var(--ink-muted)]">Hyperlipidemia</span>
              <span className="font-bold text-[var(--ink)]">22.1% (276)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)]">
              <span className="text-[var(--ink-muted)]">Asthma / COPD</span>
              <span className="font-bold text-[var(--ink)]">6.8% (85)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


