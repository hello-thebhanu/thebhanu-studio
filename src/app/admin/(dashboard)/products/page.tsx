import type { Metadata } from "next";
import { ProductStudioClient } from "@/components/admin/ProductStudioClient";
import { getAdminCatalogueData } from "@/lib/marketplace/db";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const data = await getAdminCatalogueData();

  return (
    <ProductStudioClient
      initialProducts={data.products}
      categories={data.categories}
    />
  );
}
