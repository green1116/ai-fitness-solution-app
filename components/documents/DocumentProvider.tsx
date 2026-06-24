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
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";
import type { DocumentsSummary } from "@/lib/portal/v58/documents/documents.aggregator";

type DocumentsContextValue = {
  loading: boolean;
  error: string | null;
  summary: DocumentsSummary | null;
  deliveries: DeliveryRecord[];
  refresh: () => Promise<void>;
  trackEvent: (
    event: string,
    meta?: Record<string, unknown> & {
      projectId?: string;
      quoteId?: string;
      deliveryId?: string;
    },
  ) => void;
};

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DocumentsSummary | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, deliveriesRes] = await Promise.all([
        fetch("/api/documents/summary"),
        fetch("/api/documents/deliveries"),
      ]);
      const summaryData = await summaryRes.json();
      const deliveriesData = await deliveriesRes.json();

      if (!summaryRes.ok || !summaryData.ok) {
        if (summaryRes.status === 401) {
          router.replace("/register");
          return;
        }
        setError(summaryData.message || "加载文档中心失败");
        return;
      }

      setSummary(summaryData.summary);
      setDeliveries(deliveriesData.deliveries ?? []);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trackEvent = useCallback(
    (
      event: string,
      meta?: Record<string, unknown> & {
        projectId?: string;
        quoteId?: string;
        deliveryId?: string;
      },
    ) => {
      void fetch("/api/documents/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          projectId: meta?.projectId,
          quoteId: meta?.quoteId,
          deliveryId: meta?.deliveryId,
          meta,
        }),
      });
    },
    [],
  );

  const value = useMemo<DocumentsContextValue>(
    () => ({ loading, error, summary, deliveries, refresh, trackEvent }),
    [loading, error, summary, deliveries, refresh, trackEvent],
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentProvider");
  return ctx;
}
