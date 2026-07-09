"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  expansionQueue: string;
  queuePosition: number;
  expansionOpportunity: number;
  baseRenewalValue: number;
  predictedValue: number;
  daysUntilRenewal: number;
  riskScore: number;
  ownerName?: string;
  opsStatus: string;
  outcome: string;
  proposalCount: number;
  nextAction: string;
  openRisks: string[];
};

type Summary = {
  total: number;
  expansionTarget: number;
  highValueRetain: number;
  forecastWatch: number;
  churnRescue: number;
  expanded: number;
  retained: number;
  lost: number;
  proposing: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

type AccountGrowth = {
  customer: { projectName?: string };
  currentState: { expansionStatus: string; expansionOutcome: string; planningQueue: string };
  expansionOpportunity: number;
  risk: { riskScore: number; openRisks: string[] };
  nextAction: string;
};

type TabKey = "expansion_target" | "high_value_retain" | "forecast_watch" | "churn_rescue";

const QUEUE_LABELS: Record<TabKey, string> = {
  expansion_target: "扩展目标",
  high_value_retain: "高价值留存",
  forecast_watch: "预测监控",
  churn_rescue: "流失救援",
};

const STATUS_BADGES: Record<string, string> = {
  queued: "bg-zinc-800 text-zinc-300",
  qualified: "bg-blue-950 text-blue-300",
  proposing: "bg-purple-950 text-purple-300",
  expanded: "bg-sky-950 text-sky-300",
  retained: "bg-emerald-950 text-emerald-300",
  lost: "bg-red-950 text-red-300",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function ExpansionOpsDashboard() {
  const [queues, setQueues] = useState<{
    expansionTarget: QueueItem[];
    highValueRetain: QueueItem[];
    forecastWatch: QueueItem[];
    churnRescue: QueueItem[];
  }>({ expansionTarget: [], highValueRetain: [], forecastWatch: [], churnRescue: [] });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [accountGrowth, setAccountGrowth] = useState<AccountGrowth | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("expansion_target");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v89/expansion-ops");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setQueues(
        d.queues ?? {
          expansionTarget: [],
          highValueRetain: [],
          forecastWatch: [],
          churnRescue: [],
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
    const res = await fetch(`/api/pilot/v89/expansion-ops/${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setHistory(data.detail?.actionHistory ?? []);
      setAccountGrowth(data.detail?.accountGrowth ?? null);
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
        `/api/pilot/v89/expansion-ops/${encodeURIComponent(sessionId)}/actions`,
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
    return <p className="text-sm text-zinc-500">加载扩展运营面板…</p>;
  }

  const activeQueue =
    activeTab === "expansion_target"
      ? queues.expansionTarget
      : activeTab === "high_value_retain"
        ? queues.highValueRetain
        : activeTab === "forecast_watch"
          ? queues.forecastWatch
          : queues.churnRescue;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">扩展执行 — 只读增长/收入预测 + 最小写入扩展状态</p>
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
            { label: "扩展目标", value: summary.expansionTarget },
            { label: "高价值留存", value: summary.highValueRetain },
            { label: "预测监控", value: summary.forecastWatch },
            { label: "流失救援", value: summary.churnRescue },
            { label: "提案中", value: summary.proposing },
            { label: "已扩展", value: summary.expanded },
            { label: "已留存", value: summary.retained },
            { label: "已流失", value: summary.lost },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-teal-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          ["expansion_target", "high_value_retain", "forecast_watch", "churn_rescue"] as const
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              activeTab === tab
                ? "bg-teal-700 text-white"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {QUEUE_LABELS[tab]} (
            {tab === "expansion_target"
              ? queues.expansionTarget.length
              : tab === "high_value_retain"
                ? queues.highValueRetain.length
                : tab === "forecast_watch"
                  ? queues.forecastWatch.length
                  : queues.churnRescue.length}
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
                    ? "border-teal-700 bg-teal-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.queuePosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      扩展 {formatCurrency(item.expansionOpportunity)} · 续约{" "}
                      {formatCurrency(item.baseRenewalValue)} · 提案 {item.proposalCount} 次
                    </p>
                    <p className="mt-1 text-xs text-teal-300">下一步: {item.nextAction}</p>
                    {item.ownerName ? (
                      <p className="mt-1 text-xs text-zinc-400">负责人: {item.ownerName}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${STATUS_BADGES[item.opsStatus] ?? "bg-zinc-800"}`}
                    >
                      {item.opsStatus}
                    </span>
                    <span className="text-xs text-zinc-500">{item.outcome}</span>
                  </div>
                </div>

                {item.outcome === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.ownerName ? (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void runAction(item.sessionId, "assign_owner")}
                        className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                      >
                        认领
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "record_proposal")}
                      className="rounded-lg border border-purple-700 px-3 py-1.5 text-xs text-purple-300 disabled:opacity-40"
                    >
                      记录提案
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "schedule_expansion_follow_up")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      计划跟进
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
                      onClick={() => void runAction(item.sessionId, "mark_retained")}
                      className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                    >
                      已留存
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

      {selected && accountGrowth ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">账户增长视图</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-zinc-500">客户</p>
              <p className="text-white">
                {accountGrowth.customer.projectName ?? selected.slice(0, 8)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">当前状态</p>
              <p className="text-teal-300">
                {accountGrowth.currentState.expansionStatus} /{" "}
                {accountGrowth.currentState.planningQueue}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">扩展机会</p>
              <p className="text-emerald-400">
                {formatCurrency(accountGrowth.expansionOpportunity)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">风险</p>
              <p className="text-orange-400">评分 {accountGrowth.risk.riskScore}</p>
            </div>
          </div>
        </section>
      ) : null}

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">扩展行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(h.timestamp).toLocaleString()}</span>
                <span className="font-mono text-teal-500">{h.action}</span>
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
