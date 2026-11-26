"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  createThemeSwitch,
  type ThemeSwitchEngine,
} from "@/components/pinui/theme-switch-engine";
import "@/components/pinui/theme-switch.css";

const emptySubscribe = () => () => {};

export function ThemeToggle({ showLabels = false }: { showLabels?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const engineRef = useRef<ThemeSwitchEngine | null>(null);
  const setThemeRef = useRef(setTheme);

  useEffect(() => {
    setThemeRef.current = setTheme;
  }, [setTheme]);

  useEffect(() => {
    if (!mounted) return;
    const root = overlayRef.current;
    const button = buttonRef.current;
    const fx = fxRef.current;
    if (!root || !button || !fx) return;

    const engine = createThemeSwitch({
      root,
      button,
      fx,
      effect: () => "diwali",
      sound: () => true,
      onCommit: (next) => setThemeRef.current(next),
    });
    engineRef.current = engine;

    const warm = () => engine.prepare();
    let idleId: number | undefined;
    let timerId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: 1500 });
    } else {
      timerId = window.setTimeout(warm, 250);
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, [mounted]);

  useEffect(() => {
    const root = overlayRef.current;
    if (!root || engineRef.current?.busy()) return;
    root.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const nextLabel = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Switch to ${nextLabel} theme`}
        title={`Switch to ${nextLabel} theme (Diwali burst)`}
        className={`relative inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] backdrop-blur-md transition-colors duration-200 hover:border-[var(--accent-soft)] hover:bg-[var(--glass-bg-strong)] cursor-pointer ${
          showLabels ? "h-9 px-3.5 text-xs font-medium" : "h-9 w-9"
        }`}
      >
        <span className="relative grid h-4 w-4 place-items-center" data-theme={resolvedTheme}>
          {/* Moon on light theme -> click for dark */}
          <svg
            className="pts__icon pts__icon--moon h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20.985 12.486C20.8913 14.2221 20.2967 15.894 19.2731 17.2994C18.2495 18.7048 16.8407 19.7837 15.217 20.4055C13.5934 21.0274 11.8243 21.1656 10.1238 20.8035C8.42322 20.4414 6.86395 19.5945 5.63446 18.3652C4.40497 17.1358 3.55789 15.5766 3.19562 13.8761C2.83334 12.1756 2.97139 10.4065 3.59308 8.78282C4.21476 7.15909 5.29346 5.75019 6.69877 4.72644C8.10409 3.70268 9.77586 3.1079 11.512 3.014C11.917 2.992 12.129 3.474 11.914 3.817C11.1949 4.96755 10.887 6.32787 11.0405 7.67595C11.194 9.02403 11.7999 10.2803 12.7593 11.2397C13.7187 12.1991 14.975 12.805 16.323 12.9585C17.6711 13.112 19.0314 12.8041 20.182 12.085C20.526 11.87 21.007 12.081 20.985 12.486Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Sun on dark theme -> click for light */}
          <svg
            className="pts__icon pts__icon--sun h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" />
            </g>
          </svg>
        </span>
        {showLabels ? (
          <span>{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
        ) : null}
      </button>

      {mounted
        ? createPortal(
            <div
              ref={overlayRef}
              className="pts pts--overlay"
              data-theme={resolvedTheme}
              data-effect="diwali"
              aria-hidden="true"
            >
              <div ref={fxRef} className="pts__fx" aria-hidden="true" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
