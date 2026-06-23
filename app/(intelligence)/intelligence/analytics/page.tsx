"use client";

import { useEffect, useState } from "react";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import type { IntelligenceAnalyticsReport } from "@/lib/portal/v59/analytics/intelligence-analytics.types";
import type { DeliveryTrackingSnapshot } from "@/lib/portal/v59/tracking/delivery-tracking.intelligence";

export default function AnalyticsIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<IntelligenceAnalyticsReport | null>(null);
  const [tracking, setTracking] = useState<DeliveryTrackingSnapshot | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/intelligence/analytics");
      const data = await res.json();
      if (data.ok) {
        setAnalytics(data.analytics);
        setTracking(data.tracking);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading message="加载 Analytics Intelligence…" />;
  if (!analytics || !tracking) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics Intelligence</h1>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">Activity Score</p>
          <p className="mt-2 text-3xl font-bold">{analytics.activityScore}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">Delivery Score</p>
          <p className="mt-2 text-3xl font-bold">{analytics.deliveryScore}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">PDF Downloads</p>
          <p className="mt-2 text-3xl font-bold">{tracking.pdfDownloaded}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">Total Events</p>
          <p className="mt-2 text-3xl font-bold">{analytics.totalEvents}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
        <h2 className="text-lg font-semibold">Event Distribution</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {Object.entries(analytics.byEvent).map(([event, count]) => (
            <li key={event} className="flex justify-between border-b border-zinc-900 py-2 text-zinc-400">
              <span>{event}</span>
              <span className="text-white">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          {tracking.recentActivity.map((a, i) => (
            <li key={i} className="rounded-lg border border-zinc-800 px-4 py-2">
              {a.event} · {new Date(a.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
