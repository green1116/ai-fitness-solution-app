"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  label: string;
  score: number;
  percentile: number;
  band: string;
  polarity: string;
  trendDelta: number;
  summary: string;
  metrics: Record<string, number | string>;
};

type Report = {
  version: string;
  generatedAt: string;
  contentHash: string;
  window: { sessionCount: number };
  scorecard: {
    overallScore: number;
    overallPercentile: number;
    overallBand: string;
    strengths: string[];
    weaknesses: string[];
    categories: Category[];
  };
  maturity: {
    level: string;
    score: number;
    rationale: string;
    criteriaMet: string[];
    criteriaMissed: string[];
  };
  opportunities: Array<{
    id: string;
    categoryId: string;
    severity: string;
    title: string;
    rationale: string;
    recommendedAction: string;
    impactScore: number;
  }>;
  trends: Array<{
    date: string;
    overallScoreApprox: number;
    readyRate: number;
    acceptRate: number;
    complianceBlockRate: number;
  }>;
  sources: {
    knowledgePatternCount: number;
    governanceRevision: number;
    improvementSuggestions: number;
    recommendationAcceptRate: number;
  };
};

const BAND_LABEL: Record<string, string> = {
  leading: "领先",
  strong: "强",
  average: "中等",
  lagging: "落后",
  critical: "危急",
};

const MATURITY_LABEL: Record<string, string> = {
  nascent: "萌芽",
  developing: "发展中",
  established: "已建立",
  advanced: "进阶",
  leading: "领先",
};

const SEVERITY_CLASS: Record<string, string> = {
  high: "border-rose-900 text-rose-300",
  medium: "border-amber-800 text-amber-200",
  low: "border-zinc-700 text-zinc-400",
};

export function IntakeBenchmarkDashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/benchmark");
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pilot P16</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">组织对标看板</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            基于历史 Intake、知识、治理与改进数据的确定性组合记分卡，识别优势、短板与改进机会。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/pilot/v80/intake/benchmark?download=1"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            导出 JSON
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200"
          >
            刷新
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-500">加载中…</p> : null}

      {report ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="综合得分"
              value={`${report.scorecard.overallScore}`}
              hint={BAND_LABEL[report.scorecard.overallBand] ?? report.scorecard.overallBand}
            />
            <Stat
              label="对标百分位"
              value={`${report.scorecard.overallPercentile}`}
              hint="相对目标锚点"
            />
            <Stat
              label="成熟度"
              value={MATURITY_LABEL[report.maturity.level] ?? report.maturity.level}
              hint={report.maturity.rationale}
            />
            <Stat
              label="会话样本"
              value={String(report.window.sessionCount)}
              hint={`知识 ${report.sources.knowledgePatternCount} · 治理 r${report.sources.governanceRevision}`}
            />
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">优势</h2>
              <ul className="mt-2 space-y-1 text-xs text-emerald-400/90">
                {report.scorecard.categories
                  .filter((c) => c.polarity === "strength")
                  .map((c) => (
                    <li key={c.id}>
                      {c.label} · {c.score}（P{c.percentile}）
                    </li>
                  ))}
                {report.scorecard.strengths.length === 0 ? (
                  <li className="text-zinc-500">暂无明显优势类目</li>
                ) : null}
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">短板</h2>
              <ul className="mt-2 space-y-1 text-xs text-rose-300/90">
                {report.scorecard.categories
                  .filter((c) => c.polarity === "weakness")
                  .map((c) => (
                    <li key={c.id}>
                      {c.label} · {c.score}（P{c.percentile}）
                      {c.trendDelta !== 0 ? ` · Δ${c.trendDelta}` : ""}
                    </li>
                  ))}
                {report.scorecard.weaknesses.length === 0 ? (
                  <li className="text-zinc-500">暂无明显短板类目</li>
                ) : null}
              </ul>
            </div>
          </section>

          <section className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2">类目</th>
                  <th className="px-3 py-2">得分</th>
                  <th className="px-3 py-2">百分位</th>
                  <th className="px-3 py-2">档位</th>
                  <th className="px-3 py-2">趋势Δ</th>
                </tr>
              </thead>
              <tbody>
                {report.scorecard.categories.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-900/80">
                    <td className="px-3 py-2 text-zinc-200">{c.label}</td>
                    <td className="px-3 py-2 tabular-nums">{c.score}</td>
                    <td className="px-3 py-2 tabular-nums text-zinc-400">{c.percentile}</td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {BAND_LABEL[c.band] ?? c.band}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-xs text-zinc-500">
                      {c.trendDelta > 0 ? `+${c.trendDelta}` : c.trendDelta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">改进机会</h2>
            <ul className="mt-3 space-y-2">
              {report.opportunities.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] ${SEVERITY_CLASS[o.severity] ?? ""}`}
                    >
                      {o.severity}
                    </span>
                    <span className="font-medium text-zinc-200">{o.title}</span>
                    <span className="tabular-nums text-zinc-500">
                      影响 {o.impactScore}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-500">{o.rationale}</p>
                  <p className="mt-0.5 text-emerald-400/80">{o.recommendedAction}</p>
                </li>
              ))}
              {report.opportunities.length === 0 ? (
                <li className="text-xs text-zinc-500">暂无显著机会。</li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">成熟度条件</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-zinc-500">已满足</p>
                <ul className="mt-1 space-y-0.5 text-emerald-400/80">
                  {report.maturity.criteriaMet.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-zinc-500">未满足</p>
                <ul className="mt-1 space-y-0.5 text-amber-200/80">
                  {report.maturity.criteriaMissed.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {report.trends.length > 0 ? (
            <section className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">趋势对照</h2>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                {report.trends.slice(-14).map((t) => (
                  <li key={t.date}>
                    {t.date} · 近似综合 {t.overallScoreApprox} · ready{" "}
                    {(t.readyRate * 100).toFixed(0)}% · 合规阻断{" "}
                    {(t.complianceBlockRate * 100).toFixed(0)}%
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

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg text-zinc-100">{value}</div>
      {hint ? <div className="mt-1 text-[10px] text-zinc-600 line-clamp-2">{hint}</div> : null}
    </div>
  );
}
