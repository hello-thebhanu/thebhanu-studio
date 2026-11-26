import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function isSafeInternalNext(nextParam: string | null): nextParam is string {
  if (!nextParam) return false;
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(nextParam)) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const nextParam = searchParams.get("next");

  if (oauthError || !code) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "oauth_error",
      oauthError === "access_denied" ? "cancelled" : "failed",
    );
    if (isSafeInternalNext(nextParam)) {
      loginUrl.searchParams.set("next", nextParam);
    }
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user || !data.user.email) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("oauth_error", "failed");
      return NextResponse.redirect(loginUrl);
    }

    const user = data.user;
    const email = (user.email ?? "").toLowerCase();
    const providerName =
      (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name.trim()) ||
      (typeof user.user_metadata?.name === "string" &&
        user.user_metadata.name.trim()) ||
      "";

    const { adminEmail, hasAdminSecret } = getSupabaseEnv();
    let role: "admin" | "customer" =
      email === adminEmail ? "admin" : "customer";

    if (hasAdminSecret) {
      const admin = createSupabaseAdminClient();
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        role =
          existingProfile.role === "admin" || email === adminEmail
            ? "admin"
            : "customer";
        const resolvedName =
          (existingProfile.full_name as string | null)?.trim() || providerName;
        if (
          (!existingProfile.full_name && providerName) ||
          (email === adminEmail && existingProfile.role !== "admin")
        ) {
          await admin
            .from("profiles")
            .update({
              full_name: resolvedName,
              role,
            })
            .eq("id", user.id);
        }
      } else {
        await admin.from("profiles").upsert(
          {
            id: user.id,
            email,
            full_name: providerName,
            role,
          },
          { onConflict: "id" },
        );
      }
    }

    const destination = isSafeInternalNext(nextParam)
      ? nextParam
      : role === "admin"
        ? "/admin"
        : "/account";

    return NextResponse.redirect(new URL(destination, origin));
  } catch {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("oauth_error", "failed");
    return NextResponse.redirect(loginUrl);
  }
}
