"use client";

import {
  Card,
  CardContent,
  DataTable,
  Badge,
} from "@cliniq/ui";

interface AuditLog {
  id: string;
  actor: string;
  patient: string;
  action: "READ" | "UPDATE" | "DELETE" | "EXPORT";
  resource: string;
  path: string;
  ip: string;
  timestamp: string;
  [key: string]: string;
}

const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: "log-1", actor: "Elena Rostova, RN (nurse.elena@apexhealthiq.demo)", patient: "Sarah Johnson (948204)", action: "READ", resource: "PatientChart", path: "/api/provider/chart/p-1", ip: "192.168.1.42", timestamp: "Aug 31, 2026 at 11:42 AM" },
  { id: "log-2", actor: "Elena Rostova, RN (nurse.elena@apexhealthiq.demo)", patient: "Sarah Johnson (948204)", action: "UPDATE", resource: "Encounter", path: "/api/scribe/sign-encounter", ip: "192.168.1.42", timestamp: "Aug 31, 2026 at 11:45 AM" },
  { id: "log-3", actor: "Sarah Johnson (sarah.johnson@apexhealthiq.demo)", patient: "Sarah Johnson (948204)", action: "READ", resource: "LabReading", path: "/api/patient/labs-and-vitals", ip: "73.189.44.12", timestamp: "Aug 31, 2026 at 11:10 AM" },
  { id: "log-4", actor: "Dr. Robert Chen, MD (dr.chen@apexhealthiq.demo)", patient: "Marcus Miller (830219)", action: "READ", resource: "PatientChart", path: "/api/provider/chart/p-2", ip: "192.168.1.55", timestamp: "Aug 30, 2026 at 4:30 PM" },
  { id: "log-5", actor: "System Administrator (admin@apexhealthiq.demo)", patient: "-", action: "READ", resource: "AuditTrail", path: "/api/audit/logs", ip: "10.0.0.1", timestamp: "Aug 31, 2026 at 12:00 PM" },
];

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            <span>AUDIT_LEDGER // HIPAA_SECURITY_RULE_164_312</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            PHI Access & Compliance Audit Trail
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Cryptographically sealed immutable ledger recording every FHIR R4 read, signature, mutation, and credential export.
          </p>
        </div>
      </div>

      <Card notch className="bg-[var(--paper-raised)]">
        <CardContent className="pt-6">
          <DataTable<AuditLog>
            data={DEMO_AUDIT_LOGS}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search audit ledger by actor, patient subject, resource, or action..."
            searchFilter={(item, q) =>
              item.actor.toLowerCase().includes(q) ||
              item.patient.toLowerCase().includes(q) ||
              item.resource.toLowerCase().includes(q) ||
              item.action.toLowerCase().includes(q)
            }
            columns={[
              {
                key: "timestamp",
                header: "Ingestion Timestamp",
                render: (item) => <span className="text-xs font-mono text-[var(--ink-muted)]">{item.timestamp}</span>,
              },
              {
                key: "actor",
                header: "Authenticated Principal",
                render: (item) => <span className="text-xs font-mono font-medium text-[var(--ink)]">{item.actor}</span>,
              },
              {
                key: "patient",
                header: "Target Patient",
                render: (item) => <span className="text-xs font-mono text-[var(--ink)] font-semibold">{item.patient}</span>,
              },
              {
                key: "action",
                header: "Operation",
                render: (item) => (
                  <Badge variant={item.action === "READ" ? "secondary" : item.action === "UPDATE" ? "default" : "destructive"} dot>
                    {item.action}
                  </Badge>
                ),
              },
              {
                key: "resource",
                header: "FHIR Entity",
                render: (item) => <span className="text-xs font-mono text-[var(--ink-faint)]">{item.resource}</span>,
              },
              {
                key: "ip",
                header: "IP Telemetry",
                render: (item) => <span className="text-xs font-mono text-[var(--ink-faint)]">{item.ip}</span>,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


