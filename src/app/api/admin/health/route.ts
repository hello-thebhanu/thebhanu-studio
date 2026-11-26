import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";

const EXPECTED_TABLES = [
  "profiles",
  "categories",
  "products",
  "product_images",
  "asset_categories",
  "ui_assets",
  "enquiries",
  "projects",
  "project_updates",
  "project_files",
] as const;

const EXPECTED_BUCKETS = ["product-media", "ui-assets", "project-files"] as const;

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const tableStatus: Record<string, { exists: boolean; count: number | null; error?: string }> = {};

  await Promise.all(
    EXPECTED_TABLES.map(async (table) => {
      const { count, error } = await auth.admin
        .from(table)
        .select("*", { count: "exact", head: true });
      tableStatus[table] = error
        ? { exists: false, count: null, error: error.message }
        : { exists: true, count: count ?? 0 };
    })
  );

  const { data: buckets, error: bucketErr } = await auth.admin.storage.listBuckets();
  const bucketIds = new Set((buckets ?? []).map((b) => b.id));
  const bucketStatus = Object.fromEntries(
    EXPECTED_BUCKETS.map((b) => [b, !bucketErr && bucketIds.has(b)])
  );

  const allTablesReady = EXPECTED_TABLES.every((t) => tableStatus[t]?.exists);
  const allBucketsReady = EXPECTED_BUCKETS.every((b) => bucketStatus[b]);

  return NextResponse.json({
    ok: allTablesReady && allBucketsReady,
    tables: tableStatus,
    buckets: bucketStatus,
  });
}
