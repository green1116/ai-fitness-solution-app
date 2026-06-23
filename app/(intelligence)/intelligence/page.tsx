"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExecutiveWidgets } from "@/components/intelligence/ExecutiveWidgets";
import { HealthBadge } from "@/components/intelligence/HealthBadge";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import { ReadinessBadge } from "@/components/intelligence/ReadinessBadge";
import { RecommendationPanel } from "@/components/intelligence/RecommendationPanel";
import type { Recommendation } from "@/lib/portal/v59/recommendations/recommendation.engine";
import type { HealthLevel } from "@/lib/portal/v59/scoring/health.engine";

type OverviewData = {
  executive: {
    stats: {
      projects: number;
      quotes: number;
      tenderPacks: number;
      downloads: number;
      deliveries: number;
    };
    commercial: {
      commercialReadiness: number;
      deliveryReadiness: number;
      tenderReadiness: number;
      executionReadiness: number;
      overallBusinessScore: number;
    };
    deliveryHealth: { level: HealthLevel; score: number };
    readiness: { overallReadiness: number };
  };
  recommendations: Recommendation[];
};

export default function IntelligenceOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    void (async () => {
      const [execRes, recRes] = await Promise.all([
        fetch("/api/intelligence/executive"),
        fetch("/api/intelligence/recommendations"),
      ]);
      const exec = await execRes.json();
      const rec = await recRes.json();
      if (exec.ok && rec.ok) {
        setData({ executive: exec.executive, recommendations: rec.recommendations });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading />;
  if (!data) return <p className="text-zinc-500">无法加载智能概览</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Delivery Intelligence</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Workspace → Delivery → Intelligence → Executive Decision
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <HealthBadge level={data.executive.deliveryHealth.level} score={data.executive.deliveryHealth.score} />
          <ReadinessBadge score={data.executive.readiness.overallReadiness} label="Overall" />
        </div>
      </section>

      <ExecutiveWidgets stats={data.executive.stats} commercial={data.executive.commercial} />

      <RecommendationPanel recommendations={data.recommendations} />

      <section className="flex flex-wrap gap-3">
        <Link href="/intelligence/executive" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white">
          Executive Dashboard
        </Link>
        <Link href="/intelligence/projects" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Project Intelligence
        </Link>
        <Link href="/documents" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Document Center
        </Link>
      </section>
    </div>
  );
}
