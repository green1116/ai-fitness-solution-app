"use client";

import { useEffect, useState } from "react";

type Dashboard = {
  quoteSuccessRate: number;
  pdfDownloadSuccessRate: number;
  tenderPackSuccessRate: number;
  feedbackVolume: number;
  issueBacklog: number;
  overallHealth: number;
};

export default function PilotHealthPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    void fetch("/api/pilot/health")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDashboard(d.dashboard);
      });
  }, []);

  if (!dashboard) return <p className="text-zinc-400">加载健康面板…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pilot Health Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[
          { label: "Overall Health", value: `${dashboard.overallHealth}%` },
          { label: "Quote Success", value: `${dashboard.quoteSuccessRate}%` },
          { label: "PDF Download", value: `${dashboard.pdfDownloadSuccessRate}%` },
          { label: "Tender Pack", value: `${dashboard.tenderPackSuccessRate}%` },
          { label: "Feedback Volume", value: dashboard.feedbackVolume },
          { label: "Issue Backlog", value: dashboard.issueBacklog },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className="text-xs text-zinc-500">{m.label}</p>
            <p className="mt-1 text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
