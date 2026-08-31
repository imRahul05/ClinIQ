"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  DataTable,
} from "@cliniq/ui";
import { Eye, Sparkles } from "lucide-react";

interface FaxItem {
  id: string;
  sender: string;
  date: string;
  pages: number;
  classification: string;
  confidence: string;
  patientMatch: string;
  status: string;
  [key: string]: string | number;
}

const DEMO_FAXES: FaxItem[] = [
  { id: "fax-1", sender: "(555) 839-2910", date: "Aug 30, 2026 at 11:15 AM", pages: 3, classification: "Discharge Summary", confidence: "98%", patientMatch: "Sarah Johnson (MRN: 948204)", status: "Pending Review" },
  { id: "fax-2", sender: "(555) 192-3849", date: "Aug 29, 2026 at 4:20 PM", pages: 2, classification: "Lab Requisition", confidence: "96%", patientMatch: "Marcus Miller (MRN: 830219)", status: "Verified" },
  { id: "fax-3", sender: "(555) 441-9923", date: "Aug 28, 2026 at 1:05 PM", pages: 5, classification: "Specialist Referral", confidence: "94%", patientMatch: "David Vance (MRN: 419820)", status: "Verified" },
];

export default function FaxInboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>INGESTION // E_FAX_OCR_PARSER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Inbound Fax & Document Inbox
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Automated e-fax document ingestion with clinical entity extraction, Optical Character Recognition, and FHIR patient resolution.
          </p>
        </div>
      </div>

      <Card notch className="bg-[var(--paper-raised)]">
        <CardContent className="pt-6">
          <DataTable<FaxItem>
            data={DEMO_FAXES}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search faxes by sender, classification, or patient..."
            searchFilter={(item, q) =>
              item.sender.includes(q) ||
              item.classification.toLowerCase().includes(q) ||
              item.patientMatch.toLowerCase().includes(q)
            }
            columns={[
              {
                key: "sender",
                header: "Sender / Ingestion Time",
                render: (item) => (
                  <div>
                    <span className="font-semibold text-[var(--ink)] font-mono text-xs">{item.sender}</span>
                    <p className="font-mono text-[10px] text-[var(--ink-faint)] mt-0.5">{item.date} ({item.pages} pages)</p>
                  </div>
                ),
              },
              {
                key: "classification",
                header: "AI Classification",
                render: (item) => (
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Sparkles className="size-3 text-emerald-500" />
                    <span className="font-medium text-[var(--ink)]">{item.classification}</span>
                    <span className="text-[10px] text-[var(--ink-faint)]">({item.confidence})</span>
                  </div>
                ),
              },
              {
                key: "patientMatch",
                header: "Matched Patient Profile",
                render: (item) => (
                  <span className="font-mono text-xs text-[var(--ink)] font-semibold">{item.patientMatch}</span>
                ),
              },
              {
                key: "status",
                header: "Review State",
                render: (item) => (
                  <Badge variant={item.status === "Pending Review" ? "warning" : "success"} dot>
                    {item.status}
                  </Badge>
                ),
              },
              {
                key: "action",
                header: "Action",
                render: () => (
                  <Button size="sm" variant="outline" className="font-mono text-xs">
                    <Eye className="size-3 mr-1" /> View PDF
                  </Button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


