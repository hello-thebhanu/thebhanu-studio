"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "customer";
}

export const AUTH_CHANGE_EVENT = "thebhanu-auth-changed";

export function formatDisplayName(
  fullName?: string | null,
  email?: string | null,
): string {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;
  const prefix = (email ?? "").split("@")[0]?.trim();
  if (!prefix) return "Friend";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function useAuthSession() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
      } else {
        const data = (await res.json()) as { user?: AuthSessionUser | null };
        setUser(data.user ?? null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data: { user?: AuthSessionUser | null }) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const onAuthChange = () => {
      void refresh();
    };
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      notifyAuthChanged();
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const displayName = user
    ? formatDisplayName(user.fullName, user.email)
    : null;

  return { user, loading, displayName, refresh, signOut };
}
