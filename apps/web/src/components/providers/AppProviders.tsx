"use client";

import * as React from "react";
import { MedplumProvider } from "@medplum/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { medplum } from "@/lib/medplum";
import { ThemeProvider } from "./ThemeProvider";

export interface AppProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * ============================================================================
 * CLINIQ UNIFIED CONTEXT PROVIDER HIERARCHY
 * ============================================================================
 *
 * Coordinates authentication state, FHIR context, UI theming, and asynchronous
 * query caching across ClinIQ Web Portal:
 *
 * 1. ThemeProvider:
 *    - Injects CSS color variables, font hierarchies, and paper/ink design tokens.
 *
 * 2. MedplumProvider (`@medplum/react-hooks`):
 *    - Injects the configured `MedplumClient` instance into React context.
 *    - Manages active FHIR session, SMART-on-FHIR OAuth tokens, and subscriptions.
 *    - Enables hooks like `useMedplum()`, `useMedplumProfile()`, and `useSearch()`.
 *
 * 3. QueryClientProvider (`@tanstack/react-query`):
 *    - Provides high-efficiency caching, background synchronization, and request
 *      deduplication for operational API endpoints (Worklists, Scribe, Telephony, Ledgers).
 *    - Uses a stable singleton instance across client re-renders.
 * ============================================================================
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = React.useState<QueryClient>(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <MedplumProvider medplum={medplum}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MedplumProvider>
    </ThemeProvider>
  );
}


