export function getSupabaseEnv() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? "";
  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "thebhanuofficial@gmail.com"
  ).toLowerCase();

  return {
    url: url.trim(),
    publishableKey: publishableKey.trim(),
    secretKey: secretKey.trim(),
    adminEmail,
    isConfigured: Boolean(url.trim() && publishableKey.trim()),
    hasAdminSecret: Boolean(url.trim() && secretKey.trim()),
  };
}
