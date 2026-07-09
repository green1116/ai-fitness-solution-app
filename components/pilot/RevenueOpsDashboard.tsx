"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  revenueQueue: string;
  queuePosition: number;
  expectedRenewalValue: number;
  weightedValue: number;
  daysUntilRenewal: number;
  riskScore: number;
  renewalLikelihood: number;
  ownerName?: string;
  opsStatus: string;
  outcome: string;
  escalationLevel: number;
  nextAction: string;
  openRisks: string[];
};

type Forecast = {
  expectedRenewalValue: number;
  atRiskRevenue: number;
  savedRevenue: number;
  renewedRevenue: number;
  churnedRevenue: number;
};

type Summary = {
  total: number;
  saved: number;
  renewed: number;
  churnRisk: number;
  expiringSoon: number;
  atRisk: number;
  churned: number;
  escalated: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

type TabKey = "at_risk" | "expiring_soon" | "churn_risk" | "saved" | "renewed";

const QUEUE_LABELS: Record<TabKey, string> = {
  at_risk: "高风险",
  expiring_soon: "即将到期",
  churn_risk: "流失风险",
  saved: "已挽留",
  renewed: "已续约",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function RevenueOpsDashboard() {
  const [queues, setQueues] = useState<{
    saved: QueueItem[];
    renewed: QueueItem[];
    churnRisk: QueueItem[];
    expiringSoon: QueueItem[];
    atRisk: QueueItem[];
  }>({ saved: [], renewed: [], churnRisk: [], expiringSoon: [], atRisk: [] });
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("at_risk");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v87/revenue-ops");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setQueues(
        d.queues ?? {
          saved: [],
          renewed: [],
          churnRisk: [],
          expiringSoon: [],
          atRisk: [],
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
    const res = await fetch(`/api/pilot/v87/revenue-ops/${encodeURIComponent(sessionId)}`);
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
        `/api/pilot/v87/revenue-ops/${encodeURIComponent(sessionId)}/actions`,
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
    return <p className="text-sm text-zinc-500">加载收入运营面板…</p>;
  }

  const activeQueue =
    activeTab === "saved"
      ? queues.saved
      : activeTab === "renewed"
        ? queues.renewed
        : activeTab === "churn_risk"
          ? queues.churnRisk
          : activeTab === "expiring_soon"
            ? queues.expiringSoon
            : queues.atRisk;

  const isClosedTab = activeTab === "saved" || activeTab === "renewed";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">收入运营 — 只读预测 + 最小写入收入状态</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {forecast ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "预期续约收入", value: forecast.expectedRenewalValue, color: "text-amber-300" },
            { label: "风险收入", value: forecast.atRiskRevenue, color: "text-orange-400" },
            { label: "已挽留收入", value: forecast.savedRevenue, color: "text-emerald-400" },
            { label: "已续约收入", value: forecast.renewedRevenue, color: "text-sky-400" },
            { label: "已流失收入", value: forecast.churnedRevenue, color: "text-red-400" },
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
            { label: "队列", value: summary.total },
            { label: "高风险", value: summary.atRisk },
            { label: "即将到期", value: summary.expiringSoon },
            { label: "流失风险", value: summary.churnRisk },
            { label: "已挽留", value: summary.saved },
            { label: "已续约", value: summary.renewed },
            { label: "已流失", value: summary.churned },
            { label: "已升级", value: summary.escalated },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-amber-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["at_risk", "expiring_soon", "churn_risk", "saved", "renewed"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              activeTab === tab
                ? "bg-amber-700 text-white"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {QUEUE_LABELS[tab]} (
            {tab === "at_risk"
              ? queues.atRisk.length
              : tab === "expiring_soon"
                ? queues.expiringSoon.length
                : tab === "churn_risk"
                  ? queues.churnRisk.length
                  : tab === "saved"
                    ? queues.saved.length
                    : queues.renewed.length}
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
                    ? "border-amber-700 bg-amber-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.queuePosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatCurrency(item.expectedRenewalValue)} · 加权{" "}
                      {formatCurrency(item.weightedValue)} · 续约 {item.daysUntilRenewal} 天
                    </p>
                    <p className="mt-1 text-xs text-amber-300">下一步: {item.nextAction}</p>
                    {item.ownerName ? (
                      <p className="mt-1 text-xs text-zinc-400">负责人: {item.ownerName}</p>
                    ) : null}
                    {item.escalationLevel > 0 ? (
                      <p className="mt-1 text-xs text-orange-400">
                        升级 L{item.escalationLevel}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {item.opsStatus} / {item.outcome}
                  </span>
                </div>

                {!isClosedTab && item.outcome === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.ownerName ? (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void runAction(item.sessionId, "assign_owner")}
                        className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                      >
                        认领
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "escalate")}
                      className="rounded-lg border border-orange-700 px-3 py-1.5 text-xs text-orange-300 disabled:opacity-40"
                    >
                      升级
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "schedule_follow_up")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      计划跟进
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_saved")}
                      className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                    >
                      已挽留
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_renewed")}
                      className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
                    >
                      已续约
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_churned")}
                      className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
                    >
                      已流失
                    </button>
                    <button
                      type="button"
                      onClick={() => void selectSession(item.sessionId)}
                      className="text-xs text-sky-400 underline"
                    >
                      时间线
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void selectSession(item.sessionId)}
                    className="mt-3 text-xs text-sky-400 underline"
                  >
                    时间线
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">收入行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(h.timestamp).toLocaleString()}</span>
                <span className="font-mono text-amber-500">{h.action}</span>
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
