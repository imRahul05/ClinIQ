"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BrandLogo,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ThemeToggle,
} from "@cliniq/ui";
import { loginApi } from "@/lib/api/auth.api";
import { ArrowRight, ShieldCheck, User, Stethoscope, Building2, Shield, Lock, Terminal } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("sarah.johnson@apexhealthiq.demo");
  const [password, setPassword] = React.useState("demo123");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (overrideEmail?: string, overrideRole?: string) => {
    setIsLoading(true);
    setError(null);
    const targetEmail = overrideEmail || email;

    try {
      const response = await loginApi({ email: targetEmail, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("cliniq_token", response.token);
        localStorage.setItem("cliniq_user", JSON.stringify(response.user));
      }

      const role = overrideRole || response.user.role;
      if (role === "patient") {
        router.push("/patient/dashboard");
      } else if (role === "physician" || role === "nurse" || role === "care_coordinator") {
        router.push("/provider/dashboard");
      } else if (role === "employer_admin") {
        router.push("/employer/overview");
      } else if (role === "admin") {
        router.push("/admin/users");
      } else {
        router.push("/patient/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-4 py-12 text-[var(--ink)] transition-colors relative">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <Link href="/" className="font-mono text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]">
          ← Back to Overview
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-6">
        
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <BrandLogo size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Clinical Authentication
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] max-w-sm mx-auto">
            SMART on FHIR OAuth2 & JWT session encryption. Select a 1-click persona to launch instantly.
          </p>
        </div>

        {/* Auth Frame */}
        <div className="relative rounded-md border border-[var(--line)] bg-[var(--paper-raised)] p-6 sm:p-8">
          <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px size-1.5 border-t-2 border-l-2 border-[var(--line-strong)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px size-1.5 border-t-2 border-r-2 border-[var(--line-strong)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px size-1.5 border-b-2 border-l-2 border-[var(--line-strong)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-px -bottom-px size-1.5 border-r-2 border-b-2 border-[var(--line-strong)]" />

          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)] font-medium">
              CREDENTIAL_AUTH // RUNTIME
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-500 font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MEDPLUM ONLINE
            </span>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="rounded border border-rose-900/60 bg-rose-950/40 p-3 font-mono text-xs text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[var(--ink-muted)]">
                Email Address / NPI Identifier
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] px-3.5 py-2 font-mono text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[var(--ink-muted)]">
                Cryptographic Key / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] px-3.5 py-2 font-mono text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <Button
              className="w-full h-11 text-xs sm:text-sm"
              disabled={isLoading}
              onClick={() => handleLogin()}
            >
              {isLoading ? "Validating Credentials..." : "Authenticate Session"}
            </Button>

            {/* 1-Click Demo Personas */}
            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--line)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--paper-raised)] px-2.5 font-mono text-[10px] text-[var(--ink-faint)] tracking-[0.14em]">
                  1-CLICK PERSONA LAUNCHERS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                className="flex flex-col items-start rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--paper)]"
                onClick={() => handleLogin("sarah.johnson@apexhealthiq.demo", "patient")}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink)]">
                  <User className="size-3.5 text-sky-400" />
                  <span>Patient</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--ink-faint)] mt-1">Sarah Johnson (38F)</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-start rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--paper)]"
                onClick={() => handleLogin("nurse.elena@apexhealthiq.demo", "nurse")}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink)]">
                  <Stethoscope className="size-3.5 text-emerald-400" />
                  <span>Provider</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--ink-faint)] mt-1">Elena Rostova, RN</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-start rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--paper)]"
                onClick={() => handleLogin("hr.admin@apexhealthiq.demo", "employer_admin")}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink)]">
                  <Building2 className="size-3.5 text-amber-400" />
                  <span>Employer</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--ink-faint)] mt-1">Self-Insured Corp</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-start rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--paper)]"
                onClick={() => handleLogin("admin@apexhealthiq.demo", "admin")}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink)]">
                  <Shield className="size-3.5 text-indigo-400" />
                  <span>Org Admin</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--ink-faint)] mt-1">Dr. Arthur Vance</span>
              </button>
            </div>

          </div>
        </div>

        <p className="text-center font-mono text-[11px] text-[var(--ink-faint)]">
          Audit trails recorded in compliance with 45 CFR § 164.312(b).
        </p>

      </div>
    </div>
  );
}


