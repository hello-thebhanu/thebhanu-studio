import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

export async function createSupabaseServerClient() {
  const { url, publishableKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    throw new Error("Supabase URL or publishable key is not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component read-only context; middleware/route handlers set cookies.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const { url, secretKey, hasAdminSecret } = getSupabaseEnv();
  if (!hasAdminSecret) {
    throw new Error("Supabase URL or secret key is not configured.");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
