import { NextResponse } from "next/server";
import type { EnquiryStatus } from "@/lib/enquiries/types";
import { requireAdminApi } from "@/lib/supabase/auth";

const VALID_STATUSES = new Set<EnquiryStatus>([
  "New",
  "Reviewing",
  "Proposal Sent",
  "Accepted",
  "Archived",
]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      status?: EnquiryStatus;
      adminNotes?: string;
    };

    const patch: Record<string, unknown> = {};
    if (body.status !== undefined && VALID_STATUSES.has(body.status)) {
      patch.status = body.status;
    }
    if (body.adminNotes !== undefined) {
      patch.admin_notes = body.adminNotes.trim();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }

    const { error } = await auth.admin
      .from("enquiries")
      .update(patch)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid enquiry update payload." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const { error } = await auth.admin.from("enquiries").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
