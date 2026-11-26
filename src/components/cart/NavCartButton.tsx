"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, RotateCcw, ShoppingBag, UserCheck, X } from "lucide-react";
import CartCard from "@/components/library/CartCard";
import { useCart } from "@/components/cart/CartProvider";

const emptySubscribe = () => () => {};

export function NavCartButton() {
  const {
    items,
    activeItem,
    setActiveItem,
    placedOrders,
    customerInfo,
    updateCustomerInfo,
    badgeCount,
    placeOrder,
    restoreFeatured,
  } = useCart();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"cart" | "orders">("cart");
  const [showInfoForm, setShowInfoForm] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const handleOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setTab(items.length === 0 && placedOrders.length > 0 ? "orders" : "cart");
    setOpen(true);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleOpen}
        aria-label={`Open cart (${badgeCount} items)`}
        whileHover={{ scale: 1.06, y: -1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 520, damping: 24 }}
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] backdrop-blur-sm transition-colors hover:border-[#6D9B6E]/70 hover:bg-[var(--glass-bg-strong)] lg:h-9 lg:w-9 cursor-pointer"
      >
        <ShoppingBag
          className="relative h-4 w-4 transition-transform duration-200 group-hover:-rotate-6"
          aria-hidden="true"
        />
        <AnimatePresence mode="popLayout" initial={false}>
          {badgeCount > 0 ? (
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
          ) : null}
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
                  transition={{ duration: 0.22 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex max-h-[90vh] w-full max-w-[356px] flex-col items-center gap-3 overflow-y-auto rounded-[28px] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-strong)] p-4 shadow-2xl"
                  >
                    {/* Header + Tabs */}
                    <div className="flex w-full items-center justify-between gap-2 px-1">
                      <div className="inline-flex rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-0.5">
                        <button
                          type="button"
                          onClick={() => setTab("cart")}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            tab === "cart"
                              ? "bg-[#527B48] text-white"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Cart ({items.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab("orders")}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            tab === "orders"
                              ? "bg-[#527B48] text-white"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Orders ({placedOrders.length})
                        </button>
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

                    {tab === "cart" ? (
                      activeItem ? (
                        <>
                          {/* Quick switcher for items in cart */}
                          <div className="flex w-full gap-1.5 overflow-x-auto pb-0.5">
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

                          {/* Basic Customer Info bar (no address) */}
                          <div className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setShowInfoForm((prev) => !prev)}
                              className="flex w-full items-center justify-between text-left text-[11px] cursor-pointer"
                            >
                              <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                <UserCheck className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                                {customerInfo.name || customerInfo.email
                                  ? `${customerInfo.name || "Customer"} · ${customerInfo.email || customerInfo.phone}`
                                  : "Add basic contact info (optional)"}
                              </span>
                              <span className="font-mono text-[10px] text-[var(--accent-primary)]">
                                {showInfoForm ? "Done" : "Edit"}
                              </span>
                            </button>

                            {showInfoForm ? (
                              <div className="mt-2 grid gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Full name"
                                  value={customerInfo.name}
                                  onChange={(e) =>
                                    updateCustomerInfo({
                                      ...customerInfo,
                                      name: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
                                />
                                <input
                                  type="email"
                                  placeholder="Email for license delivery"
                                  value={customerInfo.email}
                                  onChange={(e) =>
                                    updateCustomerInfo({
                                      ...customerInfo,
                                      email: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
                                />
                                <input
                                  type="tel"
                                  placeholder="Phone / WhatsApp"
                                  value={customerInfo.phone}
                                  onChange={(e) =>
                                    updateCustomerInfo({
                                      ...customerInfo,
                                      phone: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
                                />
                              </div>
                            ) : null}
                          </div>

                          <CartCard
                            key={activeItem.id}
                            title={activeItem.title}
                            brand={activeItem.brand}
                            price={activeItem.price}
                            image={activeItem.image}
                            onConfirm={(order) => {
                              const confirmedItem = activeItem;
                              closeTimerRef.current = setTimeout(() => {
                                placeOrder(confirmedItem, order);
                                setOpen(false);
                              }, 2400);
                            }}
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
                        </>
                      ) : (
                        <div className="flex w-full flex-col items-center gap-3 py-6 text-center">
                          <ShoppingBag className="h-8 w-8 text-[var(--text-muted)]" />
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              Your cart is empty
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              All confirmed items moved to Orders Placed.
                            </p>
                          </div>
                          <div className="flex flex-wrap justify-center gap-2">
                            <button
                              type="button"
                              onClick={restoreFeatured}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[#6D9B6E] cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Load $1 Kits</span>
                            </button>
                            <Link
                              href="/account"
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center gap-1 rounded-full bg-[#527B48] px-3 py-1.5 text-xs font-medium text-white"
                            >
                              <span>View in Account</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex w-full flex-col gap-2.5 py-1">
                        {placedOrders.length === 0 ? (
                          <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                            No orders placed yet. Slide to confirm any product in Cart!
                          </p>
                        ) : (
                          placedOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-2.5"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={order.image}
                                alt={order.title}
                                className="h-11 w-14 shrink-0 rounded-xl bg-[#1a1f17] object-contain p-1"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                                  {order.title}
                                </p>
                                <p className="font-mono text-[10px] text-[var(--text-muted)]">
                                  {order.orderCode} · Qty {order.quantity} · ${order.total}
                                </p>
                              </div>
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Placed
                              </span>
                            </div>
                          ))
                        )}
                        <Link
                          href="/account"
                          onClick={() => setOpen(false)}
                          className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] py-2 text-xs font-semibold text-[var(--accent-primary)] hover:bg-[#527B48] hover:text-white"
                        >
                          <span>Manage Orders & Info in Account</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
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
