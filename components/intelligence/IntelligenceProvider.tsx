"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type IntelligenceContextValue = {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intelligence/executive");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          router.replace("/register");
          return;
        }
        setError(data.message || "加载 Intelligence 失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ loading, error, refresh }),
    [loading, error, refresh],
  );

  return (
    <IntelligenceContext.Provider value={value}>{children}</IntelligenceContext.Provider>
  );
}

export function useIntelligenceShell() {
  const ctx = useContext(IntelligenceContext);
  if (!ctx) throw new Error("useIntelligenceShell must be used within IntelligenceProvider");
  return ctx;
}
