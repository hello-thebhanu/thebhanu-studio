"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import SearchCard from "@/components/library/SearchCard";

const emptySubscribe = () => () => {};

export function FloatingSearchBar() {
  const { resolvedTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const mac = useSyncExternalStore(
    emptySubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setExpanded((prev) => !prev);
      } else if (e.key === "Escape" && expanded) {
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  return (
    <>
      {/* Minimized animated floating hover search icon — visible down to footer */}
      <AnimatePresence>
        {!expanded ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed right-5 bottom-5 z-40"
          >
            <motion.button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Open quick search"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[0_14px_34px_-10px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors hover:border-[#6D9B6E]/60 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 rounded-full bg-[#6D9B6E]/20 opacity-60 blur-md transition-opacity group-hover:opacity-100"
              />
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#527B48] text-white shadow-inner">
                <Search className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
              </span>
              <span className="relative hidden text-xs tracking-wide text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] sm:inline">
                Search
              </span>
              <kbd className="relative hidden rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)] sm:inline-block">
                {mac ? "⌘K" : "Ctrl K"}
              </kbd>
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Expanded SearchCard overlay */}
      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px]"
            >
              <SearchCard
                theme={resolvedTheme}
                corner={26}
                rows={3}
                shortcut={false}
                defaultOpen
                onClose={() => setExpanded(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
