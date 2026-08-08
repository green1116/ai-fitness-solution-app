"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type QualityRow = {
  patternId: string;
  title: string;
  kind: string;
  authority: string;
  status: string;
  shown: number;
  accepted: number;
  dismissed: number;
  acceptRate: number;
  dismissRate: number;
  qualityScore: number;
  qualityBand: string;
  confidenceAdjustment: number;
  suggestion: { action: string; reason: string; priority: number };
};

type Report = {
  version: string;
  generatedAt: string;
  contentHash: string;
  aggregation: {
    patternsScored: number;
    totalShown: number;
    totalAccepted: number;
    totalDismissed: number;
    overallAcceptRate: number;
    overallDismissRate: number;
    byQualityBand: Record<string, number>;
    bySuggestion: Record<string, number>;
    trends: Array<{
      date: string;
      accepted: number;
      dismissed: number;
      acceptRate: number;
    }>;
  };
  quality: QualityRow[];
  suggestions: QualityRow[];
  recentApplied: Array<{
    id: string;
    at: string;
    action: string;
    patternId: string;
    applied: boolean;
    dryRun: boolean;
    message: string;
  }>;
};

const BAND_LABEL: Record<string, string> = {
  excellent: "优秀",
  good: "良好",
  fair: "一般",
  poor: "较差",
  insufficient: "样本不足",
};

const ACTION_LABEL: Record<string, string> = {
  promote: "晋升",
  demote: "降级",
  deprecate: "弃用",
  review: "复核",
  keep: "维持",
};

export function IntakeImprovementDashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastResults, setLastResults] = useState<Report["recentApplied"]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/improvement");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.code || "LOAD_FAILED");
      setReport(data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function applyFeedback(dryRun: boolean) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/improvement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          dryRun,
          maxActions: 5,
          actions: ["promote", "demote", "deprecate"],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.code || "APPLY_FAILED");
      setReport(data.report);
      setLastResults(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "APPLY_FAILED");
    } finally {
      setBusy(false);
    }
  }

  const agg = report?.aggregation;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pilot P15</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">持续改进</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            聚合推荐接受/驳回结果，评估知识质量，自动调整置信，并向治理层提出晋升/降级建议。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/pilot/v80/intake/improvement?download=1"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            导出 JSON
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void applyFeedback(true)}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
          >
            预演反馈
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void applyFeedback(false)}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {busy ? "处理中…" : "应用治理反馈"}
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-500">加载中…</p> : null}

      {report && agg ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="评分模式" value={String(agg.patternsScored)} />
            <Stat label="展示次数" value={String(agg.totalShown)} />
            <Stat
              label="接受率"
              value={`${(agg.overallAcceptRate * 100).toFixed(1)}%`}
            />
            <Stat
              label="驳回率"
              value={`${(agg.overallDismissRate * 100).toFixed(1)}%`}
            />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(agg.byQualityBand).map(([band, n]) => (
              <Stat key={band} label={BAND_LABEL[band] ?? band} value={String(n)} />
            ))}
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">治理建议</h2>
            <p className="mt-1 text-xs text-zinc-500">
              晋升 {agg.bySuggestion.promote ?? 0} · 降级 {agg.bySuggestion.demote ?? 0} · 弃用{" "}
              {agg.bySuggestion.deprecate ?? 0} · 复核 {agg.bySuggestion.review ?? 0}
            </p>
            <ul className="mt-3 space-y-2">
              {report.suggestions.slice(0, 12).map((s) => (
                <li
                  key={s.patternId}
                  className="rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px]">
                      {ACTION_LABEL[s.suggestion.action] ?? s.suggestion.action}
                    </span>
                    <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px]">
                      {BAND_LABEL[s.qualityBand] ?? s.qualityBand}
                    </span>
                    <span className="font-medium text-zinc-200">{s.title}</span>
                    <span className="tabular-nums text-zinc-500">
                      Q {(s.qualityScore * 100).toFixed(0)}% · adj{" "}
                      {s.confidenceAdjustment >= 0 ? "+" : ""}
                      {s.confidenceAdjustment.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-500">{s.suggestion.reason}</p>
                  <p className="mt-0.5 text-zinc-600">
                    展示 {s.shown} · 接受 {s.accepted} · 驳回 {s.dismissed} ·{" "}
                    {s.authority}/{s.status}
                  </p>
                </li>
              ))}
              {report.suggestions.length === 0 ? (
                <li className="text-xs text-zinc-500">暂无需处理建议。</li>
              ) : null}
            </ul>
          </section>

          <section className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2">模式</th>
                  <th className="px-3 py-2">质量</th>
                  <th className="px-3 py-2">接受/驳回</th>
                  <th className="px-3 py-2">置信调整</th>
                  <th className="px-3 py-2">建议</th>
                </tr>
              </thead>
              <tbody>
                {report.quality.slice(0, 40).map((q) => (
                  <tr key={q.patternId} className="border-b border-zinc-900/80 align-top">
                    <td className="px-3 py-2">
                      <div className="text-zinc-200">{q.title}</div>
                      <div className="text-[10px] text-zinc-600">
                        {q.kind} · {q.authority}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {BAND_LABEL[q.qualityBand]} {(q.qualityScore * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-2 text-xs tabular-nums text-zinc-400">
                      {(q.acceptRate * 100).toFixed(0)}% / {(q.dismissRate * 100).toFixed(0)}%
                      <div className="text-[10px] text-zinc-600">
                        n={q.shown}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs tabular-nums">
                      {q.confidenceAdjustment >= 0 ? "+" : ""}
                      {q.confidenceAdjustment.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {ACTION_LABEL[q.suggestion.action]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {agg.trends.length > 0 ? (
            <section className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">接受/驳回趋势</h2>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                {agg.trends.slice(-14).map((t) => (
                  <li key={t.date}>
                    {t.date} · 接受 {t.accepted} · 驳回 {t.dismissed} · 接受率{" "}
                    {(t.acceptRate * 100).toFixed(0)}%
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(lastResults.length > 0 || report.recentApplied.length > 0) ? (
            <section className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">反馈执行记录</h2>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                {(lastResults.length ? lastResults : report.recentApplied)
                  .slice(0, 10)
                  .map((r) => (
                    <li key={r.id}>
                      [{r.dryRun ? "dry-run" : r.applied ? "ok" : "fail"}] {r.action} ·{" "}
                      {r.message}
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}

          <p className="text-[10px] text-zinc-600">
            hash {report.contentHash.slice(0, 16)}… ·{" "}
            {new Date(report.generatedAt).toLocaleString("zh-CN")}
          </p>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg text-zinc-100">{value}</div>
    </div>
  );
}
