"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BhanuBot, type BhanuBotState } from "@/components/auth/BhanuBot";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const GREETED_SESSION_KEY = "thebhanu-bot-greeted-v1";
const HIDDEN_ROUTES = ["/login", "/signup", "/admin/login"];

export function BhanuBotFloating() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { user, displayName, loading, refresh } = useAuthSession();

  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [botState, setBotState] = useState<BhanuBotState>("idle");
  const [typedText, setTypedText] = useState("");
  const [askingName, setAskingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const isHiddenRoute = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  const greetingText = `Hello ${displayName ?? "Friend"} 👋🏻`;

  // Trigger greeting once per login session
  useEffect(() => {
    if (loading || !user || isHiddenRoute) return;
    try {
      const already = window.sessionStorage.getItem(GREETED_SESSION_KEY);
      if (already) return;
      window.sessionStorage.setItem(GREETED_SESSION_KEY, "1");
    } catch {
      // Ignore storage errors
    }

    const id = window.setTimeout(() => {
      setBubbleOpen(true);
      setBotState("wave");
      setAskingName(!user.fullName?.trim());
    }, 60);
    return () => window.clearTimeout(id);
  }, [isHiddenRoute, loading, user]);

  // Typing effect for the greeting bubble
  useEffect(() => {
    if (!bubbleOpen || reducedMotion) return;

    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setTypedText(greetingText.slice(0, i));
      if (i >= greetingText.length) {
        window.clearInterval(interval);
      }
    }, 32);
    return () => window.clearInterval(interval);
  }, [bubbleOpen, greetingText, reducedMotion]);

  // Auto-hide bubble after ~4s unless asking for name
  useEffect(() => {
    if (!bubbleOpen || askingName) return;
    const timer = window.setTimeout(() => {
      setBubbleOpen(false);
      setBotState("idle");
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [askingName, bubbleOpen]);

  if (loading || !user || isHiddenRoute) {
    return null;
  }

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed || savingName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      if (res.ok) {
        await refresh();
        setAskingName(false);
        setBotState("success");
      }
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-5 left-4 z-30 flex items-end gap-2.5 sm:left-5">
      <button
        type="button"
        onClick={() => {
          setBubbleOpen((prev) => !prev);
          setBotState("wave");
        }}
        aria-label="Toggle BhanuBot greeting"
        className="pointer-events-auto relative rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 shadow-lg backdrop-blur-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#6D9B6E] cursor-pointer"
      >
        <BhanuBot state={botState} size={46} />
      </button>

      <div aria-live="polite" className="pointer-events-none">
        <AnimatePresence>
          {bubbleOpen ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-60 max-w-[calc(100vw-6rem)] rounded-2xl border border-[#A5CE79]/35 bg-[#1c2218]/95 p-3 text-xs text-[#F4F5EF] shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug text-[#F4F5EF]">
                  {reducedMotion ? greetingText : typedText || greetingText}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBubbleOpen(false);
                    setBotState("idle");
                  }}
                  aria-label="Dismiss greeting"
                  className="text-[#95a08d] hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {askingName ? (
                <form onSubmit={handleSaveName} className="mt-2.5 space-y-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="What should I call you?"
                    maxLength={80}
                    aria-label="What should I call you?"
                    className="w-full rounded-lg border border-white/15 bg-[#141811] px-2.5 py-1.5 text-xs text-[#F4F5EF] outline-none focus:border-[#A5CE79]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAskingName(false)}
                      className="text-[11px] text-[#95a08d] hover:text-white cursor-pointer"
                    >
                      Skip
                    </button>
                    <button
                      type="submit"
                      disabled={savingName || !nameDraft.trim()}
                      className="rounded-full bg-[#527B48] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50 cursor-pointer"
                    >
                      {savingName ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
