"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  VitalsChart,
  DataTable,
  Badge,
  Button,
} from "@cliniq/ui";
import { Pill, Activity, Syringe, FileText, Download } from "lucide-react";

interface DemoLab {
  id: string;
  biomarker: string;
  code: string;
  value: string;
  unit: string;
  range: string;
  status: string;
  date: string;
  [key: string]: string;
}

interface DemoMed {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  prescriber: string;
  status: string;
  refillDue: string;
}

interface DemoVaccine {
  id: string;
  vaccine: string;
  date: string;
  lot: string;
  clinic: string;
  [key: string]: string;
}

const DEMO_BP_DATA = [
  { date: "May 10", systolic: 128, diastolic: 82 },
  { date: "Jun 14", systolic: 124, diastolic: 80 },
  { date: "Jul 22", systolic: 120, diastolic: 79 },
  { date: "Aug 08", systolic: 118, diastolic: 78 },
  { date: "Aug 29", systolic: 116, diastolic: 76 },
];

const DEMO_LABS: DemoLab[] = [
  { id: "lab-1", biomarker: "Fasting Blood Glucose", code: "2339-0", value: "92", unit: "mg/dL", range: "70 - 99", status: "Proven Normal", date: "Aug 15, 2026" },
  { id: "lab-2", biomarker: "Hemoglobin A1c", code: "4548-4", value: "5.4", unit: "%", range: "4.0 - 5.6", status: "Proven Normal", date: "Aug 15, 2026" },
  { id: "lab-3", biomarker: "Total Cholesterol", code: "2093-3", value: "185", unit: "mg/dL", range: "125 - 200", status: "Proven Normal", date: "Aug 15, 2026" },
  { id: "lab-4", biomarker: "Serum Creatinine (eGFR)", code: "2160-0", value: "0.95", unit: "mg/dL", range: "0.6 - 1.2", status: "Proven Normal", date: "Aug 15, 2026" },
];

const DEMO_MEDS: DemoMed[] = [
  { id: "med-1", name: "Metformin HCl", dose: "500 mg", frequency: "Twice daily with meals", prescriber: "Dr. Robert Chen, MD", status: "Active Verified", refillDue: "Sep 15, 2026" },
  { id: "med-2", name: "Lisinopril", dose: "10 mg", frequency: "Once daily in morning", prescriber: "Dr. Robert Chen, MD", status: "Active Verified", refillDue: "Oct 01, 2026" },
];

const DEMO_VACCINES: DemoVaccine[] = [
  { id: "vac-1", vaccine: "Influenza (Flu) Annual", date: "Oct 12, 2025", lot: "FL98421", clinic: "Memorial Health FHIR" },
  { id: "vac-2", vaccine: "COVID-19 Updated Booster (mRNA)", date: "Nov 04, 2025", lot: "CV44910", clinic: "Memorial Health FHIR" },
  { id: "vac-3", vaccine: "Tetanus, Diphtheria, Pertussis (Tdap)", date: "Jun 18, 2022", lot: "TD10982", clinic: "Care Clinic FHIR" },
];

export default function PatientRecordsPage() {
  const [tab, setTab] = React.useState<"vitals" | "labs" | "meds" | "vaccines">("vitals");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>FHIR_R4_EVIDENCE // LONGITUDINAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Longitudinal Health Records
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Standard LOINC observations, laboratory diagnostic evidence, active RxNorm prescriptions, and immunization logs.
          </p>
        </div>
        <Button variant="outline" size="sm" className="font-mono text-xs">
          <Download className="size-3.5 mr-1.5" /> Export SMART JSON
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
        <Button
          variant={tab === "vitals" ? "default" : "ghost"}
          size="sm"
          className="font-mono text-xs"
          onClick={() => setTab("vitals")}
        >
          <Activity className="size-3.5 mr-1.5" /> Vital Signs Trends
        </Button>
        <Button
          variant={tab === "labs" ? "default" : "ghost"}
          size="sm"
          className="font-mono text-xs"
          onClick={() => setTab("labs")}
        >
          <FileText className="size-3.5 mr-1.5" /> Diagnostic Lab Results
        </Button>
        <Button
          variant={tab === "meds" ? "default" : "ghost"}
          size="sm"
          className="font-mono text-xs"
          onClick={() => setTab("meds")}
        >
          <Pill className="size-3.5 mr-1.5" /> Active Medications
        </Button>
        <Button
          variant={tab === "vaccines" ? "default" : "ghost"}
          size="sm"
          className="font-mono text-xs"
          onClick={() => setTab("vaccines")}
        >
          <Syringe className="size-3.5 mr-1.5" /> Immunization History
        </Button>
      </div>

      {/* Tab 1: Vitals Trends */}
      {tab === "vitals" && (
        <div className="space-y-6">
          <VitalsChart
            title="Blood Pressure Time-Series (LOINC 85354-9)"
            data={DEMO_BP_DATA}
            metricType="blood-pressure"
          />
        </div>
      )}

      {/* Tab 2: Lab Results */}
      {tab === "labs" && (
        <DataTable<DemoLab>
          data={DEMO_LABS}
          keyExtractor={(item) => item.id}
          columns={[
            { key: "biomarker", header: "Biomarker / Test Name" },
            { key: "code", header: "LOINC Code", render: (item) => <Badge variant="outline">{item.code}</Badge> },
            { key: "value", header: "Observed Result", render: (item) => <span className="font-mono font-semibold text-[var(--ink)]">{item.value} {item.unit}</span> },
            { key: "range", header: "Standard Target" },
            { key: "status", header: "Verification State", render: (item) => <Badge variant="success" dot>{item.status}</Badge> },
            { key: "date", header: "Attestation Date" },
          ]}
        />
      )}

      {/* Tab 3: Medications */}
      {tab === "meds" && (
        <div className="space-y-4">
          {DEMO_MEDS.map((med) => (
            <Card key={med.id} notch className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-[var(--ink)] text-base">{med.name}</h4>
                    <Badge variant="success" dot>{med.status}</Badge>
                  </div>
                  <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">Dose: {med.dose} · {med.frequency}</p>
                  <p className="font-mono text-[11px] text-[var(--ink-faint)] mt-1">Prescribed by {med.prescriber} · Refill Eligibility: {med.refillDue}</p>
                </div>
                <Button size="sm" className="font-mono text-xs">
                  Request Refill
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Vaccines */}
      {tab === "vaccines" && (
        <DataTable<DemoVaccine>
          data={DEMO_VACCINES}
          keyExtractor={(item) => item.id}
          columns={[
            { key: "vaccine", header: "Immunization Name" },
            { key: "date", header: "Date Administered" },
            { key: "lot", header: "Lot Number", render: (item) => <code className="text-xs text-[var(--ink)] font-mono bg-[var(--paper-sunken)] px-1.5 py-0.5 rounded border border-[var(--line)]">{item.lot}</code> },
            { key: "clinic", header: "Administering FHIR Endpoint" },
          ]}
        />
      )}
    </div>
  );
}


