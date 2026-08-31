import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-[var(--line-strong)] bg-[var(--paper-sunken)] text-[var(--ink)]",
        secondary:
          "border-[var(--line)] bg-[var(--paper)] text-[var(--ink-muted)]",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold",
        outline:
          "border-[var(--line-strong)] text-[var(--ink-muted)] bg-transparent",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold",
        info:
          "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold",
        gold:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0",
            variant === "success" && "bg-emerald-500",
            variant === "destructive" && "bg-rose-500",
            variant === "warning" && "bg-amber-500",
            variant === "info" && "bg-indigo-500",
            (!variant || variant === "default" || variant === "secondary" || variant === "outline") && "bg-slate-400"
          )}
        />
      )}
      {children}
    </div>
  );
}


