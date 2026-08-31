"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Badge,
  DataTable,
} from "@cliniq/ui";
import { ArrowRight, UserPlus } from "lucide-react";
import type { PatientRosterItem } from "@cliniq/api-spec";

const PATIENTS_ROSTER: PatientRosterItem[] = [
  { id: "p-1", name: "Sarah Johnson", mrn: "948204", dob: "1988-04-12", gender: "Female", phone: "(555) 234-5678", email: "sarah.j@example.com", employer: "Apex Global Tech", riskTier: "low" },
  { id: "p-2", name: "Marcus Miller", mrn: "830219", dob: "1972-11-03", gender: "Male", phone: "(555) 876-5432", email: "marcus.m@example.com", employer: "Apex Global Tech", riskTier: "high" },
  { id: "p-3", name: "David Vance", mrn: "419820", dob: "1965-06-21", gender: "Male", phone: "(555) 432-1098", email: "david.v@example.com", employer: "Summit Health Logistics", riskTier: "moderate" },
  { id: "p-4", name: "Emily Watson", mrn: "550192", dob: "1994-09-18", gender: "Female", phone: "(555) 321-9876", email: "emily.w@example.com", employer: "Apex Global Tech", riskTier: "low" },
  { id: "p-5", name: "James Thorne", mrn: "772019", dob: "1981-02-14", gender: "Male", phone: "(555) 654-3210", email: "james.t@example.com", employer: "Summit Health Logistics", riskTier: "moderate" },
];

export default function PatientsRosterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>FHIR_PATIENT // DIRECTORY_ROSTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Patient Panel Roster
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Search longitudinal patient records indexed by FHIR MRN identifier, date of birth, and employer risk pool.
          </p>
        </div>
        <Button size="sm" className="font-mono text-xs gap-2">
          <UserPlus className="size-3.5" /> Quick Add Patient
        </Button>
      </div>

      <Card notch className="bg-[var(--paper-raised)]">
        <CardContent className="pt-6">
          <DataTable<PatientRosterItem>
            data={PATIENTS_ROSTER}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search by Name, MRN, Employer Group, or Phone..."
            searchFilter={(item, q) =>
              item.name.toLowerCase().includes(q) ||
              item.mrn.includes(q) ||
              item.employer.toLowerCase().includes(q) ||
              item.phone.includes(q)
            }
            columns={[
              {
                key: "name",
                header: "Patient Identifier",
                render: (item) => (
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{item.name}</span>
                    <p className="font-mono text-[10px] text-[var(--ink-faint)] mt-0.5">MRN: {item.mrn} · {item.gender}</p>
                  </div>
                ),
              },
              { key: "dob", header: "Date of Birth" },
              { key: "employer", header: "Employer Group" },
              { key: "phone", header: "Phone / Telemetry" },
              {
                key: "riskTier",
                header: "Risk Tier",
                render: (item) => (
                  <Badge
                    variant={
                      item.riskTier === "high"
                        ? "destructive"
                        : item.riskTier === "moderate"
                        ? "warning"
                        : "success"
                    }
                    dot
                  >
                    {item.riskTier.toUpperCase()}
                  </Badge>
                ),
              },
              {
                key: "actions",
                header: "Action",
                render: (item) => (
                  <Link href={`/provider/chart/${item.id}`}>
                    <Button size="sm" variant="outline" className="font-mono text-xs">
                      View Chart <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </Link>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


