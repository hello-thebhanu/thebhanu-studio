interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "text-center mx-auto items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 max-w-2xl ${alignment}`}>
      <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs font-medium tracking-wider uppercase text-[var(--accent-primary)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
