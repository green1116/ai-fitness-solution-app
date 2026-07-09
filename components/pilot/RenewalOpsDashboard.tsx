"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  pipelineQueue: string;
  queuePosition: number;
  daysUntilRenewal: number;
  riskScore: number;
  renewalLikelihood: number;
  ownerName?: string;
  opsStatus: string;
  outcome: string;
  nextAction: string;
  openRisks: string[];
};

type Summary = {
  total: number;
  expiringSoon: number;
  outreachNeeded: number;
  atRisk: number;
  saved: number;
  renewed: number;
  churned: number;
  inOutreach: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

const QUEUE_LABELS: Record<string, string> = {
  expiring_soon: "即将到期",
  outreach_needed: "需外联",
  at_risk: "流失风险",
};

const OUTCOME_COLORS: Record<string, string> = {
  open: "text-zinc-400",
  saved: "text-emerald-400",
  renewed: "text-sky-400",
  churned: "text-red-400",
};

export function RenewalOpsDashboard() {
  const [queues, setQueues] = useState<{
    expiringSoon: QueueItem[];
    outreachNeeded: QueueItem[];
    atRisk: QueueItem[];
  }>({ expiringSoon: [], outreachNeeded: [], atRisk: [] });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"expiring_soon" | "outreach_needed" | "at_risk">(
    "expiring_soon",
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v86/renewal-ops");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setQueues(d.queues ?? { expiringSoon: [], outreachNeeded: [], atRisk: [] });
      setSummary(d.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/pilot/v86/renewal-ops/${encodeURIComponent(sessionId)}`);
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
        `/api/pilot/v86/renewal-ops/${encodeURIComponent(sessionId)}/actions`,
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
    return <p className="text-sm text-zinc-500">加载续约运营面板…</p>;
  }

  const activeQueue =
    activeTab === "expiring_soon"
      ? queues.expiringSoon
      : activeTab === "outreach_needed"
        ? queues.outreachNeeded
        : queues.atRisk;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          续约运营 — 只读预测 + 最小写入续约状态
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "队列", value: summary.total },
            { label: "即将到期", value: summary.expiringSoon },
            { label: "需外联", value: summary.outreachNeeded },
            { label: "高风险", value: summary.atRisk },
            { label: "已挽留", value: summary.saved },
            { label: "已续约", value: summary.renewed },
            { label: "已流失", value: summary.churned },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-orange-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["expiring_soon", "outreach_needed", "at_risk"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              activeTab === tab
                ? "bg-orange-700 text-white"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {QUEUE_LABELS[tab]} (
            {tab === "expiring_soon"
              ? queues.expiringSoon.length
              : tab === "outreach_needed"
                ? queues.outreachNeeded.length
                : queues.atRisk.length}
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
                    ? "border-orange-700 bg-orange-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.queuePosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      续约 {item.daysUntilRenewal} 天 · 风险 {item.riskScore} · 可能性{" "}
                      {item.renewalLikelihood}%
                    </p>
                    <p className="mt-1 text-xs text-orange-300">下一步: {item.nextAction}</p>
                    {item.ownerName ? (
                      <p className="mt-1 text-xs text-zinc-400">负责人: {item.ownerName}</p>
                    ) : null}
                  </div>
                  <span className={`text-xs ${OUTCOME_COLORS[item.outcome] ?? ""}`}>
                    {item.opsStatus} / {item.outcome}
                  </span>
                </div>

                {item.openRisks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.openRisks.map((r) => (
                      <span
                        key={r}
                        className="rounded bg-red-950/40 px-2 py-0.5 text-xs text-red-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.outcome === "open" || item.outcome === "saved" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.ownerName ? (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void runAction(item.sessionId, "assign_owner")}
                        className="rounded-lg bg-orange-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                      >
                        认领
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "renewal_attempt")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      记录触达
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "schedule_outreach")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      计划外联
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
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">续约行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(h.timestamp).toLocaleString()}</span>
                <span className="font-mono text-orange-500">{h.action}</span>
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
