import type { Metadata } from "next";
import { EnquiriesManagerClient } from "@/components/admin/EnquiriesManagerClient";
import { getAdminEnquiriesData } from "@/lib/enquiries/db";

export const metadata: Metadata = {
  title: "Enquiries",
};

export default async function AdminEnquiriesPage() {
  const data = await getAdminEnquiriesData();

  return (
    <EnquiriesManagerClient
      schemaReady={data.schemaReady}
      errorMessage={data.errorMessage}
      initialEnquiries={data.enquiries}
    />
  );
}
