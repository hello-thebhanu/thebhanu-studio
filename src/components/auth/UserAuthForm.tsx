"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, UserPlus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function UserAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignup
        ? { fullName, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        error?: string;
        message?: string;
        needsEmailConfirmation?: boolean;
        user?: { role?: "admin" | "customer" };
      };

      if (!res.ok) {
        setError(data.error ?? "Authentication failed.");
        setLoading(false);
        return;
      }

      if (isSignup && data.needsEmailConfirmation) {
        setSuccessMsg(
          data.message ??
            "Account created! Check your inbox to confirm your email before signing in."
        );
        setLoading(false);
        return;
      }

      router.push(data.user?.role === "admin" ? "/admin" : "/account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 pt-28 pb-20 sm:px-6">
      <GlassCard className="w-full p-7 sm:p-9">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
            {isSignup ? (
              <UserPlus className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Lock className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </span>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-primary)]">
              THE BHANU · Account
            </span>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isSignup ? "Create Your Account" : "Welcome Back"}
            </h1>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {isSignup
            ? "Sign up to track your custom software enquiries and access your THE BHANU account."
            : "Sign in to your THE BHANU account to view submitted enquiries and profile details."}
        </p>

        {successMsg ? (
          <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-primary)]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">{successMsg}</p>
                <Link
                  href="/login"
                  className="mt-2 inline-block font-mono text-xs underline"
                >
                  Go to Sign In →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {isSignup ? (
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Full Name</span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </label>
            ) : null}

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Email Address</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </label>

            {isSignup ? (
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Confirm Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </label>
            ) : null}

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
              <span>
                {loading
                  ? "Please wait..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
              </span>
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-[var(--glass-border)] pt-4 text-xs text-[var(--text-secondary)]">
          <p>
            {isSignup ? "Already have an account?" : "New to THE BHANU?"}{" "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-semibold text-[var(--accent-primary)] hover:underline"
            >
              {isSignup ? "Sign In" : "Create an account"}
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
