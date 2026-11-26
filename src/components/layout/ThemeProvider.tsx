"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ThemeMode } from "@/lib/constants";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "thebhanu-theme";
const THEME_EVENT = "thebhanu-theme-change";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return "system";
}

function applyThemeToDOM(resolved: "dark" | "light") {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
}

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_EVENT, handleChange);
  mediaQuery?.addEventListener("change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
    mediaQuery?.removeEventListener("change", handleChange);
  };
}

function getThemeSnapshot(): string {
  const mode = readStoredTheme();
  const resolved = mode === "system" ? getSystemTheme() : mode;
  return `${mode}:${resolved}`;
}

function getServerThemeSnapshot(): string {
  return "system:dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const [theme, resolvedTheme] = snapshot.split(":") as [ThemeMode, "dark" | "light"];

  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures in restricted contexts
    }
    const resolved = mode === "system" ? getSystemTheme() : mode;
    applyThemeToDOM(resolved);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
