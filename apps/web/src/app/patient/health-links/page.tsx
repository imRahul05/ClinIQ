"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@cliniq/ui";
import { QrCode, ShieldCheck, Copy, Check } from "lucide-react";

export default function SmartHealthLinksPage() {
  const [copied, setCopied] = React.useState(false);
  const passportUrl = "https://cliniq.health/shl#shlink1:eyJsYWJlbCI6IkNsaW5JUSBTYXJhaCBKb2huc29uIiwidXJsIjoiaHR0cHM6Ly9hcGkuY2xpbmlxLmhlYWx0aC9zaGwvZXhwb3J0In0";

  const handleCopy = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[var(--line)] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>CREDENTIALS // SMART_HEALTH_LINKS_v1</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
          Cryptographic Health Passport
        </h1>
        <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
          Share tamper-proof, elliptic-curve signed FHIR R4 immunization and laboratory payloads with verified third-party health systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* QR Code Card */}
        <Card notch className="text-center p-6 bg-[var(--paper-raised)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">SMART Health QR Credential</CardTitle>
            <CardDescription className="font-mono text-xs">
              Scan with any W3C SMART Health Links compliant scanner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* SVG QR Visual */}
            <div className="p-4 bg-[var(--paper-sunken)] border border-[var(--line-strong)] rounded inline-block mx-auto">
              <div className="size-48 bg-[var(--paper)] flex flex-col items-center justify-center rounded p-2 border border-[var(--line)]">
                <QrCode className="size-36 text-[var(--ink)]" />
                <span className="text-[10px] text-[var(--ink-muted)] font-mono font-bold mt-1">SMART HEALTH LINK</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 font-mono text-xs text-emerald-500">
              <ShieldCheck className="size-4" /> ECDSA Signed by ClinIQ Authority
            </div>
          </CardContent>
        </Card>

        {/* Details & Shareable Link */}
        <div className="space-y-4">
          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Included Verified Payloads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 space-y-1 font-mono">
                <div className="flex justify-between font-semibold text-[var(--ink)]">
                  <span>COVID-19 Updated Booster (mRNA)</span>
                  <span className="text-emerald-500">PROVEN</span>
                </div>
                <p className="text-[var(--ink-faint)] text-[11px]">Administered Nov 04, 2025 · Lot: CV44910</p>
              </div>

              <div className="rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 space-y-1 font-mono">
                <div className="flex justify-between font-semibold text-[var(--ink)]">
                  <span>Annual Influenza (Flu)</span>
                  <span className="text-emerald-500">PROVEN</span>
                </div>
                <p className="text-[var(--ink-faint)] text-[11px]">Administered Oct 12, 2025 · Lot: FL98421</p>
              </div>

              <div className="rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 space-y-1 font-mono">
                <div className="flex justify-between font-semibold text-[var(--ink)]">
                  <span>Comprehensive Metabolic Panel</span>
                  <span className="text-emerald-500">PROVEN</span>
                </div>
                <p className="text-[var(--ink-faint)] text-[11px]">Observed Aug 15, 2026 · LOINC Diagnostic</p>
              </div>
            </CardContent>
          </Card>

          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Shareable Encrypted Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={passportUrl}
                  className="flex-1 rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] px-3 py-1.5 font-mono text-[11px] text-[var(--ink-muted)] focus:outline-none truncate"
                />
                <Button size="sm" variant="outline" onClick={handleCopy} className="font-mono text-xs">
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


