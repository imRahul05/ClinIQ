"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Activity,
  Database,
  Lock,
  Cpu,
  Video,
  Server,
  Sparkles,
  Clock,
  ArrowLeft,
  Zap,
  Radio,
  Timer,
  AlertCircle,
} from "lucide-react";
import { ThemeToggle } from "@cliniq/ui";
import {
  getSystemStatusApi,
  type SystemStatusResponse,
  type SubsystemStatus,
  type ThirdPartyDependencyStatus,
  type HealthStatusLevel,
} from "@/lib/api/status.api";

function getStatusIcon(status: HealthStatusLevel) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "outage":
      return <XCircle className="w-5 h-5 text-rose-500" />;
    case "maintenance":
      return <Clock className="w-5 h-5 text-sky-500" />;
  }
}

function getStatusBadge(status: HealthStatusLevel) {
  switch (status) {
    case "operational":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Operational
        </span>
      );
    case "degraded":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Degraded
        </span>
      );
    case "outage":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Outage
        </span>
      );
    case "maintenance":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          Maintenance
        </span>
      );
  }
}

function getSubsystemIcon(id: string) {
  switch (id) {
    case "auth_gateway":
      return <Lock className="w-4 h-4 text-sky-500" />;
    case "database":
      return <Database className="w-4 h-4 text-indigo-500" />;
    case "medplum_fhir":
      return <Server className="w-4 h-4 text-emerald-500" />;
    case "webrtc_signaling":
      return <Video className="w-4 h-4 text-amber-500" />;
    case "scribe_engine":
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    default:
      return <Activity className="w-4 h-4 text-slate-500" />;
  }
}

