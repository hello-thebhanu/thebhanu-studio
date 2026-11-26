import type { Metadata } from "next";
import { CustomersManagerClient } from "@/components/admin/CustomersManagerClient";
import { getAdminProjectsOverview } from "@/lib/projects/db";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  const data = await getAdminProjectsOverview();
  const counts: Record<string, number> = {};
  for (const p of data.projects) {
    const key = p.customerEmail.toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return (
    <CustomersManagerClient
      customers={data.customers}
      projectCountsByEmail={counts}
    />
  );
}
