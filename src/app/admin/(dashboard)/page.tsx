import type { Metadata } from "next";
import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";
import { getAdminCatalogueData } from "@/lib/marketplace/db";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function AdminOverviewPage() {
  const data = await getAdminCatalogueData();

  return (
    <AdminOverviewClient
      schemaReady={data.schemaReady}
      errorMessage={data.errorMessage}
      categories={data.categories}
      products={data.products}
    />
  );
}
