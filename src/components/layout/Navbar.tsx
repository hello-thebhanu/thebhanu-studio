"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Blocks,
  FolderKanban,
  Home,
  Info,
  Layers,
  LogOut,
  Mail,
  Package,
  User,
} from "lucide-react";
import {
  buildLoginRedirectUrl,
  showAuthToast,
} from "@/components/auth/AuthToast";
import { NavCartButton } from "@/components/cart/NavCartButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  IconNavbarMenu,
  type IconNavItem,
} from "@/components/ui/navbar-menu";
import { useAuthSession } from "@/hooks/useAuthSession";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

const ICON_BY_HREF: Record<string, IconNavItem["icon"]> = {
  "/#top": Home,
  "/#services": Layers,
  "/marketplace": Package,
  "/components": Blocks,
  "/#projects": FolderKanban,
  "/#about": Info,
  "/#contact": Mail,
};

const GATED_HREFS = new Set(["/marketplace", "/components", "/custom-studio"]);

export function BrandMark() {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#A5CE79]/40 bg-gradient-to-br from-[#789B55] via-[#527B48] to-[#3E5F36] shadow-[0_6px_18px_rgba(82,123,72,0.35)]">
      <span
        className="h-3.5 w-3.5 rotate-45 rounded-[3px] border border-white/75 bg-white/25 backdrop-blur-sm"
        aria-hidden="true"
      />
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isMarketplaceRoute =
    pathname.startsWith("/marketplace") || pathname.startsWith("/products");
  const isComponentsRoute = pathname.startsWith("/components");

  const [scrolled, setScrolled] = useState(false);
  const [expandedHref, setExpandedHref] = useState<string | null>(null);
  const { user: authUser, displayName, loading: authLoading, signOut } = useAuthSession();

  const iconNavItems = useMemo<IconNavItem[]>(
    () =>
      NAV_ITEMS.map((item) => ({
        label: item.label,
        href: item.href,
        icon: ICON_BY_HREF[item.href] ?? Home,
      })),
    [],
  );

  const routeActiveHref = isMarketplaceRoute
    ? "/marketplace"
    : isComponentsRoute
      ? "/components"
      : null;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSelect = (
    item: IconNavItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (!authLoading && !authUser && GATED_HREFS.has(item.href)) {
      event.preventDefault();
      showAuthToast("Please sign in to continue");
      router.push(buildLoginRedirectUrl(item.href));
      return;
    }
    setExpandedHref(item.href);
  };

  const handleBuildClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!authLoading && !authUser) {
      event.preventDefault();
      showAuthToast("Please sign in to continue");
      router.push(buildLoginRedirectUrl("/custom-studio"));
    }
  };

  const accountHref = authUser
    ? authUser.role === "admin"
      ? "/admin"
      : "/account"
    : "/login";

  return (
    <header
      className={`${
        isHome ? "fixed top-0 right-0 left-0" : "sticky top-0"
      } z-50 w-full px-3 pt-3 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto max-w-[var(--container-max)]">
        <div
          className={`navbar-glass flex flex-col gap-2 rounded-[26px] px-3.5 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:rounded-[var(--radius-pill)] lg:px-5 ${
            scrolled ? "navbar-glass--scrolled" : ""
          }`}
        >
          {/* Top Row: Brand + Mobile Actions */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/#top"
              onClick={() => setExpandedHref(null)}
              className="flex items-center gap-2.5 rounded-full pr-2 focus-visible:outline-2"
            >
              <BrandMark />
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold tracking-[0.1em] text-[var(--text-primary)] sm:text-base sm:tracking-[0.12em]">
                  {SITE_CONFIG.brandName}
                </span>
                <span className="hidden font-mono text-[10px] tracking-wider text-[var(--text-muted)] sm:block">
                  DIGITAL STUDIO
                </span>
              </div>
            </Link>

            {/* Mobile / Tablet Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
              <ThemeToggle />
              <NavCartButton />
              {authUser ? (
                <>
                  <Link
                    href={accountHref}
                    aria-label={displayName ?? "Account"}
                    className="inline-flex h-10 max-w-[110px] items-center gap-1.5 rounded-full border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3 text-xs font-medium text-[var(--text-primary)]"
                  >
                    <User className="h-3.5 w-3.5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                    <span className="truncate">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    aria-label="Sign out"
                    title="Sign out"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] hover:border-red-400/50 hover:text-red-500 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in"
                  className="inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)]"
                >
                  <User className="h-3.5 w-3.5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span>Sign in</span>
                </Link>
              )}
              <Link
                href="/custom-studio"
                onClick={handleBuildClick}
                className="inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-2.5 text-xs font-semibold text-white shadow-sm"
              >
                <span className="hidden sm:inline">Build Solution</span>
                <span className="sm:hidden">Build</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Center: Icon-Only Animated Navbar (labels hidden until clicked) */}
          <div className="flex w-full justify-center overflow-x-auto lg:w-auto lg:overflow-visible">
            <IconNavbarMenu
              items={iconNavItems}
              activeHref={expandedHref}
              routeActiveHref={routeActiveHref}
              onSelect={handleSelect}
              className="max-w-full"
            />
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <NavCartButton />
            {authUser ? (
              <>
                <Link
                  href={accountHref}
                  className="inline-flex min-h-9 max-w-[150px] items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)]"
                >
                  <User className="h-3.5 w-3.5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span className="truncate">{displayName}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  aria-label="Sign out"
                  title="Sign out"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-red-400/50 hover:text-red-500 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)]"
              >
                <User className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Sign in</span>
              </Link>
            )}
            <Link
              href="/custom-studio"
              onClick={handleBuildClick}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-4 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(82,123,72,0.3)] transition-opacity hover:opacity-95"
            >
              <span>Build Solution</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
