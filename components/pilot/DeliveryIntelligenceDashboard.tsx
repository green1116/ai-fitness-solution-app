"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Insight = {
  id: string;
  pattern: string;
  title: string;
  description: string;
  count: number;
};

type Recommendation = {
  id: string;
  sessionId: string;
  projectName?: string;
  action: string;
  priority: string;
  due: string;
  score: number;
  title: string;
  reason: string;
};

type RankedSession = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  priority: string;
  due: string;
  score: number;
  topAction: string;
  patterns: string[];
  slaStatus: string;
};

type Summary = {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  dueNow: number;
  dueSoon: number;
  dueLater: number;
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-400 border-red-800/50 bg-red-950/30",
  medium: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  low: "text-emerald-400 border-emerald-800/50 bg-emerald-950/30",
};

const DUE_LABELS: Record<string, string> = {
  due_now: "立即",
  soon: "尽快",
  later: "稍后",
};

const ACTION_LABELS: Record<string, string> = {
  follow_up_needed: "跟进",
  retry_delivery: "重试交付",
  escalate_to_admin: "升级管理员",
  customer_success_action: "客户成功",
};

export function DeliveryIntelligenceDashboard() {
  const searchParams = useSearchParams();
  const drillSession = searchParams.get("session") ?? "";

  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [ranked, setRanked] = useState<RankedSession[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [drilldown, setDrilldown] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v83/delivery-intelligence");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const intel = data.intelligence;
      setInsights(intel.insights ?? []);
      setRecommendations(intel.recommendations ?? []);
      setRanked(intel.rankedSessions ?? []);
      setSummary(intel.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDrilldown = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(
        `/api/pilot/v83/delivery-intelligence/${encodeURIComponent(sessionId)}`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "钻取失败");
      setDrilldown(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "钻取失败");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (drillSession) void loadDrilldown(drillSession);
  }, [drillSession, loadDrilldown]);

  if (loading) {
    return <p className="text-sm text-zinc-500">加载智能优化面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">只读优化层 — 派生自 V82 分析与 V81 事件</p>
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
            { label: "高风险", value: summary.highRisk, color: "text-red-300" },
            { label: "中风险", value: summary.mediumRisk, color: "text-amber-300" },
            { label: "低风险", value: summary.lowRisk, color: "text-emerald-300" },
            { label: "立即", value: summary.dueNow, color: "text-red-300" },
            { label: "尽快", value: summary.dueSoon, color: "text-amber-300" },
            { label: "稍后", value: summary.dueLater, color: "text-zinc-300" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {insights.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">洞察</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-4"
              >
                <p className="font-medium text-indigo-200">{ins.title}</p>
                <p className="mt-1 text-xs text-zinc-400">{ins.description}</p>
                <p className="mt-2 font-mono text-xs text-indigo-400/80">
                  {ins.pattern} · {ins.count} 会话
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-zinc-500">暂无洞察模式 — 所有发布会话健康</p>
      )}

      {recommendations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">推荐行动</h2>
          <ul className="space-y-2">
            {recommendations.slice(0, 8).map((rec) => (
              <li
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm"
              >
                <div>
                  <span
                    className={`mr-2 rounded border px-2 py-0.5 text-xs ${PRIORITY_COLORS[rec.priority] ?? ""}`}
                  >
                    {rec.priority} · {DUE_LABELS[rec.due] ?? rec.due}
                  </span>
                  <span className="text-zinc-200">{rec.title}</span>
                  <p className="mt-1 text-xs text-zinc-500">
                    {rec.projectName ?? rec.sessionId.slice(0, 8)} — {rec.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadDrilldown(rec.sessionId)}
                  className="text-xs text-sky-400 underline"
                >
                  钻取
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">优先级排序</h2>
        {ranked.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无已发布会话</p>
        ) : (
          <ul className="space-y-2">
            {ranked.map((s, i) => (
              <li
                key={s.sessionId}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-zinc-600">#{i + 1}</span>
                  <span className="font-medium text-zinc-200">
                    {s.projectName ?? s.sessionId.slice(0, 8)}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${PRIORITY_COLORS[s.priority] ?? ""}`}
                  >
                    {s.priority}
                  </span>
                  <span className="text-xs text-zinc-500">{DUE_LABELS[s.due]}</span>
                  <span className="text-xs text-zinc-600">score {s.score}</span>
                  <span className="text-xs text-violet-400">
                    {ACTION_LABELS[s.topAction] ?? s.topAction}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void loadDrilldown(s.sessionId)}
                    className="text-xs text-sky-400 underline"
                  >
                    一键钻取
                  </button>
                  <Link
                    href={`/pilot/delivery-analytics`}
                    className="text-xs text-zinc-500 underline"
                  >
                    分析
                  </Link>
                  <Link href={`/pilot/delivery-ops`} className="text-xs text-zinc-500 underline">
                    运营
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {drilldown ? (
        <section className="rounded-2xl border border-sky-900/40 bg-sky-950/20 p-6">
          <h2 className="text-sm font-semibold text-sky-200">会话钻取</h2>
          <pre className="mt-3 max-h-64 overflow-auto text-xs text-zinc-400">
            {JSON.stringify(drilldown, null, 2)}
          </pre>
          <button
            type="button"
            onClick={() => setDrilldown(null)}
            className="mt-3 text-xs text-zinc-500 underline"
          >
            关闭
          </button>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
