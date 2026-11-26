"use client";

import Link from "next/link";
import { ArrowUpRight, Box, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SylvaReveal } from "@/components/ui/SylvaReveal";
import {
  Expandable,
  ExpandableCard,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";
import { MARKETPLACE_TRACKS_PREVIEW } from "@/lib/constants";

export function ProductsPreview() {
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

            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--bg-elevated)]/90 px-4 py-2 font-mono text-xs font-medium text-[var(--accent-primary)] shadow-sm">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sample catalogue live</span>
            </div>
          </div>
        </SylvaReveal>

        {/* Expandable Product Track Preview Grid */}
        <div className="mt-10 grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETPLACE_TRACKS_PREVIEW.map((track, index) => (
            <SylvaReveal
              key={track.id}
              delay={Math.min(index * 0.08, 0.28)}
              className="w-full"
            >
              <Expandable expandDirection="vertical" transitionDuration={0.3}>
                {({ isExpanded }) => (
                  <ExpandableCard className="w-full">
                    <article className="flex flex-col p-6">
                      <ExpandableTrigger className="text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--accent-primary)]">
                            <Box className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-300 ${
                              isExpanded ? "rotate-180 text-[var(--accent-primary)]" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
                          {track.category}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {track.summary}
                        </p>
                      </ExpandableTrigger>

                      <ExpandableContent preset="fade" stagger>
                        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--glass-border)] pt-3">
                          <span className="font-mono text-[11px] text-[var(--accent-primary)]">
                            {track.plannedPhase}
                          </span>
                          <Link
                            href="/marketplace"
                            className="inline-flex items-center justify-between rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-2 text-xs font-medium text-[var(--accent-primary)] hover:bg-[#527B48] hover:text-white"
                          >
                            <span>Browse Track</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                      </ExpandableContent>
                    </article>
                  </ExpandableCard>
                )}
              </Expandable>
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
              <Button href="/marketplace" variant="primary" size="sm">
                Explore Marketplace
              </Button>
              <Button href="/#contact" variant="glass" size="sm">
                Request Custom Build
              </Button>
            </div>
          </GlassCard>
        </SylvaReveal>
      </div>
    </section>
  );
}
