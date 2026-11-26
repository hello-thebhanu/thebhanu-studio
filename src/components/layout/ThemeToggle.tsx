"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import type { ThemeMode } from "@/lib/constants";

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle({ showLabels = false }: { showLabels?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme selector"
      className="inline-flex items-center gap-0.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-1 backdrop-blur-md"
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={`Switch to ${label} theme`}
            aria-pressed={isActive}
            title={`${label} theme`}
            className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#527B48] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {showLabels ? <span>{label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
