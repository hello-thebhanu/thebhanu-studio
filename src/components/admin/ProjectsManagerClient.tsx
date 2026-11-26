"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  Download,
  FileText,
  Lock,
  Plus,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  PROJECT_LIFECYCLE_STATUSES,
  type ProjectFileRecord,
  type ProjectRecord,
  type ProjectStatus,
  type ProjectUpdateRecord,
} from "@/lib/projects/types";

interface ProjectDetailsState {
  updates: ProjectUpdateRecord[];
  files: Array<ProjectFileRecord & { signedUrl?: string | null }>;
}

export function ProjectsManagerClient({
  schemaReady,
  errorMessage,
  initialProjects,
}: {
  schemaReady: boolean;
  errorMessage?: string;
  initialProjects: ProjectRecord[];
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [projectType, setProjectType] = useState("Full-Stack Application");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [description, setDescription] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsMap, setDetailsMap] = useState<
    Record<string, ProjectDetailsState>
  >({});

  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isDeliverable, setIsDeliverable] = useState(true);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async (projectId: string) => {
    const res = await fetch(`/api/admin/projects/${projectId}`);
    if (res.ok) {
      const data = (await res.json()) as ProjectDetailsState;
      setDetailsMap((prev) => ({ ...prev, [projectId]: data }));
    }
  };

  const toggleExpand = async (projectId: string) => {
    if (expandedId === projectId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(projectId);
    await loadDetails(projectId);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          customerEmail,
          projectType,
          budget,
          timeline,
          description,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        projectCode?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to create project.");
      } else {
        setShowCreate(false);
        setTitle("");
        setCustomerEmail("");
        setBudget("");
        setTimeline("");
        setDescription("");
        setFeedback(`Created project ${data.projectCode}.`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFeedback(`Updated status to "${status}".`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePostUpdate = async (projectId: string) => {
    if (!updateMsg.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateTitle.trim(),
          message: updateMsg.trim(),
          isInternal,
        }),
      });
      if (res.ok) {
        setUpdateTitle("");
        setUpdateMsg("");
        setIsInternal(false);
        await loadDetails(projectId);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUploadFile = async (
    projectId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("isDeliverable", String(isDeliverable));
      const res = await fetch(`/api/admin/projects/${projectId}/files`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        await loadDetails(projectId);
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete project ${code} and all its files/updates?`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback(`Deleted ${code}.`);
        router.refresh();
      }
    } finally {
      setBusy(false);
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
              Phase 7/8 Database Migration Required
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Run{" "}
              <code className="rounded bg-[var(--glass-bg-subtle)] px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/ALL_REMAINING_SETUP.sql
              </code>{" "}
              in Supabase SQL Editor to enable project management.
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
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Client Projects ({initialProjects.length})
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage project lifecycle stages, post updates, and share deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-xs font-semibold text-white cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New Project</span>
        </button>
      </GlassCard>

      {error ? (
        <div className="rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] p-3 font-mono text-xs text-[var(--accent-primary)]">
          {feedback}
        </div>
      ) : null}

      {showCreate ? (
        <GlassCard className="p-6">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Create Client Project
          </h3>
          <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title *"
              className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
            />
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Customer email *"
              className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
            />
            <input
              type="text"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              placeholder="Project type"
              className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Budget"
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="Timeline"
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope & requirements summary"
              className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)] sm:col-span-2"
            />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-4 text-xs text-[var(--text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="min-h-10 rounded-[var(--radius-pill)] bg-[#527B48] px-5 text-xs font-semibold text-white cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </form>
        </GlassCard>
      ) : null}

      {initialProjects.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <Briefcase className="mx-auto h-7 w-7 text-[var(--text-muted)]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            No active projects yet. Create one above or convert an enquiry from{" "}
            <span className="font-mono">/admin/enquiries</span>.
          </p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {initialProjects.map((proj) => {
            const isOpen = expandedId === proj.id;
            const details = detailsMap[proj.id];
            return (
              <GlassCard key={proj.id} className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--accent-primary)]">
                        {proj.projectCode}
                      </span>
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        {proj.title}
                      </h3>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                      {proj.customerEmail} · {proj.projectType}
                      {proj.budget ? ` · ${proj.budget}` : ""}
                      {proj.timeline ? ` · ${proj.timeline}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={proj.status}
                      disabled={busy}
                      onChange={(e) =>
                        handleStatusChange(proj.id, e.target.value as ProjectStatus)
                      }
                      aria-label={`Lifecycle status for ${proj.projectCode}`}
                      className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-xs font-medium text-[var(--text-primary)]"
                    >
                      {PROJECT_LIFECYCLE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => toggleExpand(proj.id)}
                      className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer"
                    >
                      {isOpen ? "Hide Workspace" : "Updates & Files"}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(proj.id, proj.projectCode)}
                      aria-label={`Delete ${proj.projectCode}`}
                      className="inline-flex min-h-9 items-center rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 text-red-500 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-5 grid grid-cols-1 gap-6 border-t border-[var(--glass-border)] pt-5 lg:grid-cols-12">
                    {/* Updates */}
                    <div className="flex flex-col gap-3 lg:col-span-7">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                        Updates &amp; Communication
                      </h4>
                      <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-3">
                        <input
                          type="text"
                          value={updateTitle}
                          onChange={(e) => setUpdateTitle(e.target.value)}
                          placeholder="Update title (optional)"
                          className="min-h-8 rounded border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-2.5 text-xs text-[var(--text-primary)]"
                        />
                        <textarea
                          rows={2}
                          value={updateMsg}
                          onChange={(e) => setUpdateMsg(e.target.value)}
                          placeholder="Write a progress update or internal note..."
                          className="rounded border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 p-2.5 text-xs text-[var(--text-primary)]"
                        />
                        <div className="flex items-center justify-between">
                          <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isInternal}
                              onChange={(e) => setIsInternal(e.target.checked)}
                              className="accent-[#527B48]"
                            />
                            <Lock className="h-3 w-3" aria-hidden="true" />
                            <span>Internal Note (hidden from customer)</span>
                          </label>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handlePostUpdate(proj.id)}
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[#527B48] px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                          >
                            <Send className="h-3 w-3" aria-hidden="true" />
                            <span>Post</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(details?.updates ?? []).map((u) => (
                          <div
                            key={u.id}
                            className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/40 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {u.title || (u.authorRole === "admin" ? "Studio Update" : "Customer Reply")}
                              </span>
                              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                                {u.isInternal ? "INTERNAL" : u.authorRole.toUpperCase()}
                              </span>
                            </div>
                            <p className="mt-1 whitespace-pre-line text-[var(--text-secondary)]">
                              {u.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Files & Deliverables */}
                    <div className="flex flex-col gap-3 lg:col-span-5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                        Files &amp; Deliverables
                      </h4>
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-3">
                        <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDeliverable}
                            onChange={(e) => setIsDeliverable(e.target.checked)}
                            className="accent-[#527B48]"
                          />
                          <span>Mark as Deliverable</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer">
                          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            onChange={(e) => handleUploadFile(proj.id, e)}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(details?.files ?? []).map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/40 p-2.5 text-xs"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[var(--text-primary)]">
                                  {f.fileName}
                                </p>
                                <p className="font-mono text-[10px] text-[var(--text-muted)]">
                                  {f.isDeliverable ? "Deliverable" : "Shared File"} ·{" "}
                                  {Math.max(1, Math.round(f.fileSize / 1024))} KB
                                </p>
                              </div>
                            </div>
                            {f.signedUrl ? (
                              <a
                                href={f.signedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--glass-border)] px-2.5 py-1 text-[11px] text-[var(--accent-primary)] hover:underline"
                              >
                                <Download className="h-3 w-3" aria-hidden="true" />
                                <span>Get</span>
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
