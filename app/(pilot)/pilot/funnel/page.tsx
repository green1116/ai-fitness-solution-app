"use client";

import { useEffect, useState } from "react";

type Stage = { stage: string; count: number; dropOffFromPrevious?: number };

export default function PilotFunnelPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    void fetch("/api/pilot/funnel")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStages(d.report.stages);
          setConversionRate(d.report.conversionRate);
        }
      });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Conversion Funnel</h2>
      <p className="text-sm text-zinc-400">端到端转化率: {conversionRate}%</p>
      <div className="space-y-2">
        {stages.map((s) => (
          <div key={s.stage} className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-black/30 px-4 py-3">
            <span className="w-32 text-sm font-medium">{s.stage}</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-sky-600"
                style={{ width: `${Math.min(100, s.count * 10)}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 w-16 text-right">{s.count}</span>
            {s.dropOffFromPrevious !== undefined ? (
              <span className="text-xs text-amber-500 w-20">-{s.dropOffFromPrevious}%</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
