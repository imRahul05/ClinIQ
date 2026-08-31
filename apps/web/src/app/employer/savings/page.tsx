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
import { DollarSign, ShieldAlert, TrendingUp } from "lucide-react";
import type { EmployerSavingsEventItem } from "@cliniq/api-spec";

const DEMO_SAVINGS_EVENTS: EmployerSavingsEventItem[] = [
  { id: "ev-1", date: "Aug 29, 2026", type: "ER Deflection", reason: "Acute Hypertensive Guidance & Nurse Callback", avoidedCost: "$1,850.00", virtualCost: "$45.00", netSavings: "$1,805.00" },
  { id: "ev-2", date: "Aug 26, 2026", type: "ER Deflection", reason: "Diabetic Hyperglycemia Triage & Med Titration", avoidedCost: "$1,850.00", virtualCost: "$45.00", netSavings: "$1,805.00" },
  { id: "ev-3", date: "Aug 22, 2026", type: "Urgent Care Deflection", reason: "Severe URI Symptom Evaluation & Prescription", avoidedCost: "$220.00", virtualCost: "$45.00", netSavings: "$175.00" },
  { id: "ev-4", date: "Aug 18, 2026", type: "ER Deflection", reason: "Post-Op Wound Tele-Inspection", avoidedCost: "$1,850.00", virtualCost: "$45.00", netSavings: "$1,805.00" },
];

export default function EmployerSavingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>ACTUARIAL_LEDGER // ER_DEFLECTION_ROI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            ER Avoidance & Financial Savings Ledger
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Auditable transaction-level accounting of emergency department and urgent care visits deflected via ClinIQ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total ER Deflections"
          value="42 Interventions"
          subtitle="Direct Nurse Triaged Avoidance"
          icon={<ShieldAlert className="size-4 text-emerald-500" />}
          loincCode="METRIC: DEFLECTED-TOTAL"
        />
        <StatCard
          title="Net Cost Savings"
          value="$68,400"
          subtitle="Net of Virtual Encounter Overhead"
          icon={<DollarSign className="size-4 text-sky-400" />}
          loincCode="FIN: NET-SAVINGS-YTD"
        />
        <StatCard
          title="PMPM Savings Yield"
          value="$5.47 / mo"
          change="3.4x ROI"
          trend="up"
          subtitle="Per Member Per Month Equivalent"
          icon={<TrendingUp className="size-4 text-emerald-500" />}
          loincCode="ROI: ACTUARIAL-PMPM"
        />
      </div>

      <Card notch className="bg-[var(--paper-raised)]">
        <CardHeader className="border-b border-[var(--line)] bg-[var(--paper-sunken)] pb-3">
          <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Actuarial Avoidance Ledger</CardTitle>
          <CardDescription className="font-mono text-xs">
            Individual clinical interventions audited and verified for emergency room deflection.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable<EmployerSavingsEventItem>
            data={DEMO_SAVINGS_EVENTS}
            keyExtractor={(item) => item.id}
            columns={[
              { key: "date", header: "Intervention Date" },
              {
                key: "type",
                header: "Deflection Classification",
                render: (item) => (
                  <Badge variant={item.type === "ER Deflection" ? "success" : "default"} dot>
                    {item.type}
                  </Badge>
                ),
              },
              { key: "reason", header: "Clinical Reason & Disposition" },
              { key: "avoidedCost", header: "Standard ER Benchmark", render: (item) => <span className="font-mono text-[var(--ink-faint)] line-through">{item.avoidedCost}</span> },
              { key: "netSavings", header: "Net Avoided Cost", render: (item) => <span className="font-mono font-bold text-emerald-500">{item.netSavings}</span> },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


