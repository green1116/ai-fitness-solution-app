"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GoNoGo = {
  decision: "GO" | "NO-GO";
  overallLaunchScore: number;
  checklistReady: boolean;
  blockers: string[];
  reasons: string[];
};

type Readiness = {
  securityScore: number;
  integrityScore: number;
  performanceScore: number;
  observabilityScore: number;
  operationsScore: number;
  commercialReadinessScore: number;
  overallLaunchScore: number;
};

export default function LaunchCenterPage() {
  const [loading, setLoading] = useState(true);
  const [goNoGo, setGoNoGo] = useState<GoNoGo | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [checklist, setChecklist] = useState<{ passed: number; total: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const [g, r, c] = await Promise.all([
        fetch("/api/launch/go-no-go"),
        fetch("/api/launch/readiness"),
        fetch("/api/launch/checklist"),
      ]);
      const gd = await g.json();
      const rd = await r.json();
      const cd = await c.json();
      if (gd.ok) setGoNoGo(gd.goNoGo);
      if (rd.ok) setReadiness(rd.readiness);
      if (cd.ok) setChecklist(cd.checklist);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="animate-pulse text-zinc-400">评估发布就绪状态…</p>;
  }

  const isGo = goNoGo?.decision === "GO";

  return (
    <div className="space-y-8">
      <section
        className={`rounded-2xl border p-8 text-center ${
          isGo ? "border-emerald-800 bg-emerald-950/30" : "border-amber-800 bg-amber-950/20"
        }`}
      >
        <p className="text-xs uppercase tracking-widest text-zinc-400">Go / No-Go Decision</p>
        <p className={`mt-2 text-5xl font-black ${isGo ? "text-emerald-400" : "text-amber-400"}`}>
          {goNoGo?.decision ?? "—"}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Overall Launch Score: {goNoGo?.overallLaunchScore ?? readiness?.overallLaunchScore ?? "—"}
        </p>
      </section>

      {goNoGo?.blockers && goNoGo.blockers.length > 0 ? (
        <section className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
          <h2 className="font-semibold text-red-300">Blockers</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-200/80">
            {goNoGo.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {readiness ? (
        <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Security", value: readiness.securityScore },
            { label: "Integrity", value: readiness.integrityScore },
            { label: "Performance", value: readiness.performanceScore },
            { label: "Observability", value: readiness.observabilityScore },
            { label: "Operations", value: readiness.operationsScore },
            { label: "Commercial", value: readiness.commercialReadinessScore },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-center">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {checklist ? (
        <p className="text-sm text-zinc-400">
          Checklist: {checklist.passed}/{checklist.total} passed
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/launch/checklist" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
          Launch Checklist
        </Link>
        <Link href="/launch/operations" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Operations
        </Link>
        <Link href="/production" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Health Center
        </Link>
      </div>
    </div>
  );
}
