import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      fullName?: string;
      company?: string;
      phone?: string;
      adminNotes?: string;
    };

    const patch: Record<string, unknown> = {};
    if (body.fullName !== undefined) patch.full_name = body.fullName.trim();
    if (body.company !== undefined) patch.company = body.company.trim();
    if (body.phone !== undefined) patch.phone = body.phone.trim();
    if (body.adminNotes !== undefined) patch.admin_notes = body.adminNotes.trim();

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No valid customer fields provided." },
        { status: 400 }
      );
    }

    const { error } = await auth.admin
      .from("profiles")
      .update(patch)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid customer update payload." },
      { status: 400 }
    );
  }
}
