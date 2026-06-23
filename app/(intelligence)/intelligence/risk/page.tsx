"use client";

import { useEffect, useState } from "react";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import { RecommendationPanel } from "@/components/intelligence/RecommendationPanel";
import { RiskBadge } from "@/components/intelligence/RiskBadge";
import type { RiskReport } from "@/lib/portal/v59/risk/risk.intelligence";
import type { Recommendation } from "@/lib/portal/v59/recommendations/recommendation.engine";

export default function RiskPage() {
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<RiskReport | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    void (async () => {
      const [riskRes, recRes] = await Promise.all([
        fetch("/api/intelligence/risk"),
        fetch("/api/intelligence/recommendations"),
      ]);
      const riskData = await riskRes.json();
      const recData = await recRes.json();
      if (riskData.ok) setRisk(riskData.risk);
      if (recData.ok) setRecommendations(recData.recommendations);
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading />;
  if (!risk) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Risk Intelligence</h1>
      <p className="text-sm text-zinc-400">共 {risk.totalRisks} 项风险</p>
      <ul className="space-y-3">
        {risk.risks.map((r) => (
          <li key={r.id} className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-zinc-500">{r.projectName} · {r.recommendedAction}</div>
              </div>
              <RiskBadge severity={r.severity} />
            </div>
          </li>
        ))}
      </ul>
      <RecommendationPanel recommendations={recommendations} title="Recommended Actions" />
    </div>
  );
}
