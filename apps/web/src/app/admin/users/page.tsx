"use client";

import {
  Card,
  CardContent,
  DataTable,
  Badge,
  Button,
} from "@cliniq/ui";
import { UserPlus, ShieldCheck } from "lucide-react";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  npi: string;
  npiVerified: boolean;
  status: string;
  [key: string]: string | boolean;
}

const DEMO_USERS: UserAccount[] = [
  { id: "u-1", name: "Elena Rostova, RN", email: "nurse.elena@apexhealthiq.demo", role: "nurse", npi: "1948201948", npiVerified: true, status: "Active Verified" },
  { id: "u-2", name: "Dr. Robert Chen, MD", email: "dr.chen@apexhealthiq.demo", role: "physician", npi: "1820491029", npiVerified: true, status: "Active Verified" },
  { id: "u-3", name: "Sarah Johnson", email: "sarah.johnson@apexhealthiq.demo", role: "patient", npi: "N/A", npiVerified: false, status: "Active Verified" },
  { id: "u-4", name: "Apex HR Admin", email: "hr.admin@apexhealthiq.demo", role: "employer_admin", npi: "N/A", npiVerified: false, status: "Active Verified" },
  { id: "u-5", name: "System Admin", email: "admin@apexhealthiq.demo", role: "admin", npi: "N/A", npiVerified: false, status: "Active Verified" },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>ACCESS_CONTROL // RBAC_DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Staff & User Management
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Manage provider clinical credentials, NPPES NPI verification, and role-based permissions.
          </p>
        </div>
        <Button size="sm" className="font-mono text-xs gap-2">
          <UserPlus className="size-3.5" /> Invite Staff Account
        </Button>
      </div>

      <Card notch className="bg-[var(--paper-raised)]">
        <CardContent className="pt-6">
          <DataTable<UserAccount>
            data={DEMO_USERS}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search staff by name, email, or system role..."
            searchFilter={(item, q) =>
              item.name.toLowerCase().includes(q) ||
              item.email.toLowerCase().includes(q) ||
              item.role.toLowerCase().includes(q)
            }
            columns={[
              {
                key: "name",
                header: "User Identity",
                render: (item) => <span className="font-semibold text-[var(--ink)]">{item.name}</span>,
              },
              { key: "email", header: "Email Address" },
              {
                key: "role",
                header: "System Role",
                render: (item) => (
                  <Badge variant="secondary" className="capitalize font-mono">
                    {item.role.replace("_", " ")}
                  </Badge>
                ),
              },
              {
                key: "npi",
                header: "NPPES NPI Registry",
                render: (item) => (
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-[var(--ink)]">{item.npi}</span>
                    {item.npiVerified && <ShieldCheck className="size-3.5 text-emerald-500" />}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Account State",
                render: (item) => <Badge variant="success" dot>{item.status}</Badge>,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}


