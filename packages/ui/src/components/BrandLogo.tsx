import * as React from "react";
import { Activity } from "lucide-react";
import { cn } from "../lib/utils";

export interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function BrandLogo({ className, size = "md", showTagline = false }: BrandLogoProps) {
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none font-mono", className)}>
      <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-semibold tracking-tight text-[var(--ink)]">
          <span className={cn(textSizes[size], "font-sans font-bold")}>
            Clin<span className="text-[var(--ink-muted)]">IQ</span>
          </span>
          <span className="rounded border border-[var(--line)] bg-[var(--paper-sunken)] px-1.5 py-0.2 text-[9px] font-mono uppercase text-[var(--ink-muted)]">
            FHIR R4
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-mono text-[var(--ink-muted)] tracking-tight">
            Clinical Correctness & Telemetry
          </span>
        )}
      </div>
    </div>
  );
}


