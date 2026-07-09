"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  projectName?: string;
  executiveQueue: string;
  queuePosition: number;
  expectedValue: number;
  expansionPotential: number;
  riskScore: number;
  rankScore: number;
  executiveOwnerName?: string;
  governanceStatus: string;
  outcome: string;
  nextDecision: string;
};

type Summary = {
  total: number;
  enterprisePriority: number;
  expansionReady: number;
  atRisk: number;
  rescue: number;
  followUpNeeded: number;
  approved: number;
  deferred: number;
  blocked: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

type BoardView = {
  segment: string;
  segments: string[];
  value: { expectedValue: number; expansionPotential: number };
  risk: { riskScore: number; churnExposure: number };
  nextDecision: string;
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
  board_review: "bg-violet-950 text-violet-300",
  approved: "bg-emerald-950 text-emerald-300",
  deferred: "bg-amber-950 text-amber-300",
  blocked: "bg-red-950 text-red-300",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function BoardGovernanceDashboard() {
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
  const [boardView, setBoardView] = useState<BoardView | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("rescue");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v92/board-governance");
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
    const res = await fetch(
      `/api/pilot/v92/board-governance/${encodeURIComponent(sessionId)}`,
    );
    const data = await res.json();
    if (res.ok && data.ok) {
      setHistory(data.detail?.decisionHistory ?? []);
      setBoardView(data.detail?.boardView ?? null);
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
        `/api/pilot/v92/board-governance/${encodeURIComponent(sessionId)}/actions`,
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
    return <p className="text-sm text-zinc-500">加载董事会治理面板…</p>;
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
        <p className="text-xs text-zinc-500">董事会治理 — 只读组合运营 + 最小写入治理状态</p>
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
            { label: "治理队列", value: summary.total },
            { label: "企业优先", value: summary.enterprisePriority },
            { label: "扩展就绪", value: summary.expansionReady },
            { label: "高风险", value: summary.atRisk },
            { label: "救援", value: summary.rescue },
            { label: "需跟进", value: summary.followUpNeeded },
            { label: "已批准", value: summary.approved },
            { label: "已延期", value: summary.deferred },
            { label: "已阻断", value: summary.blocked },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-fuchsia-300">{c.value}</p>
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
                ? "bg-fuchsia-700 text-white"
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
                    ? "border-fuchsia-700 bg-fuchsia-950/20"
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
                    <p className="mt-1 text-xs text-fuchsia-300">
                      下一步决策: {item.nextDecision}
                    </p>
                    {item.executiveOwnerName ? (
                      <p className="mt-1 text-xs text-zinc-400">
                        高管: {item.executiveOwnerName}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${STATUS_BADGES[item.governanceStatus] ?? "bg-zinc-800"}`}
                  >
                    {item.governanceStatus}
                  </span>
                </div>

                {item.outcome === "open" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.executiveOwnerName ? (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void runAction(item.sessionId, "assign_executive_owner")}
                        className="rounded-lg bg-fuchsia-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                      >
                        认领
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "schedule_board_review")}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      董事会评审
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "record_decision")}
                      className="rounded-lg border border-violet-700 px-3 py-1.5 text-xs text-violet-300 disabled:opacity-40"
                    >
                      记录决议
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void runAction(item.sessionId, "mark_approved")}
                      className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                    >
                      批准
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

      {selected && boardView ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">董事会视图</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-zinc-500">细分</p>
              <p className="text-fuchsia-300">{boardView.segments.join(", ")}</p>
            </div>
            <div>
              <p className="text-zinc-500">价值</p>
              <p className="text-emerald-400">
                {formatCurrency(boardView.value.expectedValue)} · 扩展{" "}
                {formatCurrency(boardView.value.expansionPotential)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">风险</p>
              <p className="text-orange-400">
                评分 {boardView.risk.riskScore} · 敞口{" "}
                {formatCurrency(boardView.risk.churnExposure)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">下一步决策</p>
              <p className="text-white">{boardView.nextDecision}</p>
            </div>
          </div>
        </section>
      ) : null}

      {selected && history.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">决策时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(h.timestamp).toLocaleString()}</span>
                <span className="font-mono text-fuchsia-500">{h.action}</span>
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
