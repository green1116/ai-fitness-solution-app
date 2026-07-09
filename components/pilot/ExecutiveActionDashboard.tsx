"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  actionQueue: string;
  priority: string;
  recommendedAction: string;
  dueDate: string;
  executiveOwnerName?: string;
  status: string;
  outcome: string;
  isOverdue: boolean;
  rankScore: number;
  expectedValue: number;
};

type Summary = {
  total: number;
  priorityDecision: number;
  riskMitigation: number;
  opportunityCapture: number;
  overdueAction: number;
  pending: number;
  completed: number;
  overdue: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  sessionId: string;
};

const QUEUE_LABELS: Record<string, string> = {
  priority_decision: "优先决策",
  risk_mitigation: "风险缓解",
  opportunity_capture: "机会捕获",
  overdue_action: "逾期行动",
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-950 text-red-300",
  high: "bg-orange-950 text-orange-300",
  medium: "bg-amber-950 text-amber-300",
};

const OUTCOME_STYLES: Record<string, string> = {
  open: "bg-zinc-800 text-zinc-300",
  acted: "bg-emerald-950 text-emerald-300",
  deferred: "bg-violet-950 text-violet-300",
  closed: "bg-sky-950 text-sky-300",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function ExecutiveActionDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [queues, setQueues] = useState<Record<string, QueueItem[]>>({});
  const [pending, setPending] = useState<QueueItem[]>([]);
  const [completed, setCompleted] = useState<QueueItem[]>([]);
  const [overdue, setOverdue] = useState<QueueItem[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v95/executive-actions");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSummary(d.summary ?? null);
      setQueues(d.queues ?? {});
      setPending(d.closure?.pendingDecisions ?? []);
      setCompleted(d.closure?.completedDecisions ?? []);
      setOverdue(d.closure?.overdueItems ?? []);
      setActions(d.recentActions ?? []);
      if (!selectedSession && d.allItems?.[0]?.sessionId) {
        setSelectedSession(d.allItems[0].sessionId);
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: string, extra?: Record<string, string>) {
    if (!selectedSession) return;
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v95/executive-actions/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sessionId: selectedSession, ...extra }),
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
    return <p className="text-sm text-zinc-500">加载高管行动面板…</p>;
  }

  const allQueueItems: QueueItem[] = [
    ...(queues.overdueAction ?? []),
    ...(queues.priorityDecision ?? []),
    ...(queues.riskMitigation ?? []),
    ...(queues.opportunityCapture ?? []),
  ];

  const selected = allQueueItems.find((i) => i.sessionId === selectedSession) ??
    pending.find((i) => i.sessionId === selectedSession) ??
    completed.find((i) => i.sessionId === selectedSession);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">高管行动 — 只读简报/治理层 + 行动缓存写入</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "活跃行动", value: summary.total },
            { label: "待决", value: summary.pending },
            { label: "已闭环", value: summary.completed },
            { label: "逾期", value: summary.overdue },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-cyan-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {selected ? (
        <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/10 p-6">
          <h2 className="text-sm font-semibold text-cyan-300">负责人工作流</h2>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-white">
                {selected.projectName ?? selected.sessionId.slice(0, 8)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{selected.recommendedAction}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {QUEUE_LABELS[selected.actionQueue] ?? selected.actionQueue} · 负责人{" "}
                {selected.executiveOwnerName ?? "未分配"} · 截止{" "}
                {new Date(selected.dueDate).toLocaleDateString("zh-CN")}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs ${OUTCOME_STYLES[selected.outcome] ?? "bg-zinc-800"}`}
            >
              {selected.outcome}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                void runAction("assign_executive_owner", {
                  ownerId: "exec-owner",
                  ownerName: "Executive",
                })
              }
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              分配负责人
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("confirm_decision")}
              className="rounded-lg border border-violet-800 px-3 py-1.5 text-xs text-violet-300 disabled:opacity-40"
            >
              确认决策
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("mark_acted")}
              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              标记已执行
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("mark_deferred")}
              className="rounded-lg border border-amber-800 px-3 py-1.5 text-xs text-amber-300 disabled:opacity-40"
            >
              延期
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("mark_closed")}
              className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
            >
              闭环关闭
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                void runAction("record_outcome", { outcomeNote: "目标已达成" })
              }
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              记录结果
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">决策队列</h2>
        {allQueueItems.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无活跃行动 — 请先从简报层生成决策</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {allQueueItems.map((item) => (
              <li
                key={item.sessionId}
                className={`cursor-pointer rounded-xl border p-4 ${
                  selectedSession === item.sessionId
                    ? "border-cyan-700 bg-cyan-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
                onClick={() => setSelectedSession(item.sessionId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">
                    {item.projectName ?? item.sessionId.slice(0, 8)}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${PRIORITY_STYLES[item.priority] ?? "bg-zinc-800"}`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {QUEUE_LABELS[item.actionQueue]} · {formatCurrency(item.expectedValue)}
                  {item.isOverdue ? " · 逾期" : ""}
                </p>
                <p className="mt-2 text-xs text-zinc-400">{item.recommendedAction}</p>
                <Link
                  href={`/pilot/executive-briefing?session=${item.sessionId}`}
                  className="mt-2 inline-block text-xs text-cyan-400 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  下钻简报
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-violet-400">待决决策</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-zinc-500">无待决项</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {pending.slice(0, 6).map((item) => (
                <li key={item.sessionId} className="rounded-lg border border-zinc-800 p-3">
                  {item.projectName ?? item.sessionId.slice(0, 8)} — {item.recommendedAction}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-emerald-400">闭环状态</h2>
          {completed.length === 0 ? (
            <p className="text-sm text-zinc-500">暂无已闭环项</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {completed.slice(0, 6).map((item) => (
                <li key={item.sessionId} className="rounded-lg border border-zinc-800 p-3">
                  <span className="text-emerald-400">{item.outcome}</span> —{" "}
                  {item.projectName ?? item.sessionId.slice(0, 8)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {overdue.length > 0 ? (
        <section className="rounded-2xl border border-red-900/50 bg-red-950/10 p-6">
          <h2 className="text-sm font-semibold text-red-400">逾期项 ({overdue.length})</h2>
          <ul className="mt-3 space-y-2 text-xs text-zinc-400">
            {overdue.map((item) => (
              <li key={item.sessionId}>
                {item.projectName ?? item.sessionId.slice(0, 8)} — 截止{" "}
                {new Date(item.dueDate).toLocaleDateString("zh-CN")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {actions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">行动时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {actions.slice(0, 12).map((a) => (
              <li key={a.id} className="flex flex-wrap gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(a.timestamp).toLocaleString()}</span>
                <span className="font-mono text-cyan-500">{a.action}</span>
                <span className="text-zinc-600">{a.sessionId.slice(0, 8)}</span>
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
