"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExecutiveWidgets } from "@/components/intelligence/ExecutiveWidgets";
import { HealthBadge } from "@/components/intelligence/HealthBadge";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import { ReadinessBadge } from "@/components/intelligence/ReadinessBadge";
import { RecommendationPanel } from "@/components/intelligence/RecommendationPanel";
import { RiskBadge } from "@/components/intelligence/RiskBadge";
import type { ExecutiveDashboard } from "@/lib/portal/v59/aggregation/executive.intelligence";
import type { Recommendation } from "@/lib/portal/v59/recommendations/recommendation.engine";

export default function ExecutiveDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [executive, setExecutive] = useState<ExecutiveDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    void (async () => {
      const [execRes, recRes] = await Promise.all([
        fetch("/api/intelligence/executive"),
        fetch("/api/intelligence/recommendations"),
      ]);
      const exec = await execRes.json();
      const rec = await recRes.json();
      if (exec.ok) setExecutive(exec.executive);
      if (rec.ok) setRecommendations(rec.recommendations);
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading message="加载 Executive Dashboard…" />;
  if (!executive) return <p className="text-zinc-500">无法加载管理层视图</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {executive.organization?.name ?? "Organization"} · 高层交付智能概览
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <HealthBadge level={executive.deliveryHealth.level} score={executive.deliveryHealth.score} />
          <ReadinessBadge score={executive.readiness.overallReadiness} label="Tender Readiness" />
        </div>
      </section>

      <ExecutiveWidgets stats={executive.stats} commercial={executive.commercial} />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">Readiness · Ready</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{executive.readinessDistribution.ready}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">Readiness · Partial</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{executive.readinessDistribution.partial}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          <p className="text-xs text-zinc-500">Readiness · Missing</p>
          <p className="mt-2 text-3xl font-bold text-red-400">{executive.readinessDistribution.missing}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Top Risks</h2>
        <ul className="space-y-2">
          {executive.topRisks.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm">
              <span>{r.title} · {r.projectName}</span>
              <RiskBadge severity={r.severity} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Deliveries</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          {executive.recentDeliveries.map((d) => (
            <li key={d.id} className="rounded-lg border border-zinc-800 px-4 py-2">
              {d.artifactType} · {d.projectName} ·{" "}
              <Link href={`/documents/quotes/${d.quoteId ?? ""}`} className="text-violet-400">
                查看
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RecommendationPanel recommendations={recommendations} />
    </div>
  );
}
