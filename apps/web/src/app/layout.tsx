import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinIQ | Intelligent Healthcare & Virtual Care Platform",
  description: "Next-Gen Modular Healthcare Platform powered by Medplum FHIR R4 and Clinical AI Automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-sky-500 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

