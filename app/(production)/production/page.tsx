"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HealthStatusBadge } from "@/components/production/HealthStatusBadge";
import { ProductionLoading } from "@/components/production/ProductionLoading";

type ReadinessPayload = {
  securityScore: number;
  integrityScore: number;
  observabilityScore: number;
  performanceScore: number;
  overallReadinessScore: number;
  productionReady: boolean;
};

export default function ProductionOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<ReadinessPayload | null>(null);
  const [healthOverall, setHealthOverall] = useState<string>("degraded");

  useEffect(() => {
    void (async () => {
      const [r, h] = await Promise.all([
        fetch("/api/production/readiness"),
        fetch("/api/production/health"),
      ]);
      const rd = await r.json();
      const hd = await h.json();
      if (rd.ok) setReadiness(rd.readiness);
      if (hd.ok) setHealthOverall(hd.health.overall);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading />;
  if (!readiness) return <p className="text-zinc-500">无法加载</p>;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Production Readiness</h1>
        <p className="mt-1 text-sm text-zinc-400">V60 Platform Hardening & Observability</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <HealthStatusBadge
            status={readiness.productionReady ? "healthy" : "degraded"}
            score={readiness.overallReadinessScore}
          />
          <HealthStatusBadge status={healthOverall as "healthy" | "degraded" | "down"} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Security", value: readiness.securityScore },
          { label: "Integrity", value: readiness.integrityScore },
          { label: "Observability", value: readiness.observabilityScore },
          { label: "Performance", value: readiness.performanceScore },
          { label: "Overall", value: readiness.overallReadinessScore },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-800 bg-black/40 p-5 text-center">
            <p className="text-xs uppercase text-zinc-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/production/health" className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black">
          Health Dashboard
        </Link>
        <Link href="/production/readiness" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Launch Report
        </Link>
        <Link href="/production/technical-debt" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Technical Debt
        </Link>
      </section>
    </div>
  );
}
