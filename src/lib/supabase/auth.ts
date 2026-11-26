import { redirect } from "next/navigation";
import { connection, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "./server";

export interface UserSession {
  user: User;
  email: string;
  fullName: string;
  role: "admin" | "customer";
}

export interface AdminSession {
  user: User;
  email: string;
  role: "admin";
}

export async function getUserSession(): Promise<UserSession | null> {
  const { isConfigured, hasAdminSecret, adminEmail } = getSupabaseEnv();
  if (!isConfigured || !hasAdminSecret) {
    return null;
  }

  try {
    await connection();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const email = user.email.toLowerCase();
    const metaName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "";
    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id, role, email, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      return {
        user,
        email,
        fullName: metaName,
        role: email === adminEmail ? "admin" : "customer",
      };
    }

    if (profile) {
      return {
        user,
        email,
        fullName: (profile.full_name as string) || metaName,
        role: profile.role === "admin" ? "admin" : "customer",
      };
    }

    const assignedRole = email === adminEmail ? "admin" : "customer";
    await admin.from("profiles").upsert({
      id: user.id,
      email,
      full_name: metaName,
      role: assignedRole,
    });

    return {
      user,
      email,
      fullName: metaName,
      role: assignedRole,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return {
    user: session.user,
    email: session.email,
    role: "admin",
  };
}

export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Unauthorized. Administrator access is required." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    session,
    admin: createSupabaseAdminClient(),
  };
}
