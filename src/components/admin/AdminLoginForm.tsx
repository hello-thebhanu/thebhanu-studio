"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Authentication failed.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-md items-center px-4 pt-28 pb-20 sm:px-6">
      <GlassCard className="w-full p-7 sm:p-9">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
            <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-primary)]">
              THE BHANU · Admin Access
            </span>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Administrator Sign In
            </h1>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          Sign in with your authorized administrator credentials to manage
          products, categories, and media assets.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Admin Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="thebhanuofficial@gmail.com"
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </label>

          {error ? (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] border border-red-500/35 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-600 dark:text-red-300"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:brightness-105 disabled:opacity-60 cursor-pointer"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>{loading ? "Verifying..." : "Sign In to Studio"}</span>
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--glass-border)] pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Return to public website</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
