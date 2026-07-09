"use client";

import { useCallback, useEffect, useState } from "react";

type SegmentCard = {
  segment: string;
  label: string;
  accountCount: number;
  segmentHealthScore: number;
  expansionPotential: number;
  churnExposure: number;
  expectedValue: number;
};

type AccountRow = {
  sessionId: string;
  projectName?: string;
  segments: string[];
  primarySegment: string;
  segmentHealthScore: number;
  expansionPotential: number;
  expectedValue: number;
  rankPosition: number;
  rankScore: number;
  nextAction: string;
  actionBadge: string;
  riskScore: number;
};

type Summary = {
  totalAccounts: number;
  enterprise: number;
  highValue: number;
  atRisk: number;
  expansionReady: number;
  churnRescue: number;
  avgHealthScore: number;
  totalExpectedValue: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  source: string;
};

const BADGE_STYLES: Record<string, string> = {
  expand: "bg-sky-950 text-sky-300",
  retain: "bg-emerald-950 text-emerald-300",
  rescue: "bg-red-950 text-red-300",
  follow_up: "bg-amber-950 text-amber-300",
  monitor: "bg-zinc-800 text-zinc-300",
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function PortfolioDashboard() {
  const [segmentCards, setSegmentCards] = useState<SegmentCard[]>([]);
  const [rankedAccounts, setRankedAccounts] = useState<AccountRow[]>([]);
  const [topExpansion, setTopExpansion] = useState<AccountRow[]>([]);
  const [topRescue, setTopRescue] = useState<AccountRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ActionEntry[]>([]);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"all" | "expansion" | "rescue">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v90/portfolio");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSegmentCards(d.segmentCards ?? []);
      setRankedAccounts(d.rankedAccounts ?? []);
      setTopExpansion(d.prioritization?.topExpansionTargets ?? []);
      setTopRescue(d.prioritization?.topRescueAccounts ?? []);
      setSummary(d.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/pilot/v90/portfolio/${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setHistory(data.detail?.actionHistory ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function recordPriority(sessionId: string) {
    setActing(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v90/portfolio/${encodeURIComponent(sessionId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "record_priority", note: "组合优先级确认" }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
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
    return <p className="text-sm text-zinc-500">加载投资组合面板…</p>;
  }

  const activeList =
    view === "expansion" ? topExpansion : view === "rescue" ? topRescue : rankedAccounts;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">投资组合 — 只读扩展/增长/收入层 + 组合缓存写入</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: "账户", value: summary.totalAccounts },
            { label: "企业级", value: summary.enterprise },
            { label: "高价值", value: summary.highValue },
            { label: "高风险", value: summary.atRisk },
            { label: "扩展就绪", value: summary.expansionReady },
            { label: "流失救援", value: summary.churnRescue },
            { label: "均健康分", value: summary.avgHealthScore },
            { label: "预期总值", value: formatCurrency(summary.totalExpectedValue) },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-lg font-bold text-indigo-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {segmentCards.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {segmentCards.slice(0, 6).map((card) => (
            <div key={card.segment} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm font-medium text-white">
                {card.label} ({card.accountCount})
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                健康 {card.segmentHealthScore} · 扩展 {formatCurrency(card.expansionPotential)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                风险敞口 {formatCurrency(card.churnExposure)} · 预期{" "}
                {formatCurrency(card.expectedValue)}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "全部排名" },
            { key: "expansion", label: "扩展目标" },
            { key: "rescue", label: "救援账户" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setView(tab.key)}
            className={`rounded-lg px-4 py-2 text-xs font-medium ${
              view === tab.key
                ? "bg-indigo-700 text-white"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {activeList.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无账户</p>
        ) : (
          <ul className="space-y-3">
            {activeList.map((item) => (
              <li
                key={item.sessionId}
                className={`rounded-2xl border p-4 ${
                  selected === item.sessionId
                    ? "border-indigo-700 bg-indigo-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      #{item.rankPosition} {item.projectName ?? item.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatCurrency(item.expectedValue)} · 扩展{" "}
                      {formatCurrency(item.expansionPotential)} · 排名分 {item.rankScore}
                    </p>
                    <p className="mt-1 text-xs text-indigo-300">下一步: {item.nextAction}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.segments.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-indigo-950/50 px-2 py-0.5 text-xs text-indigo-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${BADGE_STYLES[item.actionBadge] ?? "bg-zinc-800"}`}
                  >
                    {item.actionBadge}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => void recordPriority(item.sessionId)}
                    className="rounded-lg bg-indigo-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                  >
                    确认优先级
                  </button>
                  <button
                    type="button"
                    onClick={() => void selectSession(item.sessionId)}
                    className="text-xs text-sky-400 underline"
                  >
                    钻取
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
                <span className="font-mono text-indigo-500">{h.action}</span>
                <span className="text-zinc-600">[{h.source}]</span>
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
