"use client";

import { useEffect, useState } from "react";

export default function PilotTelemetryPage() {
  const [counts, setCounts] = useState<Record<string, { total: number; success: number }>>({});
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    void fetch("/api/pilot/telemetry")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setCounts(d.report.countsByName);
          setSuccessRate(d.report.successRate);
        }
      });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pilot Telemetry</h2>
      <p className="text-sm text-zinc-400">Success rate: {successRate}%</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(counts).map(([name, c]) => (
          <div key={name} className="flex justify-between rounded-lg border border-zinc-800 bg-black/30 px-4 py-2 text-sm">
            <span className="text-zinc-400">{name}</span>
            <span>
              {c.total} <span className="text-emerald-500">({c.success} ok)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
