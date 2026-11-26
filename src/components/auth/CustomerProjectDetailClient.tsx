"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  Send,
  Upload,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  PROJECT_LIFECYCLE_STATUSES,
  type ProjectFileRecord,
  type ProjectRecord,
  type ProjectUpdateRecord,
} from "@/lib/projects/types";

export function CustomerProjectDetailClient({
  project,
  updates,
  files,
}: {
  project: ProjectRecord;
  updates: ProjectUpdateRecord[];
  files: Array<ProjectFileRecord & { signedUrl?: string | null }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStageIndex = PROJECT_LIFECYCLE_STATUSES.indexOf(project.status);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/projects/${project.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to send message.");
      } else {
        setMessage("");
        router.refresh();
      }
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/account/projects/${project.id}/files`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "File upload failed.");
      } else {
        router.refresh();
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Back to My Account</span>
      </Link>

      {/* Project Header */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 py-0.5 font-mono text-xs font-semibold text-[var(--accent-primary)]">
            {project.projectCode}
          </span>
          <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-0.5 font-mono text-xs text-[var(--text-primary)]">
            {project.status}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          {project.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {project.description || "Custom software engagement with THE BHANU."}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-[var(--text-muted)]">
          <span>Track: {project.projectType}</span>
          {project.budget ? <span>Budget: {project.budget}</span> : null}
          {project.timeline ? <span>Timeline: {project.timeline}</span> : null}
        </div>

        {/* 8-Stage Lifecycle Progress */}
        <div className="mt-6 border-t border-[var(--glass-border)] pt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            Project Lifecycle
          </p>
          <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {PROJECT_LIFECYCLE_STATUSES.map((stage, idx) => {
              const reached = idx <= currentStageIndex;
              const current = idx === currentStageIndex;
              return (
                <li
                  key={stage}
                  className={`flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-2 text-[11px] ${
                    current
                      ? "border-[var(--glass-border-accent)] bg-[#527B48] font-semibold text-white"
                      : reached
                        ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{stage}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </GlassCard>

      {error ? (
        <div className="mt-6 rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      ) : null}

      {/* Updates & Files */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <GlassCard className="p-6 lg:col-span-7">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <MessageSquare className="h-4.5 w-4.5 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Progress Updates &amp; Messages</span>
          </h2>

          <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-2">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message or requirement note to THE BHANU..."
              className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)]"
            />
            <button
              type="submit"
              disabled={sending}
              className="self-end inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[#527B48] px-4 text-xs font-semibold text-white cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{sending ? "Sending..." : "Send Message"}</span>
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-3">
            {updates.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                No updates posted yet.
              </p>
            ) : (
              updates.map((u) => (
                <div
                  key={u.id}
                  className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {u.title ||
                        (u.authorRole === "admin"
                          ? "Studio Update"
                          : "Your Message")}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[var(--accent-primary)]">
                      {u.authorRole === "admin" ? "THE BHANU" : "You"}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-[var(--text-secondary)]">
                    {u.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Files &amp; Deliverables
            </h2>
            <label className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{uploading ? "Uploading..." : "Upload File"}</span>
              <input
                type="file"
                disabled={uploading}
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            {files.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                No shared files or deliverables yet.
              </p>
            ) : (
              files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                        {f.fileName}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)]">
                        {f.isDeliverable ? "Deliverable" : "Project File"} ·{" "}
                        {Math.max(1, Math.round(f.fileSize / 1024))} KB
                      </p>
                    </div>
                  </div>
                  {f.signedUrl ? (
                    <a
                      href={f.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)] hover:bg-[#527B48] hover:text-white"
                    >
                      <Download className="h-3 w-3" aria-hidden="true" />
                      <span>Download</span>
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
