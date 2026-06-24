"use client";

import { useEffect, useState } from "react";
import { HealthBadge } from "@/components/intelligence/HealthBadge";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import type { DeliveryHealthReport } from "@/lib/portal/v59/scoring/health.engine";

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<DeliveryHealthReport | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/intelligence/health");
      const data = await res.json();
      if (data.ok) setHealth(data.health);
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading />;
  if (!health) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Delivery Health</h1>
      <HealthBadge level={health.level} score={health.score} />
      <section className="grid gap-3 sm:grid-cols-2">
        {Object.entries(health.checks).map(([key, ok]) => (
          <div key={key} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm">
            <span className={ok ? "text-emerald-400" : "text-red-400"}>{ok ? "✓" : "✗"}</span>{" "}
            {key}
          </div>
        ))}
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Issues</h2>
        <ul className="space-y-2 text-sm">
          {health.issues.map((i) => (
            <li key={i.code} className="rounded-lg border border-zinc-800 px-4 py-2">
              {i.label} · <HealthBadge level={i.severity} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
