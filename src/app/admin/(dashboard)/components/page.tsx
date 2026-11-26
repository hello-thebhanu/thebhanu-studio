import type { Metadata } from "next";
import { AssetsManagerClient } from "@/components/admin/AssetsManagerClient";
import { getAdminAssetsData } from "@/lib/assets/db";

export const metadata: Metadata = {
  title: "UI Assets",
};

export default async function AdminComponentsPage() {
  const data = await getAdminAssetsData();

  return (
    <AssetsManagerClient
      schemaReady={data.schemaReady}
      errorMessage={data.errorMessage}
      initialAssets={data.assets}
      categories={data.categories}
    />
  );
}
