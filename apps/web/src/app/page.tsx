"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Play,
  Square,
  FileText,
  Sparkles,
  Cpu,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Database,
  Stethoscope,
  Terminal,
  ExternalLink,
  Zap,
  Check,
  Eye,
  Heart,
  Video,
  Hospital,
  Award,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { ThemeToggle } from "@cliniq/ui";

interface SwarmAgent {
  id: string;
  name: string;
  objective: string;
  status: "running" | "concluded" | "stopped";
  progress: number;
  currentStep: string;
  result?: string;
}

interface InvariantBeat {
  beat: number;
  state: "unverified" | "investigating" | "proven" | "broken" | "inconclusive";
  observation: string;
  details: string;
}

interface AccordionItem {
  id: string;
  number: string;
  title: string;
  description: string;
  diagramType: "ehr" | "scribe" | "observability";
}

export default function LandingPage() {
  const [activeSection, setActiveSection] = React.useState<string>("hero");
  const [openAccordion, setOpenAccordion] = React.useState<string>("ehr");

  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHoveringLogo, setIsHoveringLogo] = React.useState<boolean>(false);
  const footerRef = React.useRef<HTMLDivElement | null>(null);

  const [swarmAgents, setSwarmAgents] = React.useState<SwarmAgent[]>([
    {
      id: "maya-triage",
      name: "maya-triage-agent",
      objective: "Pre-visit intake & HRSN SDOH screening for Patient Sarah Johnson",
      status: "running",
      progress: 78,
      currentStep: "Analyzing Fasting Glucose 92 mg/dL against baseline LOINC 2339-0",
      result: "3 social determinants evaluated. Retinal exam referral queued.",
    },
    {
      id: "ambient-scribe",
      name: "ambient-scribe-worker",
      objective: "Deepgram audio stream → SOAP extraction → ICD-10 & CPT validation",
      status: "running",
      progress: 62,
      currentStep: "Extracting Assessment: E11.9 (T2D) & I10 (Essential HTN)",
      result: "Attestation Ready with 99.4% FHIR schema compliance.",
    },
    {
      id: "care-gap-sentinel",
      name: "care-gap-sentinel",
      objective: "Evaluating diabetic retinal exam & colorectal HEDIS quality adherence",
      status: "concluded",
      progress: 100,
      currentStep: "Audit completed across 500 patient cohort",
      result: "Concluded. 486 proven, 14 care gaps identified.",
    },
    {
      id: "pharmacy-reconciler",
      name: "pharmacy-reconciler",
      objective: "Cross-checking Metformin 500mg against renal function eGFR (LOINC 33914-3)",
      status: "running",
      progress: 44,
      currentStep: "Verifying eGFR > 60 mL/min/1.73m² safety threshold",
    },
  ]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero",
        "scene-gap",
        "scene-diverge",
        "scene-usual-answers",
        "scene-how-it-works",
        "scene-lifecycle",
        "scene-vocabulary",
        "scene-quality-graph",
        "scene-swarm",
        "scene-states",
        "scene-portals",
        "scene-security",
        "scene-faq",
      ];

      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSwarmAgents((prev) =>
        prev.map((agent) => {
          if (agent.status !== "running") return agent;
          const nextProgress = agent.progress >= 95 ? 100 : agent.progress + 3;
          const isDone = nextProgress === 100;
          return {
            ...agent,
            progress: nextProgress,
            status: isDone ? "concluded" : "running",
            currentStep: isDone
              ? "Experiment execution verified"
              : agent.currentStep,
            result: isDone && !agent.result ? "All clinical constraints proven." : agent.result,
          };
        })
      );
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const handleStopAgent = (agentId: string) => {
    setSwarmAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: a.status === "stopped" ? "running" : "stopped", currentStep: a.status === "stopped" ? "Resumed run" : "Paused by clinician" }
          : a
      )
    );
  };

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const lifecycleBeats: InvariantBeat[] = [
    {
      beat: 1,
      state: "unverified",
      observation: "ClinIQ discovered clinical invariant in longitudinal record",
      details: "Claim: Patient on Metformin 500mg BID requires annual eGFR (LOINC 33914-3).",
    },
    {
      beat: 2,
      state: "investigating",
      observation: "Designing clinical verification experiment in isolated sandbox",
      details: "Simulating 500 patient cohort against FHIR R4 diagnostic report endpoints.",
    },
    {
      beat: 3,
      state: "proven",
      observation: "500 synthetic chart audits. All 500 hold with zero contraindications.",
      details: "Verified against LOINC 33914-3 and RxNorm #860975. Validated by Medplum FHIR engine.",
    },
    {
      beat: 4,
      state: "proven",
      observation: "Still holding. Commit after commit, encounter after encounter.",
      details: "Ambient notes automatically link vitals to patient history with attestation checks.",
    },
    {
      beat: 5,
      state: "investigating",
      observation: "A new prescription touched dosage. Re-checking clinical constraints.",
      details: "Dosage increased from 500mg to 1000mg BID without updated renal clearance panel.",
    },
    {
      beat: 6,
      state: "broken",
      observation: "14 of 500 patients have eGFR < 45 mL/min with active unadjusted Metformin.",
      details: "Critical safety risk flagged before pharmacist dispatch or encounter sign-off.",
    },
  ];

  const accordionItems: AccordionItem[] = [
    {
      id: "ehr",
      number: "01",
      title: "Standard EHRs (Epic, Cerner, Athena)",
      description:
        "A legacy EHR stores what was clicked, on one afternoon, by one practitioner. It passes billing audits forever after, including long after clinical guidelines changed. Storage measures how much data entered the database, never whether your patient's safety guarantees still hold.",
      diagramType: "ehr",
    },
    {
      id: "scribe",
      number: "02",
      title: "Generic AI Scribes (Unconstrained LLMs)",
      description:
        "A generic model listening to audio generates a transcript and guesses ICD-10 codes based on statistical word proximity. It can tell you a word was spoken. It cannot prove that this dosage does not violate renal safety thresholds, because it has no standing model of clinical invariants.",
      diagramType: "scribe",
    },
    {
      id: "observability",
      number: "03",
      title: "Hospital IT Dashboards & Uptime Monitors",
      description:
        "Logs, server metrics, and API health monitors describe system uptime, not clinical correctness. They are exceptional at alerting you when a database server crashes. They are silent when an encounter returns 200 OK while failing to transcribe a life-threatening penicillin allergy.",
      diagramType: "observability",
    },
  ];

  const progressNavSections = [
    { id: "hero", label: "Overview" },
    { id: "scene-gap", label: "The gap" },
    { id: "scene-diverge", label: "The question" },
    { id: "scene-usual-answers", label: "Why EHRs fail" },
    { id: "scene-how-it-works", label: "How it works" },
    { id: "scene-lifecycle", label: "The invariant" },
    { id: "scene-vocabulary", label: "Vocabulary" },
    { id: "scene-quality-graph", label: "Quality graph" },
    { id: "scene-swarm", label: "Agent swarm" },
    { id: "scene-states", label: "Honesty" },
    { id: "scene-portals", label: "Portal sandbox" },
    { id: "scene-security", label: "Security" },
    { id: "scene-faq", label: "Questions" },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] selection:bg-[var(--ink)] selection:text-[var(--paper)] transition-colors antialiased font-sans">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-[var(--gutter)]">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ClinIQ</span>
              <span className="rounded bg-[var(--ink)]/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                v2.4 FHIR R4
              </span>
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            <a href="#scene-gap" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              The Gap
            </a>
            <a href="#scene-how-it-works" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              How It Works
            </a>
            <a href="#scene-lifecycle" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              Invariant Lifecycle
            </a>
            <a href="#scene-swarm" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              Agent Swarm
            </a>
            <a href="#scene-portals" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              Persona Portals
            </a>
            <a href="#scene-security" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              Security
            </a>
            <a href="#scene-faq" className="text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/signin"
              className="hidden sm:inline-flex items-center justify-center rounded-md border border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[var(--paper-sunken)]"
            >
              Sign In
            </Link>
            <Link
              href="/patient/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 shadow-xs"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Section progress"
        className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 min-[1400px]:block"
      >
        <div className="relative flex">
          <ol className="pointer-events-auto flex flex-col gap-1.5">
            {progressNavSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <li key={sec.id} className="flex items-center justify-end h-6">
                  <a
                    href={`#${sec.id}`}
                    className="group flex flex-row-reverse items-center gap-2 py-1"
                  >
                    <span
                      aria-hidden="true"
                      className={`block h-px transition-all duration-300 ${
                        isActive
                          ? "w-4 bg-[var(--ink)]"
                          : "w-2 bg-[var(--line-strong)] group-hover:w-3 group-hover:bg-[var(--ink-muted)]"
                      }`}
                    />
                    <span
                      className={`font-mono text-[9px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                        isActive
                          ? "text-[var(--ink)] font-semibold"
                          : "text-[var(--ink-faint)] group-hover:text-[var(--ink-muted)]"
                      }`}
                    >
                      {sec.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
          <div aria-hidden="true" className="relative w-2.5 shrink-0 ml-1.5">
            <span className="absolute inset-y-0 right-0 w-px bg-[var(--line-strong)]" />
            <span
              className="absolute inset-y-0 right-0 w-1 opacity-70"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px 6px)",
              }}
            />
          </div>
        </div>
      </nav>

      <main id="main" className="flex-1">

        <section id="hero" aria-labelledby="hero-heading" className="relative flex w-full flex-col bg-[var(--paper)]">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
            <div className="mx-4 sm:mx-8 flex flex-1 flex-col border-x border-[var(--line)]">
              
              <div className="shrink-0 border-b border-[var(--line)] px-6 sm:px-12 pt-10 pb-8 sm:pt-14 sm:pb-10">
                <div className="relative inline-flex h-8 items-center justify-center bg-[var(--ink)]/8 px-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                  Clinical Correctness & Ambient Intelligence Platform
                  <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px size-1 border-t border-l border-[var(--ink)]/60" />
                  <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px size-1 border-t border-r border-[var(--ink)]/60" />
                  <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px size-1 border-b border-l border-[var(--ink)]/60" />
                  <span aria-hidden="true" className="pointer-events-none absolute -right-px -bottom-px size-1 border-r border-b border-[var(--ink)]/60" />
                </div>

                <h1
                  id="hero-heading"
                  className="mt-6 max-w-3xl text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-balance leading-[1.08]"
                >
                  <span
                    className="inline-block animate-shine"
                    style={{
                      backgroundImage:
                        "linear-gradient(120deg, var(--ink) 0%, var(--ink) 35%, var(--primary) 50%, var(--ink) 65%, var(--ink) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Healthcare that logs data is not healthcare that works.
                  </span>
                </h1>
              </div>

              <div className="flex flex-col lg:flex-row border-b border-[var(--line)]">
                
                <div className="flex-1 overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--line)] bg-[var(--paper-sunken)] p-6 sm:p-10 flex items-center justify-center min-h-[380px]">
                  <div className="relative w-full max-w-md aspect-4/3 flex items-center justify-center">
                    <svg viewBox="0 0 400 300" className="w-full h-full text-[var(--ink)] drop-shadow-sm select-none" aria-hidden="true">
                      <defs>
                        <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
                        </linearGradient>
                        <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>

                      <g transform="translate(0, 70)">
                        <polygon points="200,80 340,150 200,220 60,150" fill="url(#planeGrad)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                        <polyline points="60,150 60,165 200,235 340,165 340,150" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                        <polyline points="200,220 200,235" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                        
                        <line x1="130" y1="115" x2="270" y2="185" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="3 3" />
                        <line x1="270" y1="115" x2="130" y2="185" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="3 3" />

                        <circle cx="130" cy="150" r="4" fill="var(--state-proven)" />
                        <circle cx="200" cy="150" r="5" fill="var(--primary)" />
                        <circle cx="270" cy="150" r="4" fill="var(--state-proven)" />
                        <circle cx="200" cy="185" r="4" fill="var(--state-broken)" />
                        <circle cx="200" cy="115" r="4" fill="var(--state-investigating)" />

                        <text x="200" y="210" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="9" fontFamily="monospace">
                          MEDPLUM FHIR R4 LONGITUDINAL REPO
                        </text>
                      </g>

                      <g transform="translate(0, 0)">
                        <polygon points="200,50 340,120 200,190 60,120" fill="url(#activeGrad)" stroke="var(--primary)" strokeWidth="1.25" strokeOpacity="0.7" />
                        
                        <line x1="130" y1="220" x2="130" y2="120" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.5" />
                        <line x1="270" y1="220" x2="270" y2="120" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.5" />
                        <line x1="200" y1="220" x2="200" y2="120" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.8" />

                        <g transform="translate(200, 120)">
                          <polygon points="0,-12 12,0 0,12 -12,0" fill="var(--paper-raised)" stroke="var(--primary)" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="3" fill="var(--primary)" />
                        </g>

                        <g transform="translate(130, 95)">
                          <circle cx="0" cy="0" r="6" fill="var(--paper-raised)" stroke="var(--state-proven)" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="2.5" fill="var(--state-proven)" />
                          <text x="-10" y="-10" fill="currentColor" fontSize="8" fontFamily="monospace">eGFR &gt; 60</text>
                        </g>

                        <g transform="translate(270, 95)">
                          <circle cx="0" cy="0" r="6" fill="var(--paper-raised)" stroke="var(--state-proven)" strokeWidth="1.5" />
                          <circle cx="0" cy="0" r="2.5" fill="var(--state-proven)" />
                          <text x="10" y="-10" fill="currentColor" fontSize="8" fontFamily="monospace">HbA1c &lt; 7.0</text>
                        </g>

                        <g transform="translate(200, 160)">
                          <polygon points="0,-7 7,0 0,7 -7,0" fill="var(--state-broken)" />
                          <text x="12" y="3" fill="var(--state-broken)" fontSize="8" fontFamily="monospace">Care Gap Alert</text>
                        </g>
                      </g>

                      <g transform="translate(200, 45)">
                        <circle cx="0" cy="0" r="16" fill="none" stroke="var(--primary)" strokeWidth="0.75" strokeOpacity="0.4" className="animate-ping" style={{ transformOrigin: "center", animationDuration: "3s" }} />
                        <circle cx="0" cy="0" r="8" fill="var(--primary)" fillOpacity="0.2" />
                        <circle cx="0" cy="0" r="3" fill="var(--primary)" />
                        <text x="0" y="-14" textAnchor="middle" fill="currentColor" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                          AMBIENT SCRIBE RUNNER · DEEPGRAM LIVE
                        </text>
                      </g>
                    </svg>

                    <span aria-hidden="true" className="absolute top-2 left-2 font-mono text-[9px] text-[var(--ink-faint)]">
                      ISO: CLINICAL-MATRIX-v2
                    </span>
                    <span aria-hidden="true" className="absolute bottom-2 right-2 font-mono text-[9px] text-[var(--ink-faint)]">
                      STATUS: 486 PROVEN · 14 FLAGGED
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-8 sm:py-12 bg-[var(--paper)]">
                  <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--ink-muted)]">
                    Point ClinIQ at your health system, EHR streams, and clinical audio. It works out what care guarantees your protocols actually promise, then continuously verifies every patient chart against evidence.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/patient/dashboard"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] px-6 text-sm font-medium transition-opacity hover:opacity-90 shadow-xs"
                    >
                      <span>Explore Live Sandbox</span>
                      <ChevronRight className="size-4" />
                    </Link>
                    <Link
                      href="#scene-how-it-works"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--line-strong)] text-[var(--ink)] px-6 text-sm font-medium transition-colors hover:bg-[var(--paper-sunken)]"
                    >
                      How Verification Works
                    </Link>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-6">
                    <div>
                      <p className="font-mono text-xs font-semibold text-[var(--ink)]">200 OK ≠ Correct Care</p>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        Tests verify code ran. ClinIQ verifies clinical meaning held.
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-semibold text-[var(--ink)]">Medplum FHIR R4</p>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        Zero data retention for training. Pure cryptographic patient privacy.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 sm:px-12 py-4 bg-[var(--paper-sunken)]">
                <p className="font-mono text-xs text-[var(--ink-muted)]">
                  200 OK, and an unmonitored drug interaction reached the pharmacy.
                </p>
                <p className="font-mono text-xs text-[var(--ink-faint)]">
                  HIPAA & SOC2 Type II Certified · Real-time SMART on FHIR
                </p>
              </div>

            </div>
          </div>
        </section>

        <section id="scene-gap" aria-labelledby="gap-heading" className="bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="gap-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                A green chart tells you almost nothing.
              </h2>
            </div>

            <ul className="space-y-6 text-lg sm:text-xl text-[var(--ink-muted)] max-w-3xl">
              <li className="flex items-start gap-4">
                <span className="mt-2.5 h-px w-5 shrink-0 bg-[var(--line-strong)]" />
                <span>An encounter can return 200 OK and still fail to transcribe a life-threatening drug allergy.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2.5 h-px w-5 shrink-0 bg-[var(--line-strong)]" />
                <span>An automated refill can succeed cleanly while kidney function eGFR quietly drops below safety thresholds.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2.5 h-px w-5 shrink-0 bg-[var(--line-strong)]" />
                <span>A patient visit can be documented in full without anyone checking whether their required diabetic retinal exam was ever scheduled.</span>
              </li>
            </ul>

            <p className="mt-12 text-lg sm:text-xl text-[var(--ink)] font-medium max-w-3xl">
              Every one of these is a passing database write, a green uptime monitor, and an unverified patient safety risk.
            </p>

            <div className="mt-16">
              <blockquote className="border-l-2 border-[var(--line-strong)] pl-6 text-2xl sm:text-3xl font-medium leading-snug text-balance text-[var(--ink)]">
                &ldquo;The most expensive thing in healthcare is an assumption nobody verified.&rdquo;
              </blockquote>
            </div>

          </div>
        </section>

        <section id="scene-diverge" aria-labelledby="diverge-heading" className="bg-[var(--paper-sunken)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="diverge-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                Nothing was answering the second question.
              </h2>
            </div>

            <div className="grid items-start gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
              <div className="h-full bg-[var(--paper-raised)] p-8">
                <h3 className="mb-5 text-xl font-medium text-[var(--ink)]">Is the data stored?</h3>
                <ul className="space-y-2.5 font-mono text-sm text-[var(--ink-muted)]">
                  <li className="flex items-center gap-2"><span>—</span> EHR database tables.</li>
                  <li className="flex items-center gap-2"><span>—</span> HL7 / FHIR JSON logs.</li>
                  <li className="flex items-center gap-2"><span>—</span> Billing claims & CPT codes.</li>
                  <li className="flex items-center gap-2"><span>—</span> Server uptime & API latency.</li>
                </ul>
              </div>

              <div className="h-full bg-[var(--paper-raised)] p-8">
                <h3 className="mb-5 text-xl font-medium text-[var(--ink)]">Is the care clinically verified?</h3>
                <p className="text-lg text-[var(--ink)] font-medium">
                  ClinIQ maintains a standing model to answer this one.
                </p>
                <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">
                  Does this patient’s current regimen satisfy clinical guidelines? Was the required annual screening proven? Are the medication dosages bounded by lab evidence?
                </p>
              </div>
            </div>

            <div className="mt-12 space-y-5 text-lg sm:text-xl text-[var(--ink-muted)] max-w-3xl">
              <p>
                Hospital IT answers &ldquo;is the server responding?&rdquo; Scribes answer &ldquo;did we transcribe speech into text?&rdquo; Nothing answers &ldquo;is this patient care invariant holding right now?&rdquo;
              </p>
              <p className="text-[var(--ink)] font-medium">
                Because until now, nobody extracted and continuously proved the clinical invariants.
              </p>
            </div>

          </div>
        </section>

        <section id="scene-usual-answers" aria-labelledby="usual-answers-heading" className="bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              
              <div className="self-start lg:sticky lg:top-28">
                <h2 id="usual-answers-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15] mb-6">
                  Why traditional healthtech doesn&apos;t close the gap.
                </h2>
                <p className="text-lg text-[var(--ink)] leading-relaxed">
                  These tools answer &ldquo;what happened?&rdquo;. ClinIQ answers &ldquo;what is clinically supposed to be true, and is it holding?&rdquo;
                </p>
              </div>

              <div>
                {accordionItems.map((item) => {
                  const isOpen = openAccordion === item.id;
                  return (
                    <div key={item.id} className="border-t border-[var(--line)] last:border-b">
                      <h3>
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(isOpen ? "" : item.id)}
                          aria-expanded={isOpen}
                          className="group flex w-full items-baseline justify-between py-6 text-left"
                        >
                          <div className="flex items-baseline gap-4">
                            <span className="font-mono text-xs text-[var(--ink-faint)]">{item.number}</span>
                            <span className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ink)]">
                              {item.title}
                            </span>
                          </div>
                          <span aria-hidden="true" className="relative block size-3 shrink-0 self-center">
                            <span className="absolute left-0 top-1/2 h-px w-full bg-[var(--ink-muted)] group-hover:bg-[var(--ink)]" />
                            <span
                              className={`absolute left-1/2 top-0 h-full w-px bg-[var(--ink-muted)] transition-transform duration-300 group-hover:bg-[var(--ink)] ${
                                isOpen ? "rotate-90 opacity-0" : ""
                              }`}
                            />
                          </span>
                        </button>
                      </h3>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-6 pb-8 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-8 items-center">
                              
                              <div className="h-36 w-full max-w-[14rem] rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-3 flex items-center justify-center">
                                {item.diagramType === "ehr" && (
                                  <svg viewBox="0 0 160 100" className="w-full h-full text-[var(--ink)]">
                                    <polygon points="80,20 130,45 80,70 30,45" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" />
                                    <polygon points="80,35 130,60 80,85 30,60" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.75" />
                                    <line x1="30" y1="45" x2="30" y2="60" stroke="currentColor" strokeWidth="1" />
                                    <line x1="130" y1="45" x2="130" y2="60" stroke="currentColor" strokeWidth="1" />
                                    <line x1="80" y1="70" x2="80" y2="85" stroke="currentColor" strokeWidth="1" />
                                    <circle cx="80" cy="45" r="3" fill="var(--state-unverified)" />
                                    <text x="80" y="96" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="currentColor" fillOpacity="0.7">
                                      PASSIVE RECORD
                                    </text>
                                  </svg>
                                )}

                                {item.diagramType === "scribe" && (
                                  <svg viewBox="0 0 160 100" className="w-full h-full text-[var(--ink)]">
                                    <path d="M 20,50 Q 40,20 60,50 T 100,50 T 140,50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
                                    <polygon points="80,25 120,45 80,65 40,45" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" />
                                    <circle cx="60" cy="45" r="3" fill="var(--state-proven)" />
                                    <circle cx="100" cy="45" r="3" fill="var(--state-broken)" />
                                    <text x="80" y="85" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--state-broken)">
                                      UNCHECKED HALLUCINATION
                                    </text>
                                  </svg>
                                )}

                                {item.diagramType === "observability" && (
                                  <svg viewBox="0 0 160 100" className="w-full h-full text-[var(--ink)]">
                                    <polyline points="20,70 50,70 70,30 90,70 110,50 140,50" fill="none" stroke="var(--state-proven)" strokeWidth="1.5" />
                                    <line x1="20" y1="80" x2="140" y2="80" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
                                    <circle cx="70" cy="30" r="3" fill="var(--state-proven)" />
                                    <text x="80" y="96" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="currentColor" fillOpacity="0.7">
                                      200 OK HEALTHY (BLIND)
                                    </text>
                                  </svg>
                                )}
                              </div>

                              <p className="text-sm sm:text-base leading-relaxed text-[var(--ink-muted)]">
                                {item.description}
                              </p>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </section>

        <section id="scene-how-it-works" aria-labelledby="how-it-works-heading" className="bg-[var(--paper-sunken)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                How it works
              </h2>
            </div>

            <ol className="grid gap-x-8 gap-y-7 md:grid-cols-2">
              
              <li className="iso-card border border-[var(--line)] bg-[var(--paper-raised)] p-8 rounded-sm">
                <p className="font-mono text-xs text-[var(--ink-faint)]">01</p>
                <h3 className="mt-4 text-xl font-medium tracking-tight text-[var(--ink)]">
                  Connect & Ingest
                </h3>
                <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">
                  Install ClinIQ on your EHR stream, Medplum FHIR R4 repository, and telehealth WebRTC endpoints. Read-only. Patient PHI is processed in isolated sandboxes and is never used to train global models.
                </p>
              </li>

              <li className="iso-card border border-[var(--line)] bg-[var(--paper-raised)] p-8 rounded-sm">
                <p className="font-mono text-xs text-[var(--ink-faint)]">02</p>
                <h3 className="mt-4 text-xl font-medium tracking-tight text-[var(--ink)]">
                  Extract Invariants
                </h3>
                <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">
                  ClinIQ parses encounters and infers clinical capabilities and behaviors: the exact guarantees your medical protocols make. &ldquo;Metformin requires annual renal clearance.&rdquo; &ldquo;Diabetic patients require annual retinal screening.&rdquo; Extracted from longitudinal evidence, not outdated manuals.
                </p>
              </li>

              <li className="iso-card border border-[var(--line)] bg-[var(--paper-raised)] p-8 rounded-sm">
                <p className="font-mono text-xs text-[var(--ink-faint)]">03</p>
                <h3 className="mt-4 text-xl font-medium tracking-tight text-[var(--ink)]">
                  Prove with Evidence
                </h3>
                <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">
                  For each clinical claim, ClinIQ designs an automated verification experiment, runs it in an isolated sandbox, and records observed LOINC codes and RxNorm prescriptions. A guarantee becomes <strong className="text-[var(--state-proven)]">Proven</strong> only when evidence holds, and <strong className="text-[var(--state-broken)]">Broken</strong> when a real failure reproduces.
                </p>
              </li>

              <li className="iso-card border border-[var(--line)] bg-[var(--paper-raised)] p-8 rounded-sm">
                <p className="font-mono text-xs text-[var(--ink-faint)]">04</p>
                <h3 className="mt-4 text-xl font-medium tracking-tight text-[var(--ink)]">
                  Continuous Clinical Sentry
                </h3>
                <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">
                  Every doctor encounter, lab result ingestion, and prescription renewal is cross-checked against the standing model. When an action puts a patient invariant at risk, ClinIQ flags the exact regression before the chart is locked or the medication is dispensed.
                </p>
              </li>

            </ol>

            <p className="mt-12 text-lg text-[var(--ink)] max-w-3xl font-medium">
              The output is not an opaque risk score. It is a ledger of things your medical protocols promise, each marked with whether it holds and the exact evidence backing it.
            </p>

          </div>
        </section>

        <section id="scene-lifecycle" aria-labelledby="lifecycle-heading" className="bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="lifecycle-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                Nothing crashed. The tests passed. But the patient was at risk.
              </h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
              
              <article className="iso-card border border-[var(--line)] bg-[var(--paper-raised)] p-7 rounded-sm">
                <span aria-hidden="true" className="pointer-events-none absolute size-1.5 border-t border-l border-[var(--ink)]/40 -top-px -left-px" />
                <span aria-hidden="true" className="pointer-events-none absolute size-1.5 border-t border-r border-[var(--ink)]/40 -top-px -right-px" />
                <span aria-hidden="true" className="pointer-events-none absolute size-1.5 border-b border-l border-[var(--ink)]/40 -bottom-px -left-px" />
                <span aria-hidden="true" className="pointer-events-none absolute size-1.5 border-r border-b border-[var(--ink)]/40 -right-px -bottom-px" />

                <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
                  <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-xs text-[var(--state-broken)] font-semibold">
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                      <path d="M8 2.5 13.5 8 8 13.5 2.5 8Z" fill="currentColor" />
                    </svg>
                    Broken Invariant
                  </span>
                  <span className="font-mono text-[11px] text-[var(--ink-faint)]">LOINC: 2339-0 & 33914-3</span>
                </div>

                <div className="py-6">
                  <p className="font-medium tracking-tight text-balance text-[var(--ink)] text-2xl leading-snug">
                    Every Type 2 Diabetic on Metformin has verified annual renal & retinal checks
                  </p>
                </div>

                <div className="border-t border-[var(--line)] pt-4">
                  <p className="font-mono leading-relaxed text-xs text-[var(--ink-muted)]">
                    143 of 500 cohort records unverified. Dosage was doubled without confirming eGFR &gt; 45 mL/min.
                  </p>
                </div>
              </article>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line-strong)]">
                      <th scope="col" className="py-3 pr-3 font-mono text-[var(--ink-faint)] font-normal">Beat</th>
                      <th scope="col" className="py-3 pr-4 font-mono text-[var(--ink-faint)] font-normal">State</th>
                      <th scope="col" className="py-3 font-mono text-[var(--ink-faint)] font-normal">What ClinIQ observed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycleBeats.map((b) => (
                      <tr key={b.beat} className="border-b border-[var(--line)] align-top">
                        <td className="py-3 pr-3 font-mono text-[var(--ink-faint)]">{b.beat}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.14em] text-[10px] font-medium ${
                              b.state === "proven"
                                ? "text-[var(--state-proven)]"
                                : b.state === "broken"
                                ? "text-[var(--state-broken)]"
                                : b.state === "investigating"
                                ? "text-[var(--state-investigating)]"
                                : "text-[var(--state-unverified)]"
                            }`}
                          >
                            {b.state === "proven" && <span className="size-2 rounded-full bg-emerald-500" />}
                            {b.state === "broken" && <span className="size-2 rotate-45 bg-rose-500" />}
                            {b.state === "investigating" && <span className="size-2 rounded-full border border-indigo-500 animate-pulse" />}
                            {b.state === "unverified" && <span className="size-2 rounded-full border border-slate-400" />}
                            {b.state}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-[var(--ink-muted)]">
                          <p className="font-medium text-[var(--ink)]">{b.observation}</p>
                          <p className="text-[11px] text-[var(--ink-faint)] mt-0.5">{b.details}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            <p className="mt-12 text-base sm:text-lg text-[var(--ink)] font-medium max-w-3xl">
              This is a clinical regression, not an afterthought. ClinIQ knew this guarantee was true yesterday, and detected the exact moment it stopped holding.
            </p>

          </div>
        </section>

        <section id="scene-vocabulary" aria-labelledby="vocabulary-heading" className="bg-[var(--paper-sunken)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="vocabulary-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                The vocabulary
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line-strong)]">
                    <th scope="col" className="py-3 pr-6 font-mono text-xs text-[var(--ink-faint)] font-normal">Term</th>
                    <th scope="col" className="py-3 font-mono text-xs text-[var(--ink-faint)] font-normal">What it means in ClinIQ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--line)] align-top">
                    <th scope="row" className="py-4 pr-6 font-medium text-[var(--ink)] whitespace-nowrap font-mono text-xs">
                      Clinical Capability
                    </th>
                    <td className="py-4 text-[var(--ink-muted)]">
                      A core medical specialty domain (e.g., Cardiology, Endocrinology, Ambient Documentation, Population Health). Contains clinical invariants.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--line)] align-top">
                    <th scope="row" className="py-4 pr-6 font-medium text-[var(--ink)] whitespace-nowrap font-mono text-xs">
                      Clinical Invariant
                    </th>
                    <td className="py-4 text-[var(--ink-muted)]">
                      One non-negotiable claim your medical protocol makes about patient safety or care standards. The atom of the standing model.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--line)] align-top">
                    <th scope="row" className="py-4 pr-6 font-medium text-[var(--ink)] whitespace-nowrap font-mono text-xs">
                      Investigation Run
                    </th>
                    <td className="py-4 text-[var(--ink-muted)]">
                      An isolated execution that evaluates whether a clinical invariant holds across longitudinal FHIR resources and patient encounters.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--line)] align-top">
                    <th scope="row" className="py-4 pr-6 font-medium text-[var(--ink)] whitespace-nowrap font-mono text-xs">
                      Diagnostic Evidence
                    </th>
                    <td className="py-4 text-[var(--ink-muted)]">
                      What an investigation actually observed: LOINC lab readings, RxNorm NDC codes, ICD-10 encounter attestations, and WebRTC recordings.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--line)] align-top">
                    <th scope="row" className="py-4 pr-6 font-medium text-[var(--ink)] whitespace-nowrap font-mono text-xs">
                      Safety Incident
                    </th>
                    <td className="py-4 text-[var(--ink-muted)]">
                      A reproduced clinical failure. Not a lint warning, not a suspicion, but a broken invariant proven in sandbox execution.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--line)] align-top">
                    <th scope="row" className="py-4 pr-6 font-medium text-[var(--ink)] whitespace-nowrap font-mono text-xs">
                      Longitudinal Ledger
                    </th>
                    <td className="py-4 text-[var(--ink-muted)]">
                      The durable history of every clinical invariant: when it was discovered, every encounter it touched, and every state it moved through.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </section>

        <section id="scene-quality-graph" aria-labelledby="quality-graph-heading" className="bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="quality-graph-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                See your clinical safety guarantees, all at once.
              </h2>
            </div>

            <div className="space-y-5 text-lg text-[var(--ink-muted)] max-w-3xl">
              <p>
                Capabilities, the invariants inside them, the live investigations attached to each, and the diagnostic evidence underneath, as one unified graph you can inspect.
              </p>
              <p>
                Verification state is carried by geometric shape and weight, not colour alone, so a broken invariant is instantly discernible in any environment.
              </p>
            </div>

            <div className="mt-12 rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-6 sm:p-10 flex items-center justify-center">
              <svg viewBox="0 0 500 240" className="w-full max-w-xl text-[var(--ink)] select-none">
                <polygon points="250,30 400,105 250,180 100,105" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                <polygon points="250,55 400,130 250,205 100,130" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />

                <line x1="250" y1="30" x2="160" y2="75" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="250" y1="30" x2="340" y2="75" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="160" y1="75" x2="190" y2="120" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="340" y1="75" x2="310" y2="120" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="250" y1="30" x2="250" y2="105" stroke="var(--primary)" strokeWidth="1.25" />

                <circle cx="250" cy="30" r="5" fill="var(--ink)" />
                <circle cx="160" cy="75" r="4.5" fill="var(--state-proven)" />
                <circle cx="340" cy="75" r="4.5" fill="var(--state-proven)" />
                
                <polygon points="250,97 258,105 250,113 242,105" fill="var(--state-broken)" />
                
                <circle cx="190" cy="120" r="4" fill="var(--state-investigating)" />
                <circle cx="310" cy="120" r="4" fill="var(--state-unverified)" />

                <text x="250" y="18" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="currentColor" fontWeight="600">CLINICAL SUITE ROOT</text>
                <text x="140" y="70" textAnchor="end" fontSize="8" fontFamily="monospace" fill="var(--state-proven)">Cardio Invariants (PROVEN)</text>
                <text x="360" y="70" textAnchor="start" fontSize="8" fontFamily="monospace" fill="var(--state-proven)">Endocrinology (PROVEN)</text>
                <text x="250" y="130" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--state-broken)">Metformin / eGFR Invariant (BROKEN)</text>
              </svg>
            </div>

          </div>
        </section>

        <section id="scene-swarm" aria-labelledby="swarm-heading" className="bg-[var(--paper-sunken)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="swarm-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                Delegate a morning&apos;s chart audits. Close the laptop.
              </h2>
            </div>

            <div className="space-y-5 text-lg text-[var(--ink-muted)] max-w-3xl">
              <p>
                Ask for wide operations, like &ldquo;verify every diabetic care gap and audit yesterday’s ambient encounter notes&rdquo;, and ClinIQ dispatches named sub-agents, each running server-side in isolated sandboxes.
              </p>
              <p>
                They appear as live telemetry cards: what the agent is named, what it was tasked to prove, the exact LOINC line it is executing, and what it concluded.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {swarmAgents.map((agent) => {
                const isConcluded = agent.status === "concluded";
                const isStopped = agent.status === "stopped";
                return (
                  <article
                    key={agent.id}
                    className="iso-card rounded-md border border-[var(--line)] bg-[var(--paper-raised)] p-6 transition-all hover:border-[var(--line-strong)]"
                  >
                    <header className="flex items-baseline justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            isConcluded
                              ? "bg-emerald-500"
                              : isStopped
                              ? "bg-amber-500"
                              : "bg-indigo-500 animate-pulse"
                          }`}
                        />
                        <h3 className="font-mono text-sm font-semibold text-[var(--ink)]">{agent.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStopAgent(agent.id)}
                        className="font-mono text-xs text-[var(--ink-faint)] underline underline-offset-4 hover:text-[var(--ink)]"
                      >
                        {isStopped ? "Resume" : isConcluded ? "Re-run" : "Stop"}
                      </button>
                    </header>

                    <p className="mt-2 text-xs sm:text-sm text-[var(--ink-muted)]">{agent.objective}</p>

                    <div
                      role="progressbar"
                      aria-valuenow={agent.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-4 h-1 w-full bg-[var(--line)] rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full transition-all duration-500 ${
                          isConcluded
                            ? "bg-emerald-500"
                            : isStopped
                            ? "bg-amber-500"
                            : "bg-[var(--ink)]"
                        }`}
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono text-[var(--ink-faint)]">
                      <span className="truncate max-w-[80%]">{agent.currentStep}</span>
                      <span>{agent.progress}%</span>
                    </div>

                    {agent.result && (
                      <div className="mt-3 rounded bg-[var(--paper-sunken)] px-3 py-2 text-xs font-mono text-[var(--ink)] border border-[var(--line)]">
                        {agent.result}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <p className="mt-8 text-xs font-mono text-[var(--ink-faint)]">
              These sub-agents run on ClinIQ&apos;s isolated infrastructure. Closing the browser tab does not terminate their evaluation.
            </p>

          </div>
        </section>

        <section id="scene-states" aria-labelledby="states-heading" className="bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="states-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                Five states, and one of them is an admission.
              </h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-16 items-start">
              
              <dl className="space-y-6">
                <div className="grid gap-2 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt>
                    <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-xs text-[var(--state-proven)] font-medium">
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <circle cx="8" cy="8" r="5" fill="currentColor" />
                      </svg>
                      Proven
                    </span>
                  </dt>
                  <dd className="text-sm text-[var(--ink-muted)]">
                    Diagnostic evidence supports the clinical invariant at this exact patient encounter.
                  </dd>
                </div>

                <div className="grid gap-2 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt>
                    <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-xs text-[var(--state-broken)] font-semibold">
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <path d="M8 2.5 13.5 8 8 13.5 2.5 8Z" fill="currentColor" />
                      </svg>
                      Broken
                    </span>
                  </dt>
                  <dd className="text-sm text-[var(--ink-muted)]">
                    A clinical violation or safety risk reproduced in sandbox simulation.
                  </dd>
                </div>

                <div className="grid gap-2 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt>
                    <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-xs text-[var(--state-investigating)] font-normal">
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.75" />
                        <path d="M8 3a5 5 0 0 1 0 10Z" fill="currentColor" />
                      </svg>
                      Investigating
                    </span>
                  </dt>
                  <dd className="text-sm text-[var(--ink-muted)]">
                    An automated verification run is executing in a background container right now.
                  </dd>
                </div>

                <div className="grid gap-2 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt>
                    <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-xs text-[var(--state-unverified)] font-normal">
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      Not verified
                    </span>
                  </dt>
                  <dd className="text-sm text-[var(--ink-muted)]">
                    ClinIQ discovered this care claim in your protocols and has not yet completed evidence gathering.
                  </dd>
                </div>

                <div className="grid gap-2 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt>
                    <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-xs text-[var(--state-inconclusive)] font-normal">
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <rect x="3.25" y="3.25" width="9.5" height="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                      </svg>
                      Inconclusive
                    </span>
                  </dt>
                  <dd className="text-sm text-[var(--ink-muted)]">
                    ClinIQ evaluated the data and could not deterministically establish proof or failure.
                  </dd>
                </div>
              </dl>

              <aside className="rounded-lg border border-[var(--line)] bg-[var(--paper-raised)] p-6 sm:p-8 max-w-sm">
                <p className="mb-3 text-base font-medium text-[var(--ink)]">Inconclusive is a feature.</p>
                <div className="space-y-4 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
                  <p>
                    Every conventional AI health tool is incentivised to round uncertainty up into a confident guess, because guesses look like answers.
                  </p>
                  <p>
                    A clinical invariant ClinIQ could not verify says so, in its own state, permanently visible. If you cannot trust the &ldquo;I don&apos;t know&rdquo;, you cannot trust the &ldquo;Proven&rdquo; either.
                  </p>
                </div>
              </aside>

            </div>

          </div>
        </section>

        <section id="scene-portals" aria-labelledby="portals-heading" className="bg-[var(--paper-sunken)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="portals-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                Experience the ClinIQ Portal Network
              </h2>
              <p className="mt-2 text-base text-[var(--ink-muted)]">
                Instant 1-click access to all authenticated persona surfaces with pre-loaded mock clinical data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <Link href="/patient/dashboard" className="group">
                <div className="iso-card h-full rounded border border-[var(--line)] bg-[var(--paper-raised)] p-6 transition-all hover:border-[var(--line-strong)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[var(--ink)]">Patient Portal</span>
                    <ArrowUpRight className="size-4 text-[var(--ink-faint)] group-hover:text-[var(--ink)] transition-colors" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-[var(--ink)]">Sarah Johnson</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">
                    LOINC vitals, diabetic care plans, prescription refills, and WebRTC telehealth room.
                  </p>
                  <span className="mt-4 inline-block font-mono text-[11px] text-[var(--primary)] font-medium">
                    Open Patient Chart →
                  </span>
                </div>
              </Link>

              <Link href="/provider/scribe" className="group">
                <div className="iso-card h-full rounded border border-[var(--line)] bg-[var(--paper-raised)] p-6 transition-all hover:border-[var(--line-strong)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[var(--ink)]">Provider Scribe</span>
                    <ArrowUpRight className="size-4 text-[var(--ink-faint)] group-hover:text-[var(--ink)] transition-colors" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-[var(--ink)]">Ambient Recorder</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">
                    Live Deepgram audio capture, SOAP note structuring, and 1-click digital attestation.
                  </p>
                  <span className="mt-4 inline-block font-mono text-[11px] text-[var(--primary)] font-medium">
                    Launch Scribe →
                  </span>
                </div>
              </Link>

              <Link href="/admin/users" className="group">
                <div className="iso-card h-full rounded border border-[var(--line)] bg-[var(--paper-raised)] p-6 transition-all hover:border-[var(--line-strong)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[var(--ink)]">Staff Directory</span>
                    <ArrowUpRight className="size-4 text-[var(--ink-faint)] group-hover:text-[var(--ink)] transition-colors" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-[var(--ink)]">Hospital Admin</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">
                    Physician NPI credentials, role-based access control, and HIPAA audit trail logs.
                  </p>
                  <span className="mt-4 inline-block font-mono text-[11px] text-[var(--primary)] font-medium">
                    Manage Staff →
                  </span>
                </div>
              </Link>

              <Link href="/employer/overview" className="group">
                <div className="iso-card h-full rounded border border-[var(--line)] bg-[var(--paper-raised)] p-6 transition-all hover:border-[var(--line-strong)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[var(--ink)]">Employer Health</span>
                    <ArrowUpRight className="size-4 text-[var(--ink-faint)] group-hover:text-[var(--ink)] transition-colors" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-[var(--ink)]">Population ROI</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">
                    $77.7k avoided ER spend, workforce risk stratification, and preventive savings ledger.
                  </p>
                  <span className="mt-4 inline-block font-mono text-[11px] text-[var(--primary)] font-medium">
                    Audit Financials →
                  </span>
                </div>
              </Link>

            </div>

          </div>
        </section>

        <section id="scene-security" aria-labelledby="security-heading" className="bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="security-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                Security, compliance, and deployment
              </h2>
            </div>

            <dl className="border-t border-[var(--line)]">
              <div className="grid gap-2 border-b border-[var(--line)] py-6 sm:grid-cols-[18rem_1fr] sm:gap-8">
                <dt className="font-medium text-[var(--ink)]">Read-only FHIR R4 Integration.</dt>
                <dd className="text-sm text-[var(--ink-muted)] leading-relaxed">
                  ClinIQ connects via standard SMART on FHIR tokens. It never alters your primary medical record without explicit clinician sign-off.
                </dd>
              </div>

              <div className="grid gap-2 border-b border-[var(--line)] py-6 sm:grid-cols-[18rem_1fr] sm:gap-8">
                <dt className="font-medium text-[var(--ink)]">Isolated Sandbox Execution.</dt>
                <dd className="text-sm text-[var(--ink-muted)] leading-relaxed">
                  Verification runs in ephemeral, isolated sandboxes. Nothing ever executes directly in your live hospital production environment.
                </dd>
              </div>

              <div className="grid gap-2 border-b border-[var(--line)] py-6 sm:grid-cols-[18rem_1fr] sm:gap-8">
                <dt className="font-medium text-[var(--ink)]">Zero Training Data Retention.</dt>
                <dd className="text-sm text-[var(--ink-muted)] leading-relaxed">
                  Your patient records, doctor transcripts, and lab results are never stored or used to train foundational AI models.
                </dd>
              </div>

              <div className="grid gap-2 border-b border-[var(--line)] py-6 sm:grid-cols-[18rem_1fr] sm:gap-8">
                <dt className="font-medium text-[var(--ink)]">Instant Kill-Switch Override.</dt>
                <dd className="text-sm text-[var(--ink-muted)] leading-relaxed">
                  A single switch in the admin panel immediately halts all autonomous subagents and freezes background verification runs.
                </dd>
              </div>
            </dl>

          </div>
        </section>

        <section id="scene-faq" aria-labelledby="faq-heading" className="bg-[var(--paper-sunken)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div aria-hidden="true" className="relative mb-12 h-2">
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-px bg-[var(--line)]" />
              <span data-rule-draw="true" className="absolute inset-x-0 top-0 h-1 opacity-60" />
              <span className="absolute left-0 top-0 h-2 w-px bg-[var(--line-strong)]" />
            </div>

            <div className="mb-10">
              <h2 id="faq-heading" className="text-3xl sm:text-4xl font-medium tracking-tight text-balance leading-[1.15]">
                The questions you were about to ask
              </h2>
            </div>

            <div className="border-t border-[var(--line)]">
              <details className="group border-b border-[var(--line)] py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-[var(--ink)]">
                  Isn&apos;t this just another AI scribe tool?
                  <ChevronDown className="size-5 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                  <p>
                    No. An AI scribe transcribes a conversation. ClinIQ maintains a standing, provable model of your clinical invariants and checks every proposed diagnosis and prescription against patient history and lab boundaries before attestation.
                  </p>
                </div>
              </details>

              <details className="group border-b border-[var(--line)] py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-[var(--ink)]">
                  How do we know it isn&apos;t hallucinating clinical invariants?
                  <ChevronDown className="size-5 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                  <p>
                    Clinicians review them. Inferred clinical claims arrive as candidate invariants and require confirmation. Furthermore, an invariant is only marked <strong className="text-[var(--state-proven)]">Proven</strong> or <strong className="text-[var(--state-broken)]">Broken</strong> on the basis of a reproducible sandbox run whose evidence you can open and read.
                  </p>
                </div>
              </details>

              <details className="group border-b border-[var(--line)] py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-[var(--ink)]">
                  Our hospital already has Epic or Cerner.
                  <ChevronDown className="size-5 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                  <p>
                    ClinIQ connects directly via SMART on FHIR R4. It does not replace your EHR record system—it adds continuous invariant verification and ambient documentation on top of it.
                  </p>
                </div>
              </details>

              <details className="group border-b border-[var(--line)] py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-[var(--ink)]">
                  What happens when ClinIQ can&apos;t figure something out?
                  <ChevronDown className="size-5 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                  <p>
                    It marks the invariant <strong className="text-[var(--state-inconclusive)]">Inconclusive</strong> and displays why the analysis stopped. It does not hallucinate a guess, and it does not quietly drop the clinical guarantee.
                  </p>
                </div>
              </details>
            </div>

          </div>
        </section>

        <section id="final-cta" className="border-t border-[var(--line)] bg-[var(--paper)] py-[var(--section-y)]">
          <div className="mx-auto w-full max-w-6xl px-[var(--gutter)]">
            
            <div className="mb-10">
              <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-balance leading-[1.1]">
                Find out what your healthcare workflows actually guarantee.
              </h2>
            </div>

            <p className="text-lg sm:text-xl text-[var(--ink-muted)] max-w-3xl leading-relaxed">
              Connect your FHIR repository. Review the invariants ClinIQ infers. Inspect the evidence for yourself, then let continuous clinical verification protect every patient encounter.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/patient/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] px-6 text-base font-medium transition-opacity hover:opacity-90 shadow-xs"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/provider/scribe"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--line-strong)] text-[var(--ink)] px-6 text-base font-medium transition-colors hover:bg-[var(--paper-sunken)]"
              >
                Open Provider Scribe
              </Link>
            </div>

            <p className="mt-6 text-xs font-mono text-[var(--ink-faint)]">
              Medplum FHIR R4 Compliant · Zero PHI Retention · Instant Access
            </p>

          </div>
        </section>

      </main>

      <footer
        ref={footerRef}
        onMouseMove={handleLogoMouseMove}
        onMouseEnter={() => setIsHoveringLogo(true)}
        onMouseLeave={() => setIsHoveringLogo(false)}
        className="border-t border-[var(--line)] bg-[var(--paper-sunken)] relative overflow-hidden"
      >
        <div className="mx-auto w-full max-w-6xl px-[var(--gutter)] py-16">
          <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(4,1fr)]">
            
            <div>
              <p className="font-mono text-sm font-semibold tracking-tight text-[var(--ink)]">ClinIQ</p>
              <p className="mt-3 max-w-[28ch] text-xs text-[var(--ink-muted)] leading-relaxed">
                The clinical correctness & ambient intelligence platform for zero-error healthcare.
              </p>
            </div>

            <nav aria-label="Footer Navigation" className="contents">
              <div>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)]">Product</h3>
                <ul className="space-y-2.5 text-xs text-[var(--ink-muted)]">
                  <li><Link href="/patient/dashboard" className="hover:text-[var(--ink)]">Patient Portal</Link></li>
                  <li><Link href="/provider/scribe" className="hover:text-[var(--ink)]">Ambient Scribe</Link></li>
                  <li><Link href="/patient/care-call" className="hover:text-[var(--ink)]">WebRTC Telehealth</Link></li>
                  <li><Link href="/employer/overview" className="hover:text-[var(--ink)]">Population ROI</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)]">Architecture</h3>
                <ul className="space-y-2.5 text-xs text-[var(--ink-muted)]">
                  <li><a href="#scene-how-it-works" className="hover:text-[var(--ink)]">Invariant Engine</a></li>
                  <li><a href="#scene-quality-graph" className="hover:text-[var(--ink)]">Quality Graph</a></li>
                  <li><a href="#scene-swarm" className="hover:text-[var(--ink)]">Subagent Swarm</a></li>
                  <li><a href="#scene-vocabulary" className="hover:text-[var(--ink)]">Terminology</a></li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)]">Standards</h3>
                <ul className="space-y-2.5 text-xs text-[var(--ink-muted)]">
                  <li><Link href="/patient/health-links" className="hover:text-[var(--ink)]">SMART Health Links</Link></li>
                  <li><a href="https://medplum.com" target="_blank" rel="noreferrer" className="hover:text-[var(--ink)]">Medplum FHIR R4</a></li>
                  <li><Link href="/provider/fax" className="hover:text-[var(--ink)]">Document OCR</Link></li>
                  <li><Link href="/admin/audit" className="hover:text-[var(--ink)]">Audit Ledger</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)]">Compliance</h3>
                <ul className="space-y-2.5 text-xs text-[var(--ink-muted)]">
                  <li><a href="#scene-security" className="hover:text-[var(--ink)]">HIPAA Statement</a></li>
                  <li><a href="#scene-security" className="hover:text-[var(--ink)]">SOC2 Type II</a></li>
                  <li><a href="#scene-security" className="hover:text-[var(--ink)]">Zero Data Retention</a></li>
                  <li><Link href="/admin/users" className="hover:text-[var(--ink)]">NPI Registry</Link></li>
                </ul>
              </div>
            </nav>

          </div>

          <p className="mt-16 border-t border-[var(--line)] pt-8 text-xs font-mono text-[var(--ink-faint)]">
            © 2026 ClinIQ Health Technologies Inc. Built because unverified assumptions are the most dangerous thing in medicine.
          </p>
        </div>

        {/* Giant Outlined ClinIQ Stroke Logo with Radial Flashlight Mask */}
        <div
          aria-hidden="true"
          className="relative mt-8 h-[0.72em] select-none overflow-hidden text-[19vw] leading-none pointer-events-none"
        >
          {/* Base Stroke */}
          <span
            className="absolute inset-x-0 top-0 text-center font-bold tracking-[-0.03em] text-transparent"
            style={{
              WebkitTextStroke: "1px var(--line-strong)",
            }}
          >
            ClinIQ
          </span>

          {/* Flashlight Glow Stroke */}
          <span
            className="absolute inset-x-0 top-0 text-center font-bold tracking-[-0.03em] text-transparent transition-opacity duration-200"
            style={{
              WebkitTextStroke: "1.5px var(--ink)",
              textShadow: "0 0 24px var(--primary)",
              WebkitMaskImage: `radial-gradient(280px circle at ${mousePos.x}% ${mousePos.y}%, black 30%, transparent 75%)`,
              maskImage: `radial-gradient(280px circle at ${mousePos.x}% ${mousePos.y}%, black 30%, transparent 75%)`,
              opacity: isHoveringLogo ? 0.9 : 0,
            }}
          >
            ClinIQ
          </span>
        </div>
      </footer>

    </div>
  );
}



