import Link from "next/link";
import { NAV_ITEMS, SERVICES_PREVIEW, SITE_CONFIG } from "@/lib/constants";
import { BrandMark } from "@/components/layout/Navbar";

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--glass-border)] bg-[var(--bg-secondary)]/70 backdrop-blur-md">
      <div className="mx-auto max-w-[var(--container-max)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/#top" className="inline-flex w-fit items-center gap-3">
              <BrandMark />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-[0.12em] text-[var(--text-primary)]">
                  {SITE_CONFIG.brandName}
                </span>
                <span className="font-mono text-xs text-[var(--accent-primary)]">
                  {SITE_CONFIG.tagline}
                </span>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
              An independent digital product studio and software engineering platform
              building web experiences, full-stack applications, AI solutions, and
              modular digital products.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-xs text-[var(--text-muted)]">
              <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1">
                {SITE_CONFIG.domain}
              </span>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-wider uppercase text-[var(--text-primary)]">
              Navigation
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities Column */}
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-wider uppercase text-[var(--text-primary)]">
              Capabilities
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SERVICES_PREVIEW.map((service) => (
                <li key={service.id}>
                  <Link
                    href="/#services"
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)]"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[var(--glass-border)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center">
          <p>© 2026 {SITE_CONFIG.brandName}. Built with Next.js, TypeScript &amp; Three.js.</p>
          <p className="font-mono">
            Contact:{" "}
            <a
              href={`mailto:${SITE_CONFIG.contactEmail}`}
              className="text-[var(--text-secondary)] underline decoration-[var(--glass-border-accent)] underline-offset-4 hover:text-[var(--accent-primary)]"
            >
              {SITE_CONFIG.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
