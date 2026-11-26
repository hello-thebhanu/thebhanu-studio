"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { BhanuBot, type BhanuBotState } from "@/components/auth/BhanuBot";
import { OtpInput } from "@/components/auth/OtpInput";
import { notifyAuthChanged } from "@/hooks/useAuthSession";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Step = "email" | "otp" | "success";

const RESEND_SECONDS = 60;
const RING_RADIUS = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function isSafeInternalNext(nextParam: string | null): nextParam is string {
  if (!nextParam) return false;
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(nextParam)) return false;
  return true;
}

function mapFriendlyOtpError(
  err: unknown,
  context: "send" | "verify",
): string {
  const raw =
    err instanceof Error
      ? err.message.toLowerCase()
      : typeof err === "string"
        ? err.toLowerCase()
        : "";

  if (
    raw.includes("rate limit") ||
    raw.includes("too many") ||
    raw.includes("429") ||
    raw.includes("once every")
  ) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  if (
    raw.includes("fetch") ||
    raw.includes("network") ||
    raw.includes("failed to fetch") ||
    raw.includes("timeout")
  ) {
    return "Network connection issue. Please check your internet and try again.";
  }
  if (raw.includes("invalid email") || raw.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (context === "verify") {
    if (raw.includes("expired") || raw.includes("otp_expired")) {
      return "That code has expired. Tap Resend code to get a fresh one.";
    }
    return "Invalid or expired 6-digit code. Please check your inbox and try again.";
  }
  return "We couldn't send your verification code right now. Please try again.";
}

export function OtpLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpErrorTrigger, setOtpErrorTrigger] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const finishRedirect = useCallback(async () => {
    const nextParam = searchParams.get("next");
    if (isSafeInternalNext(nextParam)) {
      router.push(nextParam);
      router.refresh();
      return;
    }

    let destination = "/account";
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          user?: { role?: "admin" | "customer" } | null;
        };
        if (data.user?.role === "admin") {
          destination = "/admin";
        }
      }
    } catch {
      // Fallback to /account
    }

    router.push(destination);
    router.refresh();
  }, [router, searchParams]);

  const sendOtpCode = async (targetEmail: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        shouldCreateUser: true,
      },
    });
    if (sendError) {
      throw sendError;
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendOtpCode(normalized);
      setEmail(normalized);
      setOtp("");
      setCountdown(RESEND_SECONDS);
      setStep("otp");
    } catch (err) {
      setError(mapFriendlyOtpError(err, "send"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || loading) return;
    setError(null);
    setResending(true);
    try {
      await sendOtpCode(email);
      setOtp("");
      setCountdown(RESEND_SECONDS);
    } catch (err) {
      setError(mapFriendlyOtpError(err, "send"));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const token = (codeToVerify ?? otp).trim();
      if (token.length !== 6 || loading) return;

      setError(null);
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });

        if (verifyError) {
          throw verifyError;
        }

        setStep("success");
        notifyAuthChanged();
        window.setTimeout(
          () => {
            setExiting(true);
            window.setTimeout(() => {
              void finishRedirect();
            }, reducedMotion ? 80 : 280);
          },
          reducedMotion ? 200 : 900,
        );
      } catch (err) {
        setError(mapFriendlyOtpError(err, "verify"));
        setOtpErrorTrigger((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    },
    [email, finishRedirect, loading, otp, reducedMotion],
  );

  const ringOffset =
    RING_CIRCUMFERENCE * (1 - countdown / RESEND_SECONDS);
  const floatActive = emailFocused || email.length > 0;

  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-md flex-col items-center justify-center px-4 pt-28 pb-20 sm:pt-32">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 14 }}
        animate={
          exiting
            ? { opacity: 0, scale: 0.96, y: -10 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass-surface-strong relative w-full overflow-hidden rounded-[28px] border border-white/15 !bg-[#1c2218]/92 p-6 shadow-2xl sm:p-8"
      >
        {/* Header badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#A5CE79]/35 bg-[#527B48]/25 text-[#A5CE79]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A5CE79]">
              THE BHANU · PASSWORDLESS
            </p>
            <h1 className="text-xl font-bold text-[#F4F5EF] sm:text-2xl">
              {step === "email"
                ? "Sign in with code"
                : step === "otp"
                  ? "Enter 6-digit code"
                  : "Verified"}
            </h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email-step"
              initial={reducedMotion ? false : { opacity: 0, x: -16, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -18, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleEmailSubmit}
              className="space-y-5"
              noValidate
            >
              <p className="text-sm leading-relaxed text-[#c6cec0]">
                Enter your email and we&apos;ll send a 6-digit verification code. New users are created automatically.
              </p>

              {/* Floating label email field */}
              <div className="relative">
                <input
                  id="otp-email-input"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  disabled={loading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-label="Email address"
                  className={`peer h-14 w-full rounded-2xl border bg-[#161b12]/90 px-4 pt-5 pb-1.5 text-sm text-[#F4F5EF] outline-none transition-all duration-200 ${
                    emailFocused
                      ? "border-[#A5CE79] shadow-[0_0_22px_rgba(165,206,121,0.22)]"
                      : "border-white/15 hover:border-white/25"
                  }`}
                />
                <label
                  htmlFor="otp-email-input"
                  className={`pointer-events-none absolute left-4 transition-all duration-200 ${
                    floatActive
                      ? "top-2 font-mono text-[10px] tracking-wider text-[#A5CE79] uppercase"
                      : "top-1/2 -translate-y-1/2 text-sm text-[#95a08d]"
                  }`}
                >
                  Email address
                </label>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/35 bg-red-500/12 px-3.5 py-2.5 text-xs text-red-200"
                >
                  {error}
                </p>
              ) : null}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={reducedMotion ? undefined : { scale: 1.015 }}
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(82,123,72,0.38)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with email</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : step === "otp" ? (
            <motion.form
              key="otp-step"
              initial={reducedMotion ? false : { opacity: 0, x: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={(e) => {
                e.preventDefault();
                void handleVerify();
              }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#c6cec0]">
                <span>
                  Code sent to <strong className="text-[#F4F5EF]">{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 font-medium text-[#A5CE79] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  <span>Change email</span>
                </button>
              </div>

              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (error) setError(null);
                }}
                onComplete={(code) => void handleVerify(code)}
                disabled={loading}
                hasError={Boolean(error)}
                errorTrigger={otpErrorTrigger}
              />

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/35 bg-red-500/12 px-3.5 py-2.5 text-xs text-red-200"
                >
                  {error}
                </p>
              ) : null}

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                whileHover={reducedMotion ? undefined : { scale: 1.015 }}
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(82,123,72,0.38)] transition-opacity disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; Sign In</span>
                )}
              </motion.button>

              {/* 60s Resend countdown circular ring */}
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || resending || loading}
                  className="inline-flex items-center gap-2.5 text-xs font-medium text-[#c6cec0] transition-colors hover:text-[#A5CE79] disabled:cursor-default disabled:hover:text-[#c6cec0] cursor-pointer"
                >
                  {countdown > 0 ? (
                    <>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        className="-rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r={RING_RADIUS}
                          fill="none"
                          stroke="rgba(255,255,255,0.14)"
                          strokeWidth="2.2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r={RING_RADIUS}
                          fill="none"
                          stroke="#A5CE79"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeDasharray={RING_CIRCUMFERENCE}
                          strokeDashoffset={ringOffset}
                          style={{ transition: "stroke-dashoffset 0.9s linear" }}
                        />
                      </svg>
                      <span className="font-mono">Resend code in {countdown}s</span>
                    </>
                  ) : (
                    <span className="text-[#A5CE79] underline-offset-4 hover:underline">
                      {resending ? "Sending new code..." : "Resend code"}
                    </span>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success-step"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="relative flex h-20 w-20 items-center justify-center">
                {!reducedMotion ? (
                  <motion.span
                    aria-hidden="true"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1.45, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-2 border-[#A5CE79]"
                  />
                ) : null}
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#A5CE79]/50 bg-[#527B48]/25">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8 text-[#A5CE79]"
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reducedMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-[#F4F5EF]">
                Signed in as {email}
              </p>
              <p className="mt-1 font-mono text-xs text-[#A5CE79]">
                Redirecting to your workspace...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-[#95a08d]">
          Studio administrator?{" "}
          <Link href="/admin/login" className="text-[#A5CE79] hover:underline">
            Admin sign in
          </Link>
        </div>
      </motion.div>

      {/* BhanuBot mascot in #bhanubot-slot */}
      <div
        id="bhanubot-slot"
        data-slot="bhanubot"
        className="mt-4 flex w-full justify-center"
      >
        <BhanuBot
          state={
            (step === "success"
              ? "success"
              : error
                ? "error"
                : step === "otp"
                  ? "otp"
                  : emailFocused
                    ? "email-focus"
                    : "idle") as BhanuBotState
          }
          lookProgress={Math.min(1, email.length / 24)}
          size={68}
        />
      </div>
    </div>
  );
}
