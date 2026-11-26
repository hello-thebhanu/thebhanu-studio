import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { EnquiryRecord, EnquiryStatus } from "./types";

interface DbEnquiryRow {
  id: string;
  reference_code: string;
  project_type: string;
  selected_features: string[] | null;
  tech_preferences: string[] | null;
  project_description: string;
  budget_range: string;
  expected_timeline: string;
  customer_name: string;
  customer_email: string;
  customer_company: string | null;
  customer_phone: string | null;
  source_product_slug: string | null;
  status: EnquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapEnquiry(row: DbEnquiryRow): EnquiryRecord {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    projectType: row.project_type,
    selectedFeatures: row.selected_features ?? [],
    techPreferences: row.tech_preferences ?? [],
    projectDescription: row.project_description,
    budgetRange: row.budget_range,
    expectedTimeline: row.expected_timeline,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerCompany: row.customer_company,
    customerPhone: row.customer_phone,
    sourceProductSlug: row.source_product_slug,
    status: row.status,
    adminNotes: row.admin_notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminEnquiriesData(): Promise<{
  enquiries: EnquiryRecord[];
  schemaReady: boolean;
  errorMessage?: string;
}> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        enquiries: [],
        schemaReady: false,
        errorMessage: error.message,
      };
    }

    return {
      enquiries: ((data ?? []) as DbEnquiryRow[]).map(mapEnquiry),
      schemaReady: true,
    };
  } catch (err) {
    return {
      enquiries: [],
      schemaReady: false,
      errorMessage:
        err instanceof Error ? err.message : "Failed to load enquiries.",
    };
  }
}
