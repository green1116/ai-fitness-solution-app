"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Summary = {
  portfolio: { totalAccounts: number; enterprise: number; expansionReady: number };
  risk: { atRisk: number; rescue: number; totalChurnExposure: number };
  value: { totalExpectedValue: number; totalExpansionPotential: number };
  decisions: { pending: number; approved: number };
};

type Briefing = {
  narrative: string;
  keyRisks: Array<{
    sessionId: string;
    label: string;
    severity: string;
    exposure: number;
    riskScore: number;
  }>;
  keyOpportunities: Array<{
    sessionId: string;
    label: string;
    value: number;
    expansionPotential: number;
  }>;
  pendingDecisions: Array<{
    sessionId: string;
    label: string;
    priority: string;
    ownerName?: string;
    dueDate?: string;
    recommendedAction: string;
  }>;
};

type DecisionItem = {
  sessionId: string;
  projectName?: string;
  recommendedAction: string;
  priorityDecision: string;
  ownerName?: string;
  dueDate: string;
  rankScore: number;
  expectedValue: number;
};

type Metrics = {
  governanceQueueSize: number;
  decisionsRecorded: number;
  packetsGenerated: number;
  exportsCount: number;
  reviewedPackets: number;
};

type Pack = {
  id: string;
  title: string;
  generatedAt: string;
  status: string;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  sessionId?: string;
  briefingId?: string;
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-950 text-red-300",
  high: "bg-orange-950 text-orange-300",
  medium: "bg-amber-950 text-amber-300",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-300",
  issued: "bg-violet-950 text-violet-300",
  acted: "bg-emerald-950 text-emerald-300",
};

export function BriefingDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [selectedPack, setSelectedPack] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v94/executive-briefing");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSummary(d.summary ?? null);
      setBriefing(d.briefing ?? null);
      setDecisions(d.decisionSupport ?? []);
      setMetrics(d.keyMetrics ?? null);
      setPacks(d.packs ?? []);
      setActions(d.recentActions ?? []);
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

  async function runAction(action: string, extra?: Record<string, string>) {
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v94/executive-briefing/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      if (data.pack?.id) setSelectedPack(data.pack.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载高管简报面板…</p>;
  }

  const topDecision = decisions[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">高管简报 — 只读报告/治理层 + 简报缓存写入</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={acting}
            onClick={() => void runAction("generate_briefing_pack")}
            className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          >
            生成简报包
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="text-xs text-zinc-400 underline hover:text-white"
          >
            刷新
          </button>
        </div>
      </div>

      {briefing ? (
        <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/10 p-6">
          <h2 className="text-sm font-semibold text-cyan-300">高管摘要</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{briefing.narrative}</p>
        </section>
      ) : null}

      {summary && metrics ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "账户", value: summary.portfolio.totalAccounts },
            { label: "预期价值", value: formatCurrency(summary.value.totalExpectedValue) },
            { label: "风险敞口", value: formatCurrency(summary.risk.totalChurnExposure) },
            { label: "待决", value: summary.decisions.pending },
            { label: "材料包", value: metrics.packetsGenerated },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-lg font-bold text-cyan-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {briefing && briefing.keyRisks.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-orange-400">关键风险</h2>
            <ul className="space-y-2">
              {briefing.keyRisks.map((r) => (
                <li
                  key={r.sessionId}
                  className="rounded-xl border border-orange-900/40 bg-orange-950/10 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{r.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        风险分 {r.riskScore} · 敞口 {formatCurrency(r.exposure)}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLES[r.severity] ?? "bg-zinc-800"}`}
                    >
                      {r.severity}
                    </span>
                  </div>
                  <Link
                    href={`/pilot/board-governance?session=${r.sessionId}`}
                    className="mt-2 inline-block text-xs text-cyan-400 underline"
                  >
                    下钻治理
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {briefing && briefing.keyOpportunities.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-emerald-400">关键机会</h2>
            <ul className="space-y-2">
              {briefing.keyOpportunities.map((o) => (
                <li
                  key={o.sessionId}
                  className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4"
                >
                  <p className="font-medium text-white">{o.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    价值 {formatCurrency(o.value)} · 扩展潜力{" "}
                    {formatCurrency(o.expansionPotential)}
                  </p>
                  <Link
                    href={`/pilot/portfolio-intelligence?session=${o.sessionId}`}
                    className="mt-2 inline-block text-xs text-cyan-400 underline"
                  >
                    下钻组合
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {topDecision ? (
        <section className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6">
          <h2 className="text-sm font-semibold text-violet-300">优先决策</h2>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-white">
                {topDecision.projectName ?? topDecision.sessionId.slice(0, 8)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{topDecision.recommendedAction}</p>
              <p className="mt-2 text-xs text-zinc-500">
                负责人 {topDecision.ownerName ?? "未分配"} · 截止{" "}
                {new Date(topDecision.dueDate).toLocaleDateString("zh-CN")}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLES[topDecision.priorityDecision] ?? "bg-zinc-800"}`}
            >
              {topDecision.priorityDecision}
            </span>
          </div>
          {selectedPack ? (
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                void runAction("mark_decision_acted", {
                  briefingId: selectedPack,
                  sessionId: topDecision.sessionId,
                })
              }
              className="mt-4 rounded-lg bg-violet-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              标记已执行
            </button>
          ) : null}
        </section>
      ) : null}

      {decisions.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">决策卡片</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {decisions.slice(0, 6).map((d) => (
              <li key={d.sessionId} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">
                    {d.projectName ?? d.sessionId.slice(0, 8)}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLES[d.priorityDecision] ?? "bg-zinc-800"}`}
                  >
                    {d.priorityDecision}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">{d.recommendedAction}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {d.ownerName ?? "未分配"} · {new Date(d.dueDate).toLocaleDateString("zh-CN")}
                </p>
                {selectedPack ? (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() =>
                      void runAction("record_briefing_action", {
                        briefingId: selectedPack,
                        sessionId: d.sessionId,
                      })
                    }
                    className="mt-3 rounded border border-zinc-600 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    记录决策
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">简报包</h2>
        {packs.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无简报包 — 点击「生成简报包」</p>
        ) : (
          <ul className="space-y-3">
            {packs.map((pack) => (
              <li
                key={pack.id}
                className={`rounded-2xl border p-4 ${
                  selectedPack === pack.id
                    ? "border-cyan-700 bg-cyan-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{pack.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(pack.generatedAt).toLocaleString()} · {pack.id.slice(0, 12)}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[pack.status] ?? "bg-zinc-800"}`}
                  >
                    {pack.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPack(pack.id)}
                  className="mt-3 text-xs text-cyan-400 underline"
                >
                  选为当前简报
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {actions.slice(0, 12).map((a) => (
              <li key={a.id} className="flex flex-wrap gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(a.timestamp).toLocaleString()}</span>
                <span className="font-mono text-cyan-500">{a.action}</span>
                {a.sessionId ? (
                  <span className="text-zinc-600">{a.sessionId.slice(0, 8)}</span>
                ) : null}
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
