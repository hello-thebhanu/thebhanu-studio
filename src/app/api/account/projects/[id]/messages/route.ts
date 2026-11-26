import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const admin = createSupabaseAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, customer_id, customer_email")
    .eq("id", id)
    .maybeSingle();

  const isOwner =
    project &&
    (project.customer_id === session.user.id ||
      (project.customer_email as string).toLowerCase() === session.email);

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { title?: string; message?: string };
    const message = body.message?.trim() ?? "";
    if (!message) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const { error } = await admin.from("project_updates").insert({
      project_id: id,
      author_id: session.user.id,
      author_role: "customer",
      title: body.title?.trim() || "Customer Message",
      message,
      is_internal: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid message payload." },
      { status: 400 }
    );
  }
}
