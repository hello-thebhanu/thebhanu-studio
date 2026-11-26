"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { GoogleIcon, LinkedInIcon } from "@/components/auth/SocialIcons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProviderId = "google" | "linkedin_oidc";

interface SocialLoginButtonsProps {
  safeNext: string | null;
  disabled?: boolean;
  onConnectingChange?: (connecting: boolean) => void;
  onError?: (message: string) => void;
}

const PROVIDERS: {
  id: ProviderId;
  label: string;
  Icon: typeof GoogleIcon;
  hoverGlowClass: string;
}[] = [
  {
    id: "google",
    label: "Continue with Google",
    Icon: GoogleIcon,
    hoverGlowClass:
      "hover:border-white/35 hover:shadow-[0_0_24px_rgba(255,255,255,0.14)]",
  },
  {
    id: "linkedin_oidc",
    label: "Continue with LinkedIn",
    Icon: LinkedInIcon,
    hoverGlowClass:
      "hover:border-[#0A66C2]/65 hover:shadow-[0_0_24px_rgba(10,102,194,0.32)]",
  },
];

export function SocialLoginButtons({
  safeNext,
  disabled = false,
  onConnectingChange,
  onError,
}: SocialLoginButtonsProps) {
  const reducedMotion = useReducedMotion();
  const [connectingProvider, setConnectingProvider] =
    useState<ProviderId | null>(null);

  const handleOAuth = async (provider: ProviderId) => {
    if (disabled || connectingProvider) return;
    setConnectingProvider(provider);
    onConnectingChange?.(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (safeNext) {
        callbackUrl.searchParams.set("next", safeNext);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }
    } catch {
      setConnectingProvider(null);
      onConnectingChange?.(false);
      onError?.(
        "Unable to connect with that provider right now. Please try again or use email code.",
      );
    }
  };

  return (
    <div className="mt-5 space-y-3.5">
      {/* Divider */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        className="flex items-center gap-3"
      >
        <span className="h-px flex-1 bg-white/12" />
        <span className="text-[11px] font-medium tracking-wider text-[#95a08d] uppercase">
          or continue with
        </span>
        <span className="h-px flex-1 bg-white/12" />
      </motion.div>

      {/* Provider Buttons */}
      <div className="grid gap-2.5">
        {PROVIDERS.map(({ id, label, Icon, hoverGlowClass }, index) => {
          const isLoading = connectingProvider === id;
          const isOtherBusy = connectingProvider !== null && !isLoading;

          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => void handleOAuth(id)}
              disabled={disabled || connectingProvider !== null}
              aria-label={label}
              aria-busy={isLoading}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: isOtherBusy ? 0.5 : 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.12 + index * 0.06 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              className={`group relative flex min-h-12 w-full items-center overflow-hidden rounded-full border border-[#A5CE79]/20 bg-[#171d14]/80 px-2.5 text-sm font-semibold tracking-[0.01em] text-[#F4F5EF] backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5CE79] disabled:cursor-not-allowed ${hoverGlowClass} cursor-pointer`}
            >
              {/* Light shine sweep once per hover */}
              {!reducedMotion ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                />
              ) : null}

              {/* 36px rounded-xl icon container on the left */}
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/95 shadow-sm transition-transform duration-200 group-hover:scale-[1.06]">
                {isLoading ? (
                  <Loader2
                    className="h-5 w-5 animate-spin text-[#263020]"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon />
                )}
              </span>

              {/* Centered label */}
              <span className="relative z-10 flex-1 pr-9 text-center">
                {isLoading ? "Connecting..." : label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
