"use client";

import { useEffect, useState } from "react";
import { ProductionLoading } from "@/components/production/ProductionLoading";

export default function LaunchReadinessPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    productionReady: boolean;
    blockers: string[];
    securityScore: number;
    integrityScore: number;
    observabilityScore: number;
    performanceScore: number;
    overallReadinessScore: number;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/production/readiness");
      const json = await res.json();
      if (json.ok) setData(json.readiness);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Launch Readiness Report</h1>
      <p className={`text-lg font-semibold ${data.productionReady ? "text-emerald-400" : "text-amber-400"}`}>
        {data.productionReady ? "Production Ready" : "Additional Hardening Required"}
      </p>
      {data.blockers.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-red-300">
          {data.blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">无阻塞项</p>
      )}
      <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
        <p className="text-4xl font-bold text-amber-300">{data.overallReadinessScore}</p>
        <p className="text-sm text-zinc-500">Overall Readiness Score</p>
      </div>
    </div>
  );
}
