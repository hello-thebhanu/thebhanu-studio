import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      title?: string;
      message?: string;
      isInternal?: boolean;
    };

    const message = body.message?.trim() ?? "";
    if (!message) {
      return NextResponse.json(
        { error: "Update message is required." },
        { status: 400 }
      );
    }

    const { error } = await auth.admin.from("project_updates").insert({
      project_id: id,
      author_id: auth.session.user.id,
      author_role: "admin",
      title: body.title?.trim() ?? "",
      message,
      is_internal: Boolean(body.isInternal),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid update payload." },
      { status: 400 }
    );
  }
}
