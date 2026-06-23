"use client";

import { useEffect, useState } from "react";
import { ProductionLoading } from "@/components/production/ProductionLoading";

type Finding = { id: string; area: string; title: string; level: string; recommendation: string };

export default function SecurityAuditPage() {
  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/production/security-audit");
      const data = await res.json();
      if (data.ok) {
        setFindings(data.audit.findings);
        setScore(data.audit.score);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Audit</h1>
      <p className="text-3xl font-bold text-amber-300">Score: {score}</p>
      <ul className="space-y-3">
        {findings.map((f) => (
          <li key={f.id} className="rounded-xl border border-zinc-800 p-4 text-sm">
            <div className="flex justify-between gap-2">
              <span className="font-medium">{f.title}</span>
              <span className="uppercase text-zinc-500">{f.level}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{f.area} · {f.recommendation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
