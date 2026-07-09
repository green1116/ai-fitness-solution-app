"use client";

import { useCallback, useEffect, useState } from "react";

type FollowUp = {
  status: string;
  ownerId?: string;
  ownerName?: string;
  contactAttempts: number;
  responseStatus: string;
  resolutionStatus: string;
  callbackScheduledAt?: string;
};

type Customer = {
  sessionId: string;
  projectName?: string;
  releasePackageId?: string;
  riskScore: number;
  priority: string;
  due: string;
  lastEventAt?: string;
  lastEventLabel?: string;
  recommendedTitle: string;
  followUp: FollowUp;
};

type QueueItem = Customer & { queuePosition: number };

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  actorId: string;
};

type Summary = {
  total: number;
  pending: number;
  inProgress: number;
  escalated: number;
  resolved: number;
  hotAccounts: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-zinc-400 border-zinc-700",
  in_progress: "text-sky-400 border-sky-800/50",
  escalated: "text-red-400 border-red-800/50",
  resolved: "text-emerald-400 border-emerald-800/50",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待跟进",
  in_progress: "跟进中",
  escalated: "已升级",
  resolved: "已解决",
};

export function CustomerSuccessDashboard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v84/customer-success");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      setQueue(data.crm?.queue ?? []);
      setSummary(data.crm?.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (sessionId: string) => {
    const res = await fetch(
      `/api/pilot/v84/customer-success/${encodeURIComponent(sessionId)}`,
    );
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
        `/api/pilot/v84/customer-success/${encodeURIComponent(sessionId)}/actions`,
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
    return <p className="text-sm text-zinc-500">加载客户成功面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          跟进状态可写 · 交付数据只读 · 派生自 V83 智能推荐
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
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "客户", value: summary.total },
            { label: "待跟进", value: summary.pending },
            { label: "跟进中", value: summary.inProgress },
            { label: "已升级", value: summary.escalated },
            { label: "已解决", value: summary.resolved },
            { label: "高风险", value: summary.hotAccounts },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-teal-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">跟进队列</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无待跟进客户</p>
        ) : (
          <ul className="space-y-3">
            {queue.map((item) => (
              <li
                key={item.sessionId}
                className={`rounded-2xl border p-4 ${
                  selected === item.sessionId ? "border-teal-700 bg-teal-950/20" : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.queuePosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      风险 {item.riskScore} · {item.recommendedTitle} · {item.lastEventLabel}
                    </p>
                    {item.followUp.ownerName ? (
                      <p className="mt-1 text-xs text-teal-400">负责人: {item.followUp.ownerName}</p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${STATUS_COLORS[item.followUp.status] ?? ""}`}
                  >
                    {STATUS_LABELS[item.followUp.status] ?? item.followUp.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {!item.followUp.ownerId ? (
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
                    onClick={() => void runAction(item.sessionId, "contact_attempt")}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    记录联系
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void runAction(item.sessionId, "send_reminder")}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    发送提醒
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void runAction(item.sessionId, "escalate_hot")}
                    className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
                  >
                    升级
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void runAction(item.sessionId, "mark_resolved")}
                    className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                  >
                    标记解决
                  </button>
                  <button
                    type="button"
                    onClick={() => void selectSession(item.sessionId)}
                    className="text-xs text-sky-400 underline"
                  >
                    时间线
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">行动时间线</h2>
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
