"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, User, X } from "lucide-react";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/Button";

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
  const isHome = pathname === "/";
  const isMarketplaceRoute =
    pathname.startsWith("/marketplace") || pathname.startsWith("/products");
  const isComponentsRoute = pathname.startsWith("/components");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("#top");
  const [authUser, setAuthUser] = useState<{
    email: string;
    role: "admin" | "customer";
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data: { user?: { email: string; role: "admin" | "customer" } | null }) => {
        if (active) setAuthUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setAuthUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy runs on the homepage only
  useEffect(() => {
    if (!isHome) return;

    const sectionIds = ["top", "services", "products", "projects", "about", "contact"];
    const updateActiveSection = () => {
      const scrollMarker = window.scrollY + 140;
      let current = "#top";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollMarker >= top) {
            current = `#${id}`;
          }
        }
      }
      setActiveHash(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("hashchange", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [isHome]);

  const isNavItemActive = (href: string) => {
    if (isMarketplaceRoute) {
      return href === "/marketplace";
    }
    if (isComponentsRoute) {
      return href === "/components";
    }
    if (isHome) {
      return href === `/${activeHash}`;
    }
    return false;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={`${
        isHome ? "fixed top-0 right-0 left-0" : "sticky top-0"
      } z-50 w-full px-4 pt-3 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto max-w-[var(--container-max)]">
        <nav
          aria-label="Primary navigation"
          className={`navbar-glass flex items-center justify-between gap-3 rounded-[var(--radius-pill)] px-3.5 py-2.5 sm:px-5 ${
            scrolled ? "navbar-glass--scrolled" : ""
          }`}
        >
          {/* Brand Identity */}
          <Link
            href="#top"
            className="flex items-center gap-2.5 rounded-full pr-2 focus-visible:outline-2"
            onClick={() => setMobileOpen(false)}
          >
            <BrandMark />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-[0.12em] text-[var(--text-primary)] sm:text-base">
                {SITE_CONFIG.brandName}
              </span>
              <span className="hidden font-mono text-[10px] tracking-wider text-[var(--text-muted)] sm:block">
                DIGITAL STUDIO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent-primary)]"
                        : "border-transparent font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Link
              href={authUser ? "/account" : "/login"}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-3.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)]"
            >
              <User className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              <span>{authUser ? "Account" : "Sign In"}</span>
            </Link>
            <Button href="/custom-studio" variant="primary" size="sm">
              <span>Build Solution</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)] cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        {mobileOpen ? (
          <div
            id="mobile-navigation-drawer"
            className="navbar-glass navbar-glass--scrolled mt-2.5 rounded-[var(--radius-lg)] p-4 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-11 items-center justify-between rounded-[var(--radius-md)] px-3.5 py-2.5 text-base transition-colors ${
                        active
                          ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-primary)]"
                          : "font-medium text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight
                        className={`h-4 w-4 ${active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--glass-border)] pt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Appearance
                </span>
                <ThemeToggle showLabels />
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={authUser ? "/account" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
                >
                  <User className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span>{authUser ? "My Account" : "Sign In / Sign Up"}</span>
                </Link>
              </div>
              <Button
                href="/custom-studio"
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                <span>Build Your Solution</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
