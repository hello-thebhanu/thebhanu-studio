"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Layers, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AssetPreviewKey } from "@/lib/assets/types";

export function AssetLivePreview({
  previewKey,
  compact = false,
}: {
  previewKey: AssetPreviewKey;
  compact?: boolean;
}) {
  const [clicks, setClicks] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[radial-gradient(circle_at_70%_25%,rgba(120,155,85,0.18)_0%,transparent_65%)] bg-[var(--bg-secondary)]/85 ${
        compact ? "min-h-[168px] p-4" : "min-h-[280px] p-6 sm:p-10"
      }`}
    >
      {previewKey === "glass-card" ? (
        <GlassCard
          interactive
          className={`w-full ${compact ? "max-w-[260px] p-4" : "max-w-sm p-6"}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
              <Layers className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
              60fps Glass
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
            Nature-Glass Surface
          </p>
          {!compact ? (
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              Hover to preview GPU-composited elevation and moss border accent.
            </p>
          ) : null}
        </GlassCard>
      ) : null}

      {previewKey === "moss-button" ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setClicks((c) => c + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-xs font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:brightness-105 cursor-pointer"
          >
            <span>Primary CTA</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setClicks((c) => c + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--glass-border-accent)] cursor-pointer"
          >
            <span>Glass Pill {clicks > 0 ? `(${clicks})` : ""}</span>
          </button>
        </div>
      ) : null}

      {previewKey === "shimmer-skeleton" ? (
        <div className={`w-full ${compact ? "max-w-[260px]" : "max-w-sm"} flex flex-col gap-2.5`}>
          <div className="flex items-center gap-3">
            <Skeleton rounded="full" className="h-10 w-10 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton rounded="sm" className="h-3.5 w-3/4" />
              <Skeleton rounded="sm" className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton rounded="md" className={compact ? "h-14 w-full" : "h-24 w-full"} />
        </div>
      ) : null}

      {previewKey === "status-badges" ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#527B48]/45 bg-[#527B48]/15 px-3 py-1 font-mono text-[11px] font-medium text-[#3B5F32] dark:text-[#C5E89E]">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Available
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#A5CE79]/55 bg-[#527B48] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Featured
          </span>
          <span className="inline-flex items-center rounded-full border border-[#789B55]/45 bg-[#789B55]/15 px-3 py-1 font-mono text-[11px] font-medium text-[#3A5424] dark:text-[#D5E6B8]">
            Coming Soon
          </span>
        </div>
      ) : null}

      {previewKey === "floating-nav" ? (
        <div className="navbar-glass flex w-full max-w-md items-center justify-between gap-2 rounded-full px-4 py-2">
          <span className="text-xs font-bold tracking-wider text-[var(--text-primary)]">
            THE BHANU
          </span>
          <div className="flex items-center gap-1">
            <span className="rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">
              Library
            </span>
            <span className="px-2 py-1 text-[11px] text-[var(--text-secondary)]">
              Docs
            </span>
          </div>
        </div>
      ) : null}

      {previewKey === "reveal-frame" ? (
        <div key={replayKey} className="flex flex-col items-center gap-3 text-center">
          <div className="glass-surface rounded-[var(--radius-md)] px-5 py-3 text-xs font-medium text-[var(--text-primary)] transition-all duration-500">
            Opacity + Transform Reveal (Zero Paint)
          </div>
          {!compact ? (
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className="rounded-full border border-[var(--glass-border)] px-3 py-1 font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Replay Preview
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
