"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Clock } from "lucide-react";
import {
  buildLoginRedirectUrl,
  showAuthToast,
} from "@/components/auth/AuthToast";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SylvaReveal } from "@/components/ui/SylvaReveal";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MARKETPLACE_TRACKS_PREVIEW } from "@/lib/constants";

export function ProductsPreview() {
  const router = useRouter();
  const { user, loading } = useAuthSession();

  const handleGatedClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (!loading && !user) {
      e.preventDefault();
      showAuthToast("Please sign in to continue");
      router.push(buildLoginRedirectUrl(path));
    }
  };
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="py-[var(--section-y)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <SylvaReveal radius="1rem">
          <div className="section-text-scrim flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              id="products-heading"
              eyebrow="Marketplace"
              title="A growing catalogue of digital products."
              description="Templates, UI systems, full-stack starters and AI tools, built to ship and ready to adapt."
            />

            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--bg-elevated)]/90 px-4 py-2 font-mono text-xs font-medium text-[var(--accent-primary)] shadow-sm backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sample catalogue live</span>
            </div>
          </div>
        </SylvaReveal>

        {/* Transparent Placeholder Preview Grid (no fabricated product claims) */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETPLACE_TRACKS_PREVIEW.map((track, index) => (
            <SylvaReveal
              key={track.id}
              delay={Math.min(index * 0.08, 0.28)}
              className="h-full"
            >
              <GlassCard
                as="article"
                interactive
                className="flex h-full flex-col justify-between border-dashed p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--accent-primary)]">
                      <Box className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      Coming Soon
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
                    {track.category}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {track.summary}
                  </p>
                </div>

                <div className="mt-6 border-t border-[var(--glass-border)] pt-3 font-mono text-[11px] text-[var(--accent-primary)]">
                  {track.plannedPhase}
                </div>
              </GlassCard>
            </SylvaReveal>
          ))}
        </div>

        <SylvaReveal delay={0.18}>
          <GlassCard className="mt-6 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Sample Digital Products Ready to Browse
              </p>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Explore all 10 product tracks, search by stack, filter by availability, and
                inspect detailed specifications in the marketplace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/marketplace"
                onClick={(e) => handleGatedClick(e, "/marketplace")}
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(82,123,72,0.3)] transition-opacity hover:opacity-95"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/custom-studio"
                onClick={(e) => handleGatedClick(e, "/custom-studio")}
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)]"
              >
                Request Custom Build
              </Link>
            </div>
          </GlassCard>
        </SylvaReveal>
      </div>
    </section>
  );
}
