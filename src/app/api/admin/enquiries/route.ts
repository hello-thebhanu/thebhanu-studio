import { NextResponse } from "next/server";
import { getAdminEnquiriesData } from "@/lib/enquiries/db";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const data = await getAdminEnquiriesData();
  if (!data.schemaReady) {
    return NextResponse.json(
      { error: data.errorMessage ?? "Enquiries table not ready." },
      { status: 503 }
    );
  }

  return NextResponse.json({ enquiries: data.enquiries });
}
