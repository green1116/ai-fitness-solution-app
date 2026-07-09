"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  planningQueue: string;
  queuePosition: number;
  baseRenewalValue: number;
  expansionPotential: number;
  predictedValue: number;
  daysUntilRenewal: number;
  riskScore: number;
  renewalLikelihood: number;
  ownerName?: string;
  growthStatus: string;
  outcome: string;
  nextAction: string;
  openRisks: string[];
};

type Forecast = {
  predictedRenewalRevenue: number;
  expansionOpportunity: number;
  churnExposure: number;
  netGrowthOutlook: number;
};

type Summary = {
  total: number;
  highValueRetain: number;
  expansionTarget: number;
  churnRescue: number;
  forecastWatch: number;
  retained: number;
  expanded: number;
  lost: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

type TabKey = "churn_rescue" | "high_value_retain" | "expansion_target" | "forecast_watch";

const QUEUE_LABELS: Record<TabKey, string> = {
  churn_rescue: "流失救援",
  high_value_retain: "高价值留存",
  expansion_target: "扩展目标",
  forecast_watch: "预测监控",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function GrowthPlanningDashboard() {
  const [queues, setQueues] = useState<{
    highValueRetain: QueueItem[];
    expansionTarget: QueueItem[];
    churnRescue: QueueItem[];
    forecastWatch: QueueItem[];
  }>({ highValueRetain: [], expansionTarget: [], churnRescue: [], forecastWatch: [] });
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("churn_rescue");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v88/growth-planning");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setQueues(
        d.queues ?? {
          highValueRetain: [],
          expansionTarget: [],
          churnRescue: [],
          forecastWatch: [],
        },
      );
      setForecast(d.forecast ?? null);
      setSummary(d.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/pilot/v88/growth-planning/${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setHistory(data.detail?.actionHistory ?? []);
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
        `/api/pilot/v88/growth-planning/${encodeURIComponent(sessionId)}/actions`,
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
    return <p className="text-sm text-zinc-500">加载增长规划面板…</p>;
  }

  const activeQueue =
    activeTab === "high_value_retain"
      ? queues.highValueRetain
      : activeTab === "expansion_target"
        ? queues.expansionTarget
        : activeTab === "churn_rescue"
          ? queues.churnRescue
          : queues.forecastWatch;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">增长规划 — 只读收入/续约预测 + 最小写入增长状态</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {forecast ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "预测续约收入",
              value: forecast.predictedRenewalRevenue,
              color: "text-violet-300",
            },
            {
              label: "扩展机会",
              value: forecast.expansionOpportunity,
              color: "text-emerald-400",
            },
            { label: "流失敞口", value: forecast.churnExposure, color: "text-red-400" },
            {
              label: "净增长展望",
              value: forecast.netGrowthOutlook,
              color: "text-sky-400",
            },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className={`text-lg font-bold ${c.color}`}>{formatCurrency(c.value)}</p>
            </div>
          ))}
        </section>
      ) : null}

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: "规划队列", value: summary.total },
            { label: "高价值留存", value: summary.highValueRetain },
            { label: "扩展目标", value: summary.expansionTarget },
            { label: "流失救援", value: summary.churnRescue },
            { label: "预测监控", value: summary.forecastWatch },
            { label: "已留存", value: summary.retained },
            { label: "已扩展", value: summary.expanded },
            { label: "已流失", value: summary.lost },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-violet-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          ["churn_rescue", "high_value_retain", "expansion_target", "forecast_watch"] as const
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              activeTab === tab
                ? "bg-violet-700 text-white"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {QUEUE_LABELS[tab]} (
            {tab === "churn_rescue"
              ? queues.churnRescue.length
              : tab === "high_value_retain"
                ? queues.highValueRetain.length
                : tab === "expansion_target"
                  ? queues.expansionTarget.length
                  : queues.forecastWatch.length}
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
                    ? "border-violet-700 bg-violet-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.queuePosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      续约 {formatCurrency(item.baseRenewalValue)} · 扩展{" "}
                      {formatCurrency(item.expansionPotential)} · 预测{" "}
                      {formatCurrency(item.predictedValue)}
                    </p>
                    <p className="mt-1 text-xs text-violet-300">下一步: {item.nextAction}</p>
                    {item.ownerName ? (
                      <p className="mt-1 text-xs text-zinc-400">负责人: {item.ownerName}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {item.growthStatus} / {item.outcome}
                  </span>
                </div>

                {item.outcome === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.ownerName ? (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void runAction(item.sessionId, "assign_growth_owner")}
                        className="rounded-lg bg-violet-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                      >
                        认领
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "schedule_expansion_follow_up")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      扩展跟进
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_retained")}
                      className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                    >
                      已留存
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_expanded")}
                      className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
                    >
                      已扩展
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_lost")}
                      className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
                    >
                      已流失
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

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">增长行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(h.timestamp).toLocaleString()}</span>
                <span className="font-mono text-violet-500">{h.action}</span>
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
