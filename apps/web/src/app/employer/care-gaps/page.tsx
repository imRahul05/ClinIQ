"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  DataTable,
  Badge,
  StatCard,
} from "@cliniq/ui";
import { AlertTriangle, Target, Award } from "lucide-react";
import type { HedisMeasureItem } from "@cliniq/api-spec";

const HEDIS_MEASURES: HedisMeasureItem[] = [
  { id: "m-1", measure: "Colorectal Cancer Screening (COL)", eligible: 340, closed: 265, rate: "77.9%", benchmark: "72.0%", status: "Above Benchmark" },
  { id: "m-2", measure: "Comprehensive Diabetes Care: HbA1c Control (<8%)", eligible: 115, closed: 88, rate: "76.5%", benchmark: "68.5%", status: "Above Benchmark" },
  { id: "m-3", measure: "Controlling High Blood Pressure (CBP)", eligible: 230, closed: 172, rate: "74.8%", benchmark: "70.1%", status: "Above Benchmark" },
  { id: "m-4", measure: "Diabetic Retinal Eye Exam (CDC-E)", eligible: 115, closed: 62, rate: "53.9%", benchmark: "60.0%", status: "Action Needed" },
  { id: "m-5", measure: "Breast Cancer Screening (BCS)", eligible: 280, closed: 218, rate: "77.8%", benchmark: "74.2%", status: "Above Benchmark" },
];

export default function EmployerCareGapsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>QUALITY_INDEX // NCQA_HEDIS_MEASURES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            HEDIS Quality Measures & Care Gap Closure
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Population-wide clinical preventive invariant guarantees benchmarked against NCQA national standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Overall Invariant Closure"
          value="74.2%"
          change="+6.8% YoY"
          trend="up"
          subtitle="NCQA 4-Star Quality Invariant"
          icon={<Award className="size-4 text-emerald-500" />}
          loincCode="NCQA: AGGREGATE-RATE"
        />
        <StatCard
          title="Open Invariant Gaps"
          value="290 Gaps"
          subtitle="Active Outreach Sentinel Dispatches"
          icon={<AlertTriangle className="size-4 text-rose-500" />}
          loincCode="HEDIS: OPEN-VIOLATIONS"
        />
        <StatCard
          title="Measures Above Benchmark"
          value="4 of 5"
          subtitle="Leading National Accreditation"
          icon={<Target className="size-4 text-sky-400" />}
          loincCode="HEDIS: BENCHMARK-RATIO"
        />
      </div>

      <Card notch className="bg-[var(--paper-raised)]">
        <CardHeader className="border-b border-[var(--line)] bg-[var(--paper-sunken)] pb-3">
          <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">HEDIS Quality Invariant Roster</CardTitle>
          <CardDescription className="font-mono text-xs">
            Population eligibility and verified closure rates across core quality metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable<HedisMeasureItem>
            data={HEDIS_MEASURES}
            keyExtractor={(item) => item.id}
            columns={[
              { key: "measure", header: "HEDIS Quality Measure" },
              { key: "eligible", header: "Eligible Cohort", render: (item) => <span className="font-mono">{item.eligible} members</span> },
              { key: "closed", header: "Closed Invariants", render: (item) => <span className="font-mono font-semibold text-emerald-500">{item.closed}</span> },
              { key: "rate", header: "Closure Yield", render: (item) => <span className="font-mono font-bold text-[var(--ink)]">{item.rate}</span> },
              { key: "benchmark", header: "NCQA Benchmark", render: (item) => <span className="font-mono text-[var(--ink-muted)]">{item.benchmark}</span> },
              {
                key: "status",
                header: "Quality State",
                render: (item) => (
                  <Badge variant={item.status === "Above Benchmark" ? "success" : "warning"} dot>
                    {item.status}
                  </Badge>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


