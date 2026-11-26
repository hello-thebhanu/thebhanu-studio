import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { isConfigured, hasAdminSecret, adminEmail } = getSupabaseEnv();
    if (!isConfigured || !hasAdminSecret) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Invalid email or password." },
        { status: 401 }
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileErr) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "Database schema is not initialized yet. Run the Phase 4 SQL migration in Supabase first.",
        },
        { status: 503 }
      );
    }

    let isAdmin = profile?.role === "admin";
    if (!profile && email === adminEmail) {
      const { error: upsertErr } = await admin.from("profiles").upsert({
        id: data.user.id,
        email,
        role: "admin",
      });
      if (!upsertErr) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Forbidden. This account does not have administrator access." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: { id: data.user.id, email },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete login request." },
      { status: 500 }
    );
  }
}
