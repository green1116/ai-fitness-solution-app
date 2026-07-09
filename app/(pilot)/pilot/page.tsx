"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PilotFlowStatus } from "@/components/pilot/PilotFlowStatus";
import { PilotWorkflowNav } from "@/components/pilot/PilotWorkflowNav";

type ScaleDecision = {
  decision: "Pilot Stable" | "Pilot Needs Fixes" | "Ready to Scale";
  successScore: number;
  healthScore: number;
  blockerCount: number;
  reasons: string[];
};

type Health = {
  pilotUsers: number;
  activeOrganizations: number;
  activeProjects: number;
  overallHealth: number;
};

export default function PilotOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState<ScaleDecision | null>(null);
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    void (async () => {
      const [s, h] = await Promise.all([
        fetch("/api/pilot/scale-decision"),
        fetch("/api/pilot/health"),
      ]);
      const sd = await s.json();
      const hd = await h.json();
      if (sd.ok) setScale(sd.scaleDecision);
      if (hd.ok) setHealth(hd.dashboard);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="animate-pulse text-zinc-400">加载试点状态…</p>;

  const decision = scale?.decision ?? "Pilot Stable";
  const color =
    decision === "Ready to Scale"
      ? "text-emerald-400 border-emerald-800"
      : decision === "Pilot Needs Fixes"
        ? "text-amber-400 border-amber-800"
        : "text-sky-400 border-sky-800";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-sky-800/50 bg-gradient-to-br from-sky-950/40 to-black p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
          Pilot 主流程
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">导入 → 计算 → 下载 → 交付</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          从上传招标文件开始，完成方案与预算计算，生成标书并进入 Document Center 归档下载。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/pilot/intake"
            className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
          >
            上传标书 / 导入招标文件
          </Link>
          <Link
            href="/documents"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
          >
            进入 Document Center
          </Link>
        </div>
      </section>

      <PilotWorkflowNav compact />

      <PilotFlowStatus status="not_uploaded" />

      <section className={`rounded-2xl border p-8 text-center ${color} bg-black/40`}>
        <p className="text-xs uppercase tracking-widest text-zinc-400">Scale Decision</p>
        <p className={`mt-2 text-4xl font-black ${color.split(" ")[0]}`}>{decision}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Success {scale?.successScore ?? "—"} · Health {scale?.healthScore ?? health?.overallHealth ?? "—"}
        </p>
      </section>

      {health ? (
        <section className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Pilot Users", value: health.pilotUsers },
            { label: "Organizations", value: health.activeOrganizations },
            { label: "Projects", value: health.activeProjects },
            { label: "Health Score", value: health.overallHealth },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-center">
              <p className="text-xs text-zinc-500">{m.label}</p>
              <p className="mt-1 text-2xl font-bold">{m.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/pilot/program" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Pilot Program
        </Link>
        <Link href="/pilot/funnel" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Conversion Funnel
        </Link>
        <Link href="/pilot/support" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold">
          Support Guide
        </Link>
      </div>
    </div>
  );
}
