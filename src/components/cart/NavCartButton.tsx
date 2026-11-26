"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ShoppingBag, X } from "lucide-react";
import CartCard from "@/components/library/CartCard";
import { useCart } from "@/components/cart/CartProvider";

const emptySubscribe = () => () => {};

export function NavCartButton() {
  const { items, activeItem, setActiveItem, badgeCount, recordOrder } = useCart();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open cart (${badgeCount} items)`}
        whileHover={{ scale: 1.06, y: -1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 520, damping: 24 }}
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] backdrop-blur-md transition-colors hover:border-[#6D9B6E]/70 hover:bg-[var(--glass-bg-strong)] lg:h-9 lg:w-9 cursor-pointer"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[#6D9B6E]/20 opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100"
        />
        <ShoppingBag
          className="relative h-4 w-4 transition-transform duration-200 group-hover:-rotate-6"
          aria-hidden="true"
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={badgeCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#527B48] px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-[var(--bg-primary)]"
          >
            {badgeCount}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex w-full max-w-[350px] flex-col items-center gap-3 rounded-[28px] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-strong)] p-4 shadow-2xl"
                  >
                    <div className="flex w-full items-center justify-between px-1">
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--accent-primary)] uppercase">
                          Quick Checkout · $1
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Tap preview card to expand & slide to confirm
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close cart"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Switch between Marketplace & UI Library $1 products */}
                    <div className="flex w-full gap-1.5 overflow-x-auto pb-1">
                      {items.map((item) => {
                        const selected = item.id === activeItem.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveItem(item)}
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                              selected
                                ? "border-[#6D9B6E] bg-[#527B48] text-white"
                                : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {item.title.split(" ").slice(0, 2).join(" ")}
                          </button>
                        );
                      })}
                    </div>

                    <CartCard
                      key={activeItem.id}
                      title={activeItem.title}
                      brand={activeItem.brand}
                      price={activeItem.price}
                      image={activeItem.image}
                      onConfirm={recordOrder}
                    />

                    <div className="flex w-full items-center justify-between px-1 text-xs">
                      <Link
                        href={activeItem.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 font-medium text-[var(--accent-primary)] hover:underline"
                      >
                        <span>View full details</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        $1 / license
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
