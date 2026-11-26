import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "section";
}

export function GlassCard({
  children,
  className = "",
  interactive = false,
  as: Component = "div",
}: GlassCardProps) {
  const interactiveClasses = interactive
    ? "hover:-translate-y-1.5 hover:border-[var(--glass-border-accent)] hover:shadow-[var(--shadow-elevated)]"
    : "";

  return (
    <Component
      className={`glass-surface relative overflow-hidden rounded-[var(--radius-lg)] ${interactiveClasses} ${className}`}
    >
      {children}
    </Component>
  );
}