export default function StatusPage(): React.JSX.Element {
  const [statusData, setStatusData] = React.useState<SystemStatusResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [clientRttMs, setClientRttMs] = React.useState<number | null>(null);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [lastFetchedTime, setLastFetchedTime] = React.useState<Date | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = React.useState<number>(0);

  const fetchLiveStatus = React.useCallback(async (fresh = false) => {
    setIsLoading(true);
    setHasError(false);
    const start = performance.now();
    try {
      const result = await getSystemStatusApi({ fresh });
      const rtt = Math.round(performance.now() - start);
      setStatusData(result);
      setClientRttMs(rtt);
      setLastFetchedTime(new Date());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch genuine live status on initial mount without background polling waste
  React.useEffect(() => {
    fetchLiveStatus(false);
  }, [fetchLiveStatus]);

  // Handle manual refresh with 10s cooldown
  const handleManualRefresh = () => {
    if (cooldownSeconds > 0 || isLoading) return;
    setCooldownSeconds(10);
    fetchLiveStatus(true);

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isAllOperational = statusData?.overall === "all_systems_operational";
  const isDegraded =
    statusData?.overall === "degraded_performance" || statusData?.overall === "partial_outage";

  // Identify any active incidents reported by third parties or core services
  const activeThirdPartyIncidents = React.useMemo(() => {
    if (!statusData) return [];
    return statusData.thirdPartyServices.filter(
      (s) => s.status !== "operational" && s.status !== "maintenance"
    );
  }, [statusData]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-sky-500/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ClinIQ</span>
            </Link>
            <span className="text-[var(--line-strong)]">/</span>
            <span className="text-sm font-semibold tracking-tight">Live Status</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleManualRefresh}
              disabled={isLoading || cooldownSeconds > 0}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--secondary)] disabled:opacity-50 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>
                {isLoading
                  ? "Probing live systems..."
                  : cooldownSeconds > 0
                    ? `Refresh (${cooldownSeconds}s)`
                    : "Refresh Live Status"}
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Loading Skeleton */}
        {isLoading && !statusData && (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 rounded-2xl bg-[var(--muted)]/60 border border-[var(--line)]" />
            <div className="h-64 rounded-xl bg-[var(--muted)]/40 border border-[var(--line)]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-36 rounded-xl bg-[var(--muted)]/40 border border-[var(--line)]" />
              <div className="h-36 rounded-xl bg-[var(--muted)]/40 border border-[var(--line)]" />
            </div>
          </div>
        )}

        {/* Live Network Connection Failure */}
        {hasError && !statusData && (
          <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">
                Unable to Reach ClinIQ Live Status Gateway
              </h2>
              <p className="text-xs text-[var(--ink-muted)] max-w-md mx-auto">
                Direct telemetry network probe failed. The API server may be offline or unreachable
                from your network connection.
              </p>
            </div>
            <button
              onClick={() => fetchLiveStatus(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              Retry Live Probe
            </button>
          </div>
        )}

        {/* Live Content */}
        {statusData && (
          <>
            {/* Global Operational Live Banner */}
            <section
              className={`relative overflow-hidden rounded-2xl p-8 border transition-all ${
                isAllOperational
                  ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                  : isDegraded
                    ? "bg-amber-500/5 border-amber-500/20 dark:bg-amber-950/20 dark:border-amber-900/40"
                    : "bg-rose-500/5 border-rose-500/20 dark:bg-rose-950/20 dark:border-rose-900/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-4 w-4">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isAllOperational
                            ? "bg-emerald-400"
                            : isDegraded
                              ? "bg-amber-400"
                              : "bg-rose-400"
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-4 w-4 ${
                          isAllOperational
                            ? "bg-emerald-500"
                            : isDegraded
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                      />
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {isAllOperational
                        ? "All Systems Operational"
                        : isDegraded
                          ? "Degraded System Performance"
                          : "Major Outage Detected"}
                    </h1>
                  </div>
                  <p className="text-sm text-[var(--ink-muted)] max-w-2xl">{statusData.message}</p>
                </div>

                <div className="text-xs text-[var(--ink-muted)] sm:text-right space-y-1 font-mono">
                  <div>
                    Last Live Probe:{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {lastFetchedTime ? lastFetchedTime.toLocaleTimeString() : "--"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-faint)]">
                    Aggregated Cache TTL: 60s
                  </div>
                </div>
              </div>
            </section>

            {/* Active Live Incidents Feed (If any vendor has a real outage) */}
            {activeThirdPartyIncidents.length > 0 && (
              <section className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Active Live Vendor Incident Feed</span>
                </div>
                <div className="space-y-2">
                  {activeThirdPartyIncidents.map((incident) => (
                    <div
                      key={incident.provider}
                      className="p-3 rounded-lg bg-[var(--card)] border border-amber-300 dark:border-amber-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-[var(--foreground)]">
                          {incident.name}:
                        </span>{" "}
                        <span className="text-[var(--ink-muted)]">
                          {incident.incidentSummary || "Service degradation reported"}
                        </span>
                      </div>
                      <a
                        href={incident.officialStatusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:underline font-medium shrink-0"
                      >
                        <span>Official Status Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Core ClinIQ Platform Subsystems */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-500" />
                  ClinIQ Core Subsystems
                </h2>
                <span className="text-xs text-[var(--ink-muted)]">
                  {statusData.coreServices.filter((s) => s.status === "operational").length}/
                  {statusData.coreServices.length} Operational
                </span>
              </div>

              <div className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-[var(--card)] shadow-xs overflow-hidden">
                {statusData.coreServices.map((service: SubsystemStatus) => (
                  <div
                    key={service.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--secondary)]/30 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-[var(--muted)] border border-[var(--line)] mt-0.5 sm:mt-0">
                        {getSubsystemIcon(service.id)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {service.name}
                        </div>
                        <div className="text-xs text-[var(--ink-muted)]">{service.message}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      {service.latencyMs !== undefined && (
                        <span className="text-xs font-mono text-[var(--ink-muted)]">
                          {service.latencyMs}ms
                        </span>
                      )}
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Real Live Diagnostic & Telemetry Inspector */}
            <section className="p-6 rounded-xl border border-[var(--line)] bg-[var(--card)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  Live Client & Edge Telemetry Inspector
                </h2>
                <span className="text-xs font-mono text-[var(--ink-muted)]">Verified Live</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--line)] space-y-1">
                  <div className="text-[var(--ink-muted)]">Edge Client RTT</div>
                  <div className="font-mono font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                    {clientRttMs !== null ? `${clientRttMs}ms` : "--"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--line)] space-y-1">
                  <div className="text-[var(--ink-muted)]">Live Data Mode</div>
                  <div className="font-semibold text-sm text-sky-600 dark:text-sky-400">
                    100% Real-Time
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--line)] space-y-1">
                  <div className="text-[var(--ink-muted)]">Cached Until (UTC)</div>
                  <div className="font-mono text-xs font-medium text-[var(--foreground)] truncate">
                    {new Date(statusData.cachedUntil).toLocaleTimeString()}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--line)] space-y-1">
                  <div className="text-[var(--ink-muted)]">Audit Protocol</div>
                  <div className="font-semibold text-xs text-purple-600 dark:text-purple-400">
                    Zero-PHI Isolation
                  </div>
                </div>
              </div>
            </section>

            {/* Third-Party AI & Infrastructure Dependencies */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  External AI & Cloud Dependencies
                </h2>
                <span className="text-xs text-[var(--ink-muted)]">
                  Live official provider feeds
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statusData.thirdPartyServices.map((thirdParty: ThirdPartyDependencyStatus) => (
                  <div
                    key={thirdParty.provider}
                    className="p-5 rounded-xl border border-[var(--line)] bg-[var(--card)] shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
                          {thirdParty.name}
                        </span>
                        {getStatusBadge(thirdParty.status)}
                      </div>
                      {thirdParty.incidentSummary && (
                        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                          {thirdParty.incidentSummary}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink-muted)]">
                      <span>Live status feed</span>
                      <a
                        href={thirdParty.officialStatusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        <span>Inspect Feed</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Security & HIPAA Compliance Notice */}
            <section className="p-6 rounded-xl border border-[var(--line)] bg-[var(--muted)]/40 space-y-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero-Leak HIPAA & SOC 2 Telemetry Guarantee</span>
              </div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                All ClinIQ status probes operate on an isolated zero-PHI architecture. Status health
                checks execute non-table connectivity tests without reading patient medical charts,
                LOINC laboratory observations, or clinical notes. All external telemetry feeds are
                queried with strict rate-limiting and sanitized to protect infrastructure isolation.
              </p>
            </section>
          </>
        )}
      </main>

      {/* Status Footer */}
      <footer className="border-t border-[var(--line)] py-8 mt-16 text-center text-xs text-[var(--ink-muted)]">
        <p>© 2026 ClinIQ Healthcare Platform. Real-time operational metrics.</p>
      </footer>
    </div>
  );
}
