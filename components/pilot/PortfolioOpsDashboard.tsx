"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  opsQueue: string;
  queuePosition: number;
  expectedValue: number;
  expansionPotential: number;
  riskScore: number;
  rankScore: number;
  ownerName?: string;
  opsStatus: string;
  outcome: string;
  nextAction: string;
};

type Summary = {
  total: number;
  enterprisePriority: number;
  expansionReady: number;
  atRisk: number;
  rescue: number;
  followUpNeeded: number;
  completed: number;
  deferred: number;
  lost: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

type StrategyView = {
  segment: string;
  segments: string[];
  health: { segmentHealthScore: number; renewalLikelihood: number };
  value: { expectedValue: number; expansionPotential: number };
  risk: { riskScore: number; churnExposure: number };
  nextStrategicAction: string;
};

type TabKey =
  | "rescue"
  | "at_risk"
  | "enterprise_priority"
  | "expansion_ready"
  | "follow_up_needed";

const QUEUE_LABELS: Record<TabKey, string> = {
  rescue: "流失救援",
  at_risk: "高风险",
  enterprise_priority: "企业优先",
  expansion_ready: "扩展就绪",
  follow_up_needed: "需跟进",
};

const STATUS_BADGES: Record<string, string> = {
  queued: "bg-zinc-800 text-zinc-300",
  assigned: "bg-blue-950 text-blue-300",
  in_review: "bg-purple-950 text-purple-300",
  completed: "bg-emerald-950 text-emerald-300",
  deferred: "bg-amber-950 text-amber-300",
  lost: "bg-red-950 text-red-300",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function PortfolioOpsDashboard() {
  const [queues, setQueues] = useState<{
    enterprisePriority: QueueItem[];
    expansionReady: QueueItem[];
    atRisk: QueueItem[];
    rescue: QueueItem[];
    followUpNeeded: QueueItem[];
  }>({
    enterprisePriority: [],
    expansionReady: [],
    atRisk: [],
    rescue: [],
    followUpNeeded: [],
  });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [strategy, setStrategy] = useState<StrategyView | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("rescue");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v91/portfolio-ops");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setQueues(
        d.queues ?? {
          enterprisePriority: [],
          expansionReady: [],
          atRisk: [],
          rescue: [],
          followUpNeeded: [],
        },
      );
      setSummary(d.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/pilot/v91/portfolio-ops/${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setHistory(data.detail?.actionHistory ?? []);
      setStrategy(data.detail?.accountStrategy ?? null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(sessionId: string, action: string, extra?: Record<string, string>) {
    setActing(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v91/portfolio-ops/${encodeURIComponent(sessionId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...extra }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      await load();
      if (selected === sessionId) await loadDetail(sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  async function selectSession(sessionId: string) {
    setSelected(sessionId);
    await loadDetail(sessionId);
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载组合运营面板…</p>;
  }

  const activeQueue =
    activeTab === "enterprise_priority"
      ? queues.enterprisePriority
      : activeTab === "expansion_ready"
        ? queues.expansionReady
        : activeTab === "at_risk"
          ? queues.atRisk
          : activeTab === "rescue"
            ? queues.rescue
            : queues.followUpNeeded;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">组合运营 — 只读组合智能 + 最小写入战略状态</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-4 lg:grid-cols-9">
          {[
            { label: "队列", value: summary.total },
            { label: "企业优先", value: summary.enterprisePriority },
            { label: "扩展就绪", value: summary.expansionReady },
            { label: "高风险", value: summary.atRisk },
            { label: "救援", value: summary.rescue },
            { label: "需跟进", value: summary.followUpNeeded },
            { label: "已完成", value: summary.completed },
            { label: "已延期", value: summary.deferred },
            { label: "已流失", value: summary.lost },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-rose-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            "rescue",
            "at_risk",
            "enterprise_priority",
            "expansion_ready",
            "follow_up_needed",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              activeTab === tab
                ? "bg-rose-700 text-white"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {QUEUE_LABELS[tab]} (
            {tab === "rescue"
              ? queues.rescue.length
              : tab === "at_risk"
                ? queues.atRisk.length
                : tab === "enterprise_priority"
                  ? queues.enterprisePriority.length
                  : tab === "expansion_ready"
                    ? queues.expansionReady.length
                    : queues.followUpNeeded.length}
            )
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {activeQueue.length === 0 ? (
          <p className="text-sm text-zinc-500">该队列暂无项目</p>
        ) : (
          <ul className="space-y-3">
            {activeQueue.map((item) => (
              <li
                key={item.sessionId}
                className={`rounded-2xl border p-4 ${
                  selected === item.sessionId
                    ? "border-rose-700 bg-rose-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.queuePosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatCurrency(item.expectedValue)} · 扩展{" "}
                      {formatCurrency(item.expansionPotential)} · 排名 {item.rankScore}
                    </p>
                    <p className="mt-1 text-xs text-rose-300">战略行动: {item.nextAction}</p>
                    {item.ownerName ? (
                      <p className="mt-1 text-xs text-zinc-400">负责人: {item.ownerName}</p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${STATUS_BADGES[item.opsStatus] ?? "bg-zinc-800"}`}
                  >
                    {item.opsStatus}
                  </span>
                </div>

                {item.outcome === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.ownerName ? (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void runAction(item.sessionId, "assign_portfolio_owner")}
                        className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                      >
                        认领
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "schedule_strategic_review")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      战略评审
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "record_action")}
                      className="rounded-lg border border-purple-700 px-3 py-1.5 text-xs text-purple-300 disabled:opacity-40"
                    >
                      记录行动
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_completed")}
                      className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                    >
                      已完成
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_deferred")}
                      className="rounded-lg border border-amber-800 px-3 py-1.5 text-xs text-amber-300 disabled:opacity-40"
                    >
                      延期
                    </button>
                    <button
                      type="button"
                      onClick={() => void selectSession(item.sessionId)}
                      className="text-xs text-sky-400 underline"
                    >
                      钻取
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void selectSession(item.sessionId)}
                    className="mt-3 text-xs text-sky-400 underline"
                  >
                    钻取
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && strategy ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">账户战略视图</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-zinc-500">细分</p>
              <p className="text-rose-300">{strategy.segments.join(", ")}</p>
            </div>
            <div>
              <p className="text-zinc-500">健康</p>
              <p className="text-white">
                分 {strategy.health.segmentHealthScore} · 续约{" "}
                {strategy.health.renewalLikelihood}%
              </p>
            </div>
            <div>
              <p className="text-zinc-500">价值</p>
              <p className="text-emerald-400">
                {formatCurrency(strategy.value.expectedValue)} · 扩展{" "}
                {formatCurrency(strategy.value.expansionPotential)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">风险</p>
              <p className="text-orange-400">
                评分 {strategy.risk.riskScore} · 敞口{" "}
                {formatCurrency(strategy.risk.churnExposure)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-zinc-500">下一步战略行动</p>
              <p className="text-rose-300">{strategy.nextStrategicAction}</p>
            </div>
          </div>
        </section>
      ) : null}

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">战略行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(h.timestamp).toLocaleString()}</span>
                <span className="font-mono text-rose-500">{h.action}</span>
                <span>{h.note}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
