"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Globe,
  Layers,
  Plus,
  RotateCcw,
  Send,
  Smartphone,
  Workflow,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { trackEvent } from "@/lib/analytics/gtag";
import {
  BUDGET_RANGES,
  PROJECT_TYPES,
  TECH_PREFERENCES,
  TIMELINE_OPTIONS,
} from "@/lib/enquiries/config";
import type { ProjectTypeOption } from "@/lib/enquiries/types";

const TYPE_ICONS: Record<ProjectTypeOption, typeof Globe> = {
  "Website Development": Globe,
  "Full-Stack Application": Layers,
  "Android Application": Smartphone,
  "AI Solution": Bot,
  "Automation Solution": Workflow,
};

const STEPS = [
  { num: 1, label: "Project Type" },
  { num: 2, label: "Features & Stack" },
  { num: 3, label: "Budget & Contact" },
  { num: 4, label: "Review & Submit" },
];

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CustomStudioBuilder() {
  const searchParams = useSearchParams();
  const sourceProductSlug = searchParams.get("product") ?? "";

  const [step, setStep] = useState(1);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const [projectType, setProjectType] = useState<ProjectTypeOption>(
    "Website Development"
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [techPreferences, setTechPreferences] = useState<string[]>([
    "Next.js / React",
  ]);
  const [projectDescription, setProjectDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState(BUDGET_RANGES[1]);
  const [expectedTimeline, setExpectedTimeline] = useState(TIMELINE_OPTIONS[1]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const activeTypeConfig = useMemo(
    () => PROJECT_TYPES.find((p) => p.id === projectType) ?? PROJECT_TYPES[0],
    [projectType]
  );

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const addCustomFeature = () => {
    const val = customFeatureInput.trim();
    if (!val) return;
    if (!selectedFeatures.includes(val)) {
      setSelectedFeatures((prev) => [...prev, val]);
    }
    setCustomFeatureInput("");
  };

  const toggleTech = (tech: string) => {
    setTechPreferences((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const validateStep = (targetStep: number): string | null => {
    if (targetStep >= 3 && projectDescription.trim().length < 15) {
      return "Please describe what you want to build (at least 15 characters).";
    }
    if (targetStep >= 4) {
      if (customerName.trim().length < 2) {
        return "Please enter your name.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
        return "Please enter a valid email address.";
      }
    }
    return null;
  };

  const goToStep = (next: number) => {
    if (next > step) {
      const err = validateStep(next);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    setStep(next);
  };

  const handleSubmit = async () => {
    const err = validateStep(4);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          projectType,
          selectedFeatures,
          techPreferences,
          projectDescription: projectDescription.trim(),
          budgetRange,
          expectedTimeline,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerCompany: customerCompany.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          sourceProductSlug: sourceProductSlug || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        referenceCode?: string;
      };

      if (!res.ok || !data.referenceCode) {
        setError(
          data.error ??
            "Could not submit enquiry right now. Your details are preserved — please retry."
        );
        setSubmitting(false);
        return;
      }

      setSubmittedRef(data.referenceCode);
      trackEvent("submit_enquiry", {
        project_type: projectType,
        budget_range: budgetRange,
      });
      setSubmitting(false);
    } catch {
      setError(
        "Network error while sending your enquiry. Your details are preserved — please retry."
      );
      setSubmitting(false);
    }
  };

  const resetBuilder = () => {
    setStep(1);
    setIdempotencyKey(createIdempotencyKey());
    setSelectedFeatures([]);
    setProjectDescription("");
    setSubmittedRef(null);
    setError(null);
  };

  if (submittedRef) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <GlassCard className="p-8 text-center sm:p-12">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-[var(--accent-primary)]">
            Enquiry Submitted Successfully
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            We&apos;ve received your project brief.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Save your unique enquiry reference below. We will review your
            requirements for <strong>{projectType}</strong> and reply to{" "}
            <strong>{customerEmail}</strong>.
          </p>

          <div className="mt-6 inline-flex flex-col items-center rounded-[var(--radius-lg)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-6 py-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              Enquiry Reference
            </span>
            <span className="mt-1 font-mono text-xl font-bold tracking-wider text-[var(--accent-primary)]">
              {submittedRef}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetBuilder}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Start Another Brief</span>
            </button>
            <Link
              href="/marketplace"
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-sm"
            >
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      {/* Studio Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs font-medium uppercase tracking-wider text-[var(--accent-primary)]">
          Custom Solution Studio
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Scope your custom software build.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
          Tell us what you&apos;re building in four clear steps — no account
          required.
        </p>
      </div>

      {/* Stepper */}
      <ol
        aria-label="Builder steps"
        className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {STEPS.map((s) => {
          const active = step === s.num;
          const done = step > s.num;
          return (
            <li key={s.num}>
              <button
                type="button"
                onClick={() => (s.num < step ? goToStep(s.num) : undefined)}
                className={`flex w-full items-center gap-2 rounded-[var(--radius-pill)] border px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--glass-border-accent)] bg-[#527B48] text-white"
                    : done
                      ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)] cursor-pointer"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-muted)]"
                }`}
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/30 font-mono text-[11px]">
                  {done ? <Check className="h-3 w-3" aria-hidden="true" /> : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Main Step Card */}
      <GlassCard className="mx-auto mt-8 max-w-4xl p-6 sm:p-10">
        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3.5 text-sm text-red-500 dark:text-red-300"
          >
            {error}
          </div>
        ) : null}

        {/* STEP 1: Project Type */}
        {step === 1 ? (
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              1. What are we building together?
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Choose the primary track that best matches your project.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_TYPES.map((type) => {
                const Icon = TYPE_ICONS[type.id];
                const selected = projectType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProjectType(type.id)}
                    className={`flex flex-col items-start rounded-[var(--radius-lg)] border p-5 text-left transition-all cursor-pointer ${
                      selected
                        ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-glass)]"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] hover:border-[var(--glass-border-accent)]"
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--bg-elevated)]/70 text-[var(--accent-primary)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                      {type.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {type.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* STEP 2: Features, Tech & Description */}
        {step === 2 ? (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                2. Core features, stack &amp; brief
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Select suggested capabilities for{" "}
                <strong>{projectType}</strong> or add your own.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Feature Selection
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {activeTypeConfig.suggestedFeatures.map((feature) => {
                  const active = selectedFeatures.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        active
                          ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] font-medium text-[var(--text-primary)]"
                          : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          active
                            ? "border-[#527B48] bg-[#527B48] text-white"
                            : "border-[var(--glass-border-strong)]"
                        }`}
                      >
                        {active ? (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ) : null}
                      </span>
                      <span>{feature}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomFeature();
                    }
                  }}
                  placeholder="Add a custom feature (e.g. Razorpay checkout, WhatsApp alerts)..."
                  className="min-h-10 flex-1 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-4 text-sm text-[var(--text-primary)]"
                />
                <button
                  type="button"
                  onClick={addCustomFeature}
                  className="inline-flex min-h-10 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-4 text-xs font-medium text-[var(--accent-primary)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Technology Preferences
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {TECH_PREFERENCES.map((tech) => {
                  const active = techPreferences.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`rounded-[var(--radius-pill)] border px-3.5 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                        active
                          ? "border-[var(--glass-border-accent)] bg-[#527B48] text-white"
                          : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Project Description * (min 15 characters)</span>
              <textarea
                rows={4}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your business goal, target users, key workflows, or any existing references..."
                className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3.5 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>
        ) : null}

        {/* STEP 3: Budget, Timeline & Contact */}
        {step === 3 ? (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                3. Budget, timeline &amp; contact details
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Share your estimated range and how we can reach you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Estimated Budget Range *</span>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 text-sm text-[var(--text-primary)]"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Expected Timeline *</span>
                <select
                  value={expectedTimeline}
                  onChange={(e) => setExpectedTimeline(e.target.value)}
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 text-sm text-[var(--text-primary)]"
                >
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Your Name *</span>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3.5 text-sm text-[var(--text-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Email Address *</span>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3.5 text-sm text-[var(--text-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Company / Organization (optional)</span>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  placeholder="Business or studio name"
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3.5 text-sm text-[var(--text-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span>Phone / WhatsApp (optional)</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 ..."
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3.5 text-sm text-[var(--text-primary)]"
                />
              </label>
            </div>
          </div>
        ) : null}

        {/* STEP 4: Requirement Review */}
        {step === 4 ? (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                4. Review your project requirements
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Confirm the details below before submitting.
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-4 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-5 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Project Type
                </dt>
                <dd className="mt-1 font-semibold text-[var(--text-primary)]">
                  {projectType}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Budget &amp; Timeline
                </dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">
                  {budgetRange} · {expectedTimeline}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Selected Features
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedFeatures.length > 0 ? (
                    selectedFeatures.map((f) => (
                      <span
                        key={f}
                        className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/70 px-2.5 py-0.5 text-xs text-[var(--text-primary)]"
                      >
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">
                      None specifically checked
                    </span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Tech Preferences
                </dt>
                <dd className="mt-1 text-xs text-[var(--text-secondary)]">
                  {techPreferences.join(", ") || "Flexible"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Project Brief
                </dt>
                <dd className="mt-1 whitespace-pre-line text-sm text-[var(--text-secondary)]">
                  {projectDescription}
                </dd>
              </div>
              <div className="sm:col-span-2 border-t border-[var(--glass-border)] pt-3">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Contact
                </dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">
                  {customerName} · {customerEmail}
                  {customerCompany ? ` · ${customerCompany}` : ""}
                  {customerPhone ? ` · ${customerPhone}` : ""}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] px-5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-sm hover:brightness-105 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-7 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:brightness-105 disabled:opacity-60 cursor-pointer"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>
                {submitting ? "Submitting..." : error ? "Retry Submission" : "Submit Enquiry"}
              </span>
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
