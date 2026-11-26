"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Component,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/components", label: "UI Assets", Icon: Component },
  { href: "/admin/enquiries", label: "Enquiries", Icon: MessageSquare },
  { href: "/admin/projects", label: "Projects", Icon: Briefcase },
  { href: "/admin/customers", label: "Customers", Icon: Users },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      {/* Admin Top Header Bar */}
      <div className="glass-surface mb-8 flex flex-col justify-between gap-4 rounded-[var(--radius-xl)] p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--accent-primary)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Product Studio
            </span>
            <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
              {email}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            THE BHANU Control Centre
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/marketplace"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)]"
          >
            <span>Public Marketplace</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-red-400/50 hover:text-red-500 disabled:opacity-60 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{loggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        aria-label="Admin sections"
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        {ADMIN_LINKS.map(({ href, label, Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-[var(--glass-border-accent)] bg-[#527B48] text-white shadow-sm"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
