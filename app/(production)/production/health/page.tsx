"use client";

import { useEffect, useState } from "react";
import { HealthStatusBadge } from "@/components/production/HealthStatusBadge";
import { ProductionLoading } from "@/components/production/ProductionLoading";

type Subsystem = {
  key: string;
  label: string;
  status: "healthy" | "degraded" | "down";
  score: number;
  detail: string;
};

export default function HealthDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [subsystems, setSubsystems] = useState<Subsystem[]>([]);
  const [overall, setOverall] = useState<"healthy" | "degraded" | "down">("degraded");
  const [score, setScore] = useState(0);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/production/health");
      const data = await res.json();
      if (data.ok) {
        setSubsystems(data.health.subsystems);
        setOverall(data.health.overall);
        setScore(data.health.score);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading message="加载 Health Center…" />;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Health Dashboard</h1>
        <HealthStatusBadge status={overall} score={score} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {subsystems.map((s) => (
          <div key={s.key} className="rounded-xl border border-zinc-800 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.label}</span>
              <HealthStatusBadge status={s.status} score={s.score} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{s.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
