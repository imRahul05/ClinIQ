"use client";

import * as React from "react";
import { MedplumProvider } from "@medplum/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { medplum } from "@/lib/medplum";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
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

