"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Dimension = {
  dimension: string;
  label: string;
  score: number;
  gateStatus: string;
};

type SignoffReport = {
  layerCount: number;
  overallPilotScore: number;
  overallReleaseStatus: string;
  certificationStatus: string;
  collectedLayers: Array<{ version: string; capability: string; verifyScript: string }>;
  readinessSummary: {
    overallReadiness: string;
    gatesPassed: number;
    gatesTotal: number;
    dimensions: Dimension[];
  };
};

type FreezeManifest = {
  baselineVersion: string;
  frozen: boolean;
  releaseLock: boolean;
  versionLock: Record<string, string>;
  dependencyLock: string[];
};

type ReleaseManifest = {
  baselineVersion: string;
  capabilityInventory: Array<{ version: string; capability: string; modulePath: string }>;
  moduleIndex: string[];
  apiIndex: string[];
  uiIndex: string[];
  verifyIndex: string[];
  artifactIndex: Array<{ label: string; href: string; layer: string }>;
};

type RollbackIndex = {
  snapshotIndex: Array<{ version: string; capability: string; modulePath: string }>;
  restoreEntryPoints: Array<{ version: string; entryPoint: string }>;
};

type ChecklistItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
};

type Governance = {
  releaseChecklist: ChecklistItem[];
  productionChecklist: ChecklistItem[];
  certificationSummary: string;
  finalApproval: { approved: boolean; approvedAt?: string };
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

type Dashboard = {
  baselineVersion: string;
  releaseStatus: string;
  signoffReport: SignoffReport;
  freezeManifest: FreezeManifest;
  releaseManifest: ReleaseManifest;
  rollbackIndex: RollbackIndex;
  governance: Governance;
  recentActions: ActionEntry[];
};

const STATUS_STYLES: Record<string, string> = {
  pass: "bg-emerald-950 text-emerald-300",
  warning: "bg-amber-950 text-amber-300",
  blocked: "bg-red-950 text-red-300",
  waived: "bg-violet-950 text-violet-300",
  draft: "bg-zinc-800 text-zinc-300",
  ready_for_signoff: "bg-amber-950 text-amber-300",
  signed_off: "bg-cyan-950 text-cyan-300",
  frozen: "bg-violet-950 text-violet-300",
  released: "bg-emerald-950 text-emerald-300",
};

const RELEASE_LABELS: Record<string, string> = {
  draft: "草稿",
  ready_for_signoff: "待签收",
  signed_off: "已签收",
  frozen: "已冻结",
  released: "已发布",
};

export function PilotSignoffDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v100/pilot-signoff");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      setDashboard(data.dashboard ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: string) {
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v100/pilot-signoff/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载 Pilot 签收面板…</p>;
  }
  if (!dashboard) {
    return <p className="text-sm text-red-400">{error || "无数据"}</p>;
  }

  const { signoffReport, freezeManifest, releaseManifest, rollbackIndex, governance } =
    dashboard;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          Pilot 最终签收 — 只读 V80–V99 + 签收状态缓存写入
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-cyan-300">最终就绪报告</h2>
            <p className="mt-2 text-lg font-bold text-white">
              {dashboard.baselineVersion}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              收集 {signoffReport.layerCount} 层 · 综合评分 {signoffReport.overallPilotScore} ·
              门控 {signoffReport.readinessSummary.gatesPassed}/
              {signoffReport.readinessSummary.gatesTotal}
            </p>
            <p className="text-xs text-zinc-500">
              认证：{signoffReport.certificationStatus}
            </p>
          </div>
          <span
            className={`rounded px-3 py-1 text-sm ${STATUS_STYLES[dashboard.releaseStatus] ?? "bg-zinc-800"}`}
          >
            {RELEASE_LABELS[dashboard.releaseStatus] ?? dashboard.releaseStatus}
          </span>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={acting}
          onClick={() => void runAction("collect_readiness")}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
        >
          收集就绪
        </button>
        <button
          type="button"
          disabled={acting}
          onClick={() => void runAction("final_signoff")}
          className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
        >
          最终签收
        </button>
        <button
          type="button"
          disabled={acting}
          onClick={() => void runAction("freeze_baseline")}
          className="rounded-lg border border-violet-800 px-3 py-1.5 text-xs text-violet-300 disabled:opacity-40"
        >
          冻结基线
        </button>
        <button
          type="button"
          disabled={acting}
          onClick={() => void runAction("release_baseline")}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
        >
          发布基线
        </button>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">发布检查单</h2>
          <ul className="space-y-2">
            {governance.releaseChecklist.map((c) => (
              <li key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white">{c.label}</p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[c.status] ?? "bg-zinc-800"}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">生产检查单</h2>
          <ul className="space-y-2">
            {governance.productionChecklist.map((c) => (
              <li key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white">{c.label}</p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[c.status] ?? "bg-zinc-800"}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-semibold text-white">能力清单 (V80–V99)</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {releaseManifest.capabilityInventory.map((c) => (
            <div key={c.version} className="rounded-lg border border-zinc-800 p-3">
              <p className="text-xs font-mono text-cyan-400">{c.version}</p>
              <p className="text-sm text-white">{c.capability}</p>
              <p className="text-xs text-zinc-600">{c.modulePath}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <h2 className="text-sm font-semibold text-violet-300">冻结清单</h2>
          <p className="mt-2 text-xs text-zinc-500">
            基线 {freezeManifest.baselineVersion} · 冻结 {freezeManifest.frozen ? "是" : "否"} ·
            发布锁 {freezeManifest.releaseLock ? "是" : "否"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            版本锁 {Object.keys(freezeManifest.versionLock).length} · 依赖锁{" "}
            {freezeManifest.dependencyLock.length}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-900/50 bg-sky-950/10 p-6">
          <h2 className="text-sm font-semibold text-sky-300">发布索引</h2>
          <p className="mt-2 text-xs text-zinc-500">
            模块 {releaseManifest.moduleIndex.length} · API {releaseManifest.apiIndex.length} ·
            UI {releaseManifest.uiIndex.length} · 验证 {releaseManifest.verifyIndex.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            制品 {releaseManifest.artifactIndex.length} 项
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-semibold text-white">回滚索引</h2>
        <p className="mt-2 text-xs text-zinc-500">
          快照 {rollbackIndex.snapshotIndex.length} · 恢复入口{" "}
          {rollbackIndex.restoreEntryPoints.length}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {rollbackIndex.restoreEntryPoints.slice(0, 6).map((r) => (
            <p key={r.version} className="text-xs text-zinc-600">
              <span className="font-mono text-cyan-500">{r.version}</span> → {r.entryPoint}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 p-6">
        <h2 className="text-sm font-semibold text-emerald-300">认证摘要 & 最终批准</h2>
        <p className="mt-2 text-sm text-zinc-300">{governance.certificationSummary}</p>
        <p className="mt-1 text-xs text-zinc-500">
          最终批准：{governance.finalApproval.approved ? "已批准" : "待批准"}
          {governance.finalApproval.approvedAt
            ? ` · ${new Date(governance.finalApproval.approvedAt).toLocaleString()}`
            : ""}
        </p>
        <Link
          href="/pilot/production-readiness"
          className="mt-3 inline-block text-xs text-cyan-400 underline"
        >
          下钻生产就绪
        </Link>
      </section>

      {dashboard.recentActions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">签收历史</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {dashboard.recentActions.slice(0, 12).map((a) => (
              <li key={a.id} className="flex flex-wrap gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(a.timestamp).toLocaleString()}</span>
                <span className="font-mono text-cyan-500">{a.action}</span>
                <span>{a.note}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
