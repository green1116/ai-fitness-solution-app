"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });
    const d = (await r.json().catch(() => ({}))) as {
      user?: AuthUser | null;
    };
    setUser(d.user ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    refresh().finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  return { user, loading, refresh };
}
