"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CustomerProfileRecord } from "@/lib/projects/types";

export function CustomersManagerClient({
  customers,
  projectCountsByEmail,
}: {
  customers: CustomerProfileRecord[];
  projectCountsByEmail: Record<string, number>;
}) {
  const router = useRouter();
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const saveNotes = async (id: string) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notesDraft[id] ?? "" }),
      });
      if (res.ok) {
        setFeedback("Customer note saved.");
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[var(--accent-primary)]" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Registered Accounts &amp; Customers ({customers.length})
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              View customer profiles, linked project counts, and internal notes.
            </p>
          </div>
        </div>
      </GlassCard>

      {feedback ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] p-3 font-mono text-xs text-[var(--accent-primary)]">
          {feedback}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {customers.map((cust) => {
          const count = projectCountsByEmail[cust.email.toLowerCase()] ?? 0;
          const noteVal = notesDraft[cust.id] ?? cust.adminNotes;
          return (
            <GlassCard key={cust.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {cust.fullName || cust.email}
                    </span>
                    <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] uppercase text-[var(--accent-primary)]">
                      {cust.role}
                    </span>
                    <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                      {count} project{count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                    {cust.email}
                    {cust.company ? ` · ${cust.company}` : ""}
                    {cust.phone ? ` · ${cust.phone}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:w-96">
                  <input
                    type="text"
                    value={noteVal}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({
                        ...prev,
                        [cust.id]: e.target.value,
                      }))
                    }
                    placeholder="Internal customer note..."
                    className="min-h-9 flex-1 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/70 px-3 text-xs text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    disabled={busyId === cust.id}
                    onClick={() => saveNotes(cust.id)}
                    className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
