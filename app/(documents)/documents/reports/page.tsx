"use client";

import { useEffect, useState } from "react";
import { DocumentEmptyState } from "@/components/documents/DocumentEmptyState";
import { DocumentError } from "@/components/documents/DocumentError";
import { DocumentLoading } from "@/components/documents/DocumentLoading";
import { DeliveryRow } from "@/components/documents/DeliveryRow";
import { useDocuments } from "@/components/documents/DocumentProvider";

type ReportPayload = {
  summary: {
    plansCount: number;
    budgetsCount: number;
    quotesCount: number;
    deliveriesCount: number;
  };
  downloadAnalytics: {
    totalDownloads: number;
    byType: Record<string, number>;
  };
  recentActivities: { event: string; timestamp: string }[];
};

export default function ReportsPage() {
  const { trackEvent } = useDocuments();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportPayload | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/documents/reports");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError("加载报告失败");
          return;
        }
        setReport(data.report);
        trackEvent("report_opened");
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    })();
  }, [trackEvent]);

  if (loading) return <DocumentLoading message="加载报告中心…" />;
  if (error) return <DocumentError message={error} />;
  if (!report) {
    return (
      <DocumentEmptyState
        title="暂无报告数据"
        description="完成首次交付后，将在此展示下载分析与活动摘要。"
        actionLabel="查看交付"
        actionHref="/documents/deliveries"
      />
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Report Center</h1>

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Plans", value: report.summary.plansCount },
          { label: "Budgets", value: report.summary.budgetsCount },
          { label: "Quotes", value: report.summary.quotesCount },
          { label: "Deliveries", value: report.summary.deliveriesCount },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs uppercase text-zinc-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
        <h2 className="text-lg font-semibold">Download Analytics</h2>
        <p className="mt-2 text-3xl font-bold text-sky-400">
          {report.downloadAnalytics.totalDownloads}
          <span className="ml-2 text-sm font-normal text-zinc-500">总下载次数</span>
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          {Object.entries(report.downloadAnalytics.byType).map(([type, count]) => (
            <li key={type} className="flex justify-between border-b border-zinc-900 py-2">
              <span>{type}</span>
              <span className="text-zinc-200">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Activities</h2>
        {report.recentActivities.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无活动</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {report.recentActivities.map((a, i) => (
              <li key={i} className="rounded-lg border border-zinc-800 px-4 py-2 text-zinc-400">
                {a.event} · {new Date(a.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
