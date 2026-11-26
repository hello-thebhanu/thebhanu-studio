import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as { fullName?: string };
    const fullName = body.fullName?.trim() ?? "";

    if (!fullName || fullName.length > 80) {
      return NextResponse.json(
        { error: "Please enter a name between 1 and 80 characters." },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    await admin
      .from("profiles")
      .upsert(
        {
          id: session.user.id,
          email: session.email,
          full_name: fullName,
          role: session.role,
        },
        { onConflict: "id" },
      );

    await admin.auth.admin.updateUserById(session.user.id, {
      user_metadata: {
        ...session.user.user_metadata,
        full_name: fullName,
      },
    });

    return NextResponse.json({ ok: true, fullName });
  } catch {
    return NextResponse.json(
      { error: "Unable to update profile name." },
      { status: 500 },
    );
  }
}
