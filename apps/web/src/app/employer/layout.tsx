"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo, Button, ThemeToggle } from "@cliniq/ui";
import {
  PieChart,
  DollarSign,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPLOYER_NAV = [
  { href: "/employer/overview", label: "Population Overview", icon: PieChart },
  { href: "/employer/savings", label: "ER Savings Ledger", icon: DollarSign },
  { href: "/employer/care-gaps", label: "HEDIS Gap Closure", icon: CheckCircle2 },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)] md:flex-row transition-colors">
      <aside className="hidden md:flex w-64 flex-col border-r border-[var(--line)] bg-[var(--paper-raised)] p-4 justify-between shadow-xs">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-1 border-b border-[var(--line)] pb-4">
            <BrandLogo size="sm" />
            <ThemeToggle />
          </div>

          <div className="px-3 py-2 rounded border border-[var(--line)] bg-[var(--paper-sunken)] flex items-center justify-between font-mono text-[11px]">
            <span className="text-[var(--ink-muted)] uppercase tracking-wider">EMPLOYER ROI</span>
            <span className="flex items-center gap-1.5 text-amber-500 font-semibold text-[10px]">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              B2B ACTIVE
            </span>
          </div>

          <nav className="space-y-1">
            {EMPLOYER_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/employer" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded px-3 py-2 text-xs font-mono transition-all",
                      isActive
                        ? "bg-[var(--paper-sunken)] text-[var(--ink)] font-semibold border-l-2 border-[var(--ink)] shadow-2xs"
                        : "text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)]/60 hover:text-[var(--ink)]"
                    )}
                  >
                    <Icon className={cn("size-4", isActive ? "text-[var(--ink)]" : "text-[var(--ink-faint)]")} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[var(--line)] pt-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1 text-xs text-[var(--ink-muted)]">
            <div className="w-8 h-8 rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs">
              AG
            </div>
            <div>
              <p className="font-semibold text-[var(--ink)]">Apex Global Tech</p>
              <p className="font-mono text-[10px] text-[var(--ink-faint)]">1,250 Covered Lives</p>
            </div>
          </div>
          <Link href="/signin">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-mono text-[var(--ink-muted)] hover:text-rose-500 hover:bg-[var(--paper-sunken)]">
              <LogOut className="size-3.5 mr-2" /> Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper-raised)] px-4 py-3">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="text-xs font-mono text-[var(--ink-muted)]">
                Sign Out
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}


