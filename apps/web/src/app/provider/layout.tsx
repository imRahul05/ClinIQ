"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo, Button, Badge, ThemeToggle } from "@cliniq/ui";
import {
  LayoutDashboard,
  Users,
  Mic,
  FileCheck,
  FileSpreadsheet,
  LogOut,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDER_NAV = [
  { href: "/provider/dashboard", label: "Worklist & Queue", icon: LayoutDashboard },
  { href: "/provider/patients", label: "Patient Roster", icon: Users },
  { href: "/provider/scribe", label: "Ambient AI Scribe", icon: Mic },
  { href: "/provider/scribe-review", label: "SOAP Review & Sign", icon: FileCheck },
  { href: "/provider/fax", label: "AI Fax Inbox", icon: FileSpreadsheet },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOnDuty, setIsOnDuty] = React.useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)] md:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[var(--line)] bg-[var(--paper-raised)] p-4 justify-between shadow-xs">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-1 border-b border-[var(--line)] pb-4">
            <BrandLogo size="sm" />
            <ThemeToggle />
          </div>

          {/* On-Duty Nurse Status Toggle */}
          <div className="px-3 py-2.5 rounded border border-[var(--line)] bg-[var(--paper-sunken)] space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[var(--ink-muted)]">SENTINEL_STATE</span>
              <Badge variant={isOnDuty ? "success" : "secondary"} dot>
                {isOnDuty ? "AVAILABLE" : "OFFLINE"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[11px] font-mono justify-center"
              onClick={() => setIsOnDuty(!isOnDuty)}
            >
              <PhoneCall className="size-3 mr-1.5" />
              {isOnDuty ? "Set Offline" : "Go On-Duty"}
            </Button>
          </div>

          <nav className="space-y-1">
            {PROVIDER_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/provider" && pathname.startsWith(item.href));
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
              ER
            </div>
            <div>
              <p className="font-semibold text-[var(--ink)]">Elena Rostova, RN</p>
              <p className="font-mono text-[10px] text-[var(--ink-faint)]">NPI: 1948201948 · Primary</p>
            </div>
          </div>
          <Link href="/signin">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-mono text-[var(--ink-muted)] hover:text-rose-500 hover:bg-[var(--paper-sunken)]">
              <LogOut className="size-3.5 mr-2" /> Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
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


