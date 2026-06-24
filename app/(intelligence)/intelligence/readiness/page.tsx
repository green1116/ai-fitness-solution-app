"use client";

import { useEffect, useState } from "react";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import { ReadinessBadge } from "@/components/intelligence/ReadinessBadge";
import type { TenderReadinessReport } from "@/lib/portal/v59/scoring/readiness.engine";

export default function ReadinessPage() {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<TenderReadinessReport | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/intelligence/readiness");
      const data = await res.json();
      if (data.ok) setReadiness(data.readiness);
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading />;
  if (!readiness) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Tender Readiness</h1>
      <div className="flex flex-wrap gap-3">
        <ReadinessBadge score={readiness.overallReadiness} label="Overall" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Plan", score: readiness.planReadiness },
          { label: "Budget", score: readiness.budgetReadiness },
          { label: "Evidence", score: readiness.evidenceReadiness },
          { label: "Tender Pack", score: readiness.tenderPackageReadiness },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-zinc-800 bg-black/40 p-6 text-center">
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className="mt-2 text-4xl font-bold text-violet-300">{item.score}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
