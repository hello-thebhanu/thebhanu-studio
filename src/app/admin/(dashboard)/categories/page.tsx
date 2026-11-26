import type { Metadata } from "next";
import { CategoriesManagerClient } from "@/components/admin/CategoriesManagerClient";
import { getAdminCatalogueData } from "@/lib/marketplace/db";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const data = await getAdminCatalogueData();

  return <CategoriesManagerClient initialCategories={data.categories} />;
}
