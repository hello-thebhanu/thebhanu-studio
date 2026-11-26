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
        { error: "Supabase authentication is not configured." },
        { status: 503 }
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
    const metaName =
      typeof data.user.user_metadata?.full_name === "string"
        ? data.user.user_metadata.full_name
        : "";

    let role: "admin" | "customer" =
      email === adminEmail ? "admin" : "customer";

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role === "admin" || profile?.role === "customer") {
      role = profile.role;
    } else {
      await admin.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: metaName,
        role,
      });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email,
        fullName: metaName,
        role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete sign in." },
      { status: 500 }
    );
  }
}
