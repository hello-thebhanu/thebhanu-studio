"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Mail,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { EnquiryRecord, EnquiryStatus } from "@/lib/enquiries/types";

const STATUS_OPTIONS: EnquiryStatus[] = [
  "New",
  "Reviewing",
  "Proposal Sent",
  "Accepted",
  "Archived",
];

export function EnquiriesManagerClient({
  schemaReady,
  errorMessage,
  initialEnquiries,
}: {
  schemaReady: boolean;
  errorMessage?: string;
  initialEnquiries: EnquiryRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "all">("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialEnquiries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.referenceCode.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.customerEmail.toLowerCase().includes(q) ||
        e.projectType.toLowerCase().includes(q)
      );
    });
  }, [initialEnquiries, query, statusFilter]);

  const updateEnquiry = async (
    id: string,
    patch: { status?: EnquiryStatus; adminNotes?: string }
  ) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setFeedback("Enquiry updated.");
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string, refCode: string) => {
    if (!window.confirm(`Delete enquiry ${refCode}?`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback(`Deleted ${refCode}.`);
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  if (!schemaReady) {
    return (
      <GlassCard className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-500">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Phase 6 SQL Migration Required
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Run{" "}
              <code className="rounded bg-[var(--glass-bg-subtle)] px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/0003_phase6_custom_studio_enquiries.sql
              </code>{" "}
              in your Supabase SQL Editor to create the `enquiries` table, then
              refresh this page.
            </p>
            {errorMessage ? (
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                Details: {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference (BHN-...), customer name, email, or track..."
            className="min-h-10 w-full rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 pr-4 pl-10 text-sm text-[var(--text-primary)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as EnquiryStatus | "all")
          }
          aria-label="Filter enquiries by status"
          className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-4 text-xs font-medium text-[var(--text-primary)]"
        >
          <option value="all">All Statuses ({initialEnquiries.length})</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </GlassCard>

      {feedback ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] p-3 font-mono text-xs text-[var(--accent-primary)]">
          {feedback}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <MessageSquare
            className="mx-auto h-7 w-7 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
            No project enquiries yet.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Submissions from /custom-studio will appear here automatically.
          </p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((enq) => {
            const notesValue = notesDraft[enq.id] ?? enq.adminNotes;
            const busy = busyId === enq.id;
            return (
              <GlassCard key={enq.id} className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--glass-border)] pb-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--accent-primary)]">
                        {enq.referenceCode}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {enq.projectType}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {enq.customerName} ·{" "}
                      <a
                        href={`mailto:${enq.customerEmail}?subject=Re:%20${encodeURIComponent(enq.referenceCode)}`}
                        className="inline-flex items-center gap-1 underline hover:text-[var(--accent-primary)]"
                      >
                        <Mail className="h-3 w-3" aria-hidden="true" />
                        {enq.customerEmail}
                      </a>
                      {enq.customerCompany ? ` · ${enq.customerCompany}` : ""}
                      {enq.customerPhone ? ` · ${enq.customerPhone}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setBusyId(enq.id);
                        setFeedback(null);
                        try {
                          const res = await fetch("/api/admin/projects", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: `${enq.projectType} — ${enq.customerName}`,
                              description: enq.projectDescription,
                              projectType: enq.projectType,
                              customerEmail: enq.customerEmail,
                              enquiryId: enq.id,
                              budget: enq.budgetRange,
                              timeline: enq.expectedTimeline,
                            }),
                          });
                          const data = (await res.json()) as {
                            error?: string;
                            projectCode?: string;
                          };
                          if (res.ok) {
                            setFeedback(
                              `Converted ${enq.referenceCode} to project ${data.projectCode}.`
                            );
                            router.refresh();
                          } else {
                            setFeedback(data.error ?? "Conversion failed.");
                          }
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 text-xs font-medium text-[var(--accent-primary)] cursor-pointer"
                    >
                      Convert to Project
                    </button>
                    <select
                      value={enq.status}
                      disabled={busy}
                      onChange={(e) =>
                        updateEnquiry(enq.id, {
                          status: e.target.value as EnquiryStatus,
                        })
                      }
                      aria-label={`Status for ${enq.referenceCode}`}
                      className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-xs font-medium text-[var(--text-primary)]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(enq.id, enq.referenceCode)}
                      aria-label={`Delete ${enq.referenceCode}`}
                      className="inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 text-red-500 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                      Budget: {enq.budgetRange} · Timeline: {enq.expectedTimeline}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm text-[var(--text-secondary)]">
                      {enq.projectDescription}
                    </p>
                    {enq.selectedFeatures.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {enq.selectedFeatures.map((f) => (
                          <span
                            key={f}
                            className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 lg:col-span-5">
                    <textarea
                      rows={2}
                      value={notesValue}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({
                          ...prev,
                          [enq.id]: e.target.value,
                        }))
                      }
                      placeholder="Internal admin notes..."
                      className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/70 p-2.5 text-xs text-[var(--text-primary)]"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        updateEnquiry(enq.id, { adminNotes: notesValue })
                      }
                      className="self-end rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
