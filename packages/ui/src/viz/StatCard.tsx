import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { cn } from "../lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  icon?: React.ReactNode;
  loincCode?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  subtitle,
  icon,
  loincCode,
  className,
}: StatCardProps) {
  return (
    <Card notch className={cn("overflow-hidden relative bg-[var(--paper-raised)] border-[var(--line)]", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
              {title}
            </span>
            {loincCode && (
              <span className="font-mono text-[9px] text-[var(--ink-faint)]">
                {loincCode}
              </span>
            )}
          </div>
          {icon && (
            <div className="rounded border border-[var(--line)] bg-[var(--paper-sunken)] p-1.5 text-[var(--ink)]">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-[var(--ink)]">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                "inline-flex items-center font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border",
                trend === "up" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold",
                trend === "down" && "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold",
                trend === "neutral" && "bg-[var(--paper-sunken)] border-[var(--line)] text-[var(--ink-muted)]"
              )}
            >
              {trend === "up" && <TrendingUp className="size-2.5 mr-1" />}
              {trend === "down" && <TrendingDown className="size-2.5 mr-1" />}
              {change}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-2 font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}


