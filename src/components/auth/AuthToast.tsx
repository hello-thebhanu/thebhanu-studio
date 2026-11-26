"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";

const AUTH_TOAST_EVENT = "thebhanu-auth-toast";

export function showAuthToast(message = "Please sign in to continue") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string>(AUTH_TOAST_EVENT, { detail: message }),
  );
}

export function buildLoginRedirectUrl(nextPath: string): string {
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
  return `/login?next=${encodeURIComponent(safeNext)}`;
}

export function AuthToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail || "Please sign in to continue";
      setMessage(detail);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 3200);
    };
    window.addEventListener(AUTH_TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(AUTH_TOAST_EVENT, onToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-20 right-4 left-4 z-[120] flex justify-center sm:left-auto sm:right-6"
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#A5CE79]/40 bg-[#1c2218]/95 px-4 py-2 text-xs font-medium text-[#F4F5EF] shadow-xl backdrop-blur-md"
          >
            <Lock className="h-3.5 w-3.5 text-[#A5CE79]" aria-hidden="true" />
            <span>{message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
