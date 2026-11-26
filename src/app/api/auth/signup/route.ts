import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
    };

    const fullName = body.fullName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (fullName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      const admin = createSupabaseAdminClient();
      const role = email === adminEmail ? "admin" : "customer";
      await admin.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
    }

    const needsEmailConfirmation = !data.session;

    return NextResponse.json(
      {
        ok: true,
        needsEmailConfirmation,
        message: needsEmailConfirmation
          ? "Account created! Please check your email to confirm your address before signing in."
          : "Account created and signed in.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 }
    );
  }
}
