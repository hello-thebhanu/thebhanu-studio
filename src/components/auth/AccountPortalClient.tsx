"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  LogOut,
  MessageSquare,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import type { EnquiryRecord } from "@/lib/enquiries/types";
import type { ProjectRecord } from "@/lib/projects/types";

export function AccountPortalClient({
  email,
  fullName,
  role,
  enquiries,
  projects,
}: {
  email: string;
  fullName: string;
  role: "admin" | "customer";
  enquiries: EnquiryRecord[];
  projects: ProjectRecord[];
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const {
    items: cartItems,
    removeItem,
    restoreFeatured,
    placedOrders,
    customerInfo,
    updateCustomerInfo,
  } = useCart();

  const [draftName, setDraftName] = useState(
    () => customerInfo.name || fullName || "",
  );
  const [draftEmail, setDraftEmail] = useState(
    () => customerInfo.email || email || "",
  );
  const [draftPhone, setDraftPhone] = useState(() => customerInfo.phone || "");
  const [draftCompany, setDraftCompany] = useState(
    () => customerInfo.company || "",
  );
  const [infoSaved, setInfoSaved] = useState(false);

  const handleSaveCustomerInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerInfo({
      name: draftName.trim(),
      email: draftEmail.trim(),
      phone: draftPhone.trim(),
      company: draftCompany.trim(),
    });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2500);
  };

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      <GlassCard className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
            <User className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent-primary)]">
              {role === "admin" ? "Administrator Account" : "Customer Account"}
            </span>
            <h1 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              {fullName || email}
            </h1>
            <p className="font-mono text-xs text-[var(--text-muted)]">{email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-4 text-xs font-semibold text-[var(--accent-primary)]"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Admin Studio</span>
            </Link>
          ) : null}

          <Link
            href="/custom-studio"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-4 text-xs font-semibold text-white"
          >
            <span>New Project Brief</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] px-4 text-xs font-medium text-[var(--text-primary)] hover:border-red-400/50 hover:text-red-500 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </GlassCard>

      <GlassCard className="mt-8 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <Briefcase className="h-4.5 w-4.5 text-[var(--accent-primary)]" aria-hidden="true" />
          <span>Your Active Projects ({projects.length})</span>
        </h2>

        {projects.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            No active projects linked to <strong>{email}</strong> yet. Once an
            enquiry is approved, your project workspace will appear here.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-[var(--glass-border)]">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--accent-primary)]">
                      {proj.projectCode}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {proj.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Status: <strong>{proj.status}</strong> · {proj.projectType}
                  </p>
                </div>

                <Link
                  href={`/account/projects/${proj.id}`}
                  className="inline-flex min-h-9 w-fit items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-4 text-xs font-medium text-[var(--accent-primary)] hover:bg-[#527B48] hover:text-white"
                >
                  <span>Open Workspace</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="mt-8 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <MessageSquare className="h-4.5 w-4.5 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Your Submitted Enquiries ({enquiries.length})</span>
          </h2>
        </div>

        {enquiries.length === 0 ? (
          <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No enquiries found under <strong>{email}</strong> yet.
            </p>
            <Link
              href="/custom-studio"
              className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-[var(--accent-primary)] hover:underline"
            >
              <span>Submit a requirement in Custom Studio →</span>
            </Link>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-[var(--glass-border)]">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--accent-primary)]">
                      {enq.referenceCode}
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {enq.projectType}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {enq.budgetRange} · {enq.expectedTimeline}
                  </p>
                </div>
                <span className="w-fit rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1 font-mono text-xs text-[var(--text-primary)]">
                  {enq.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Basic Customer Order Contact Info (no address) */}
      <GlassCard className="mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <UserCheck className="h-4.5 w-4.5 text-[var(--accent-primary)]" aria-hidden="true" />
              <span>Order Contact Details</span>
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Basic info used for digital license delivery & order updates (no street address required).
            </p>
          </div>
          {infoSaved ? (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </span>
          ) : null}
        </div>

        <form onSubmit={handleSaveCustomerInfo} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Full Name
            </label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Delivery Email
            </label>
            <input
              type="email"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Company / Studio Role (Optional)
            </label>
            <input
              type="text"
              value={draftCompany}
              onChange={(e) => setDraftCompany(e.target.value)}
              placeholder="Founder, Developer, Agency..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#6D9B6E]"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-xs font-semibold text-white cursor-pointer"
            >
              <span>Save Order Details</span>
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Cart Products */}
      <GlassCard className="mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <ShoppingBag className="h-4.5 w-4.5 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Cart Products ({cartItems.length})</span>
          </h2>
          {cartItems.length === 0 ? (
            <button
              type="button"
              onClick={restoreFeatured}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[#6D9B6E] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Load $1 Kits</span>
            </button>
          ) : null}
        </div>

        {cartItems.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Your cart is empty. Browse the{" "}
            <Link href="/marketplace" className="text-[var(--accent-primary)] hover:underline">
              Marketplace
            </Link>{" "}
            or{" "}
            <Link href="/components" className="text-[var(--accent-primary)] hover:underline">
              UI Library
            </Link>{" "}
            to add $1 digital kits.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-16 shrink-0 rounded-xl bg-[#1a1f17] object-contain p-1.5"
                  />
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="block truncate text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
                    >
                      {item.title}
                    </Link>
                    <p className="font-mono text-xs text-[var(--text-muted)]">
                      {item.source} · ${item.price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.title} from cart`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--text-muted)] hover:border-red-400/50 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Orders Placed */}
      <GlassCard className="mt-8 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <PackageCheck className="h-4.5 w-4.5 text-[var(--accent-primary)]" aria-hidden="true" />
          <span>Orders Placed ({placedOrders.length})</span>
        </h2>

        {placedOrders.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            No orders placed yet. Open the Cart button in the navbar and slide to confirm any product.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-[var(--glass-border)]">
            {placedOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.image}
                    alt={order.title}
                    className="h-12 w-16 shrink-0 rounded-xl bg-[#1a1f17] object-contain p-1.5"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--accent-primary)]">
                        {order.orderCode}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {order.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Qty {order.quantity} · Total <strong>${order.total}</strong>
                      {order.customer?.name || order.customer?.email
                        ? ` · ${order.customer.name || order.customer.email}`
                        : ""}
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] bg-emerald-500/15 px-3 py-1 font-mono text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Order Placed
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
