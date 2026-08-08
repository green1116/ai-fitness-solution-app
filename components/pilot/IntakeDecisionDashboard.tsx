"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  generatedAt: string;
  contentHash: string;
  executiveScorecard: {
    overallHealth: number;
    readinessIndex: number;
    riskIndex: number;
    knowledgeLeverage: number;
    benchmarkScore: number;
    maturityLevel: string;
    band: string;
    strengths: string[];
    concerns: string[];
  };
  projectReadiness: Array<{
    sessionId: string;
    label: string;
    status: string;
    score: number;
    band: string;
    recommendation: string;
  }>;
  deliveryRisks: Array<{
    sessionId: string;
    label: string;
    score: number;
    level: string;
    drivers: Array<{ label: string; severity: string; detail: string }>;
  }>;
  recommendations: Array<{
    id: string;
    priority: string;
    title: string;
    action: string;
    source: string;
    impactScore: number;
  }>;
  investmentPriorities: Array<{
    id: string;
    title: string;
    category: string;
    priorityScore: number;
    rationale: string;
    expectedLeverage: string;
  }>;
  narrative: {
    headline: string;
    summary: string;
    nextSteps: string[];
  };
  sources: {
    sessionCount: number;
    knowledgePatterns: number;
    similarPairCount: number;
    improvementSuggestions: number;
    recommendationAcceptRate: number;
  };
};

const BAND_LABEL: Record<string, string> = {
  healthy: "健康",
  watch: "关注",
  at_risk: "风险",
  critical: "危急",
};

const PRIORITY_CLASS: Record<string, string> = {
  P0: "border-rose-900 text-rose-300",
  P1: "border-amber-800 text-amber-200",
  P2: "border-zinc-600 text-zinc-300",
  P3: "border-zinc-700 text-zinc-500",
};

export function IntakeDecisionDashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/decision");
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

  const sc = report?.executiveScorecard;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pilot P18</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">企业决策支持</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            组合分析、对标、跨项目、知识与治理输出，生成高管记分卡、就绪度、交付风险与投资优先级。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/pilot/v80/intake/decision?download=1"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            导出决策报告
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

      {report && sc ? (
        <>
          <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">{report.narrative.headline}</h2>
            <p className="mt-2 text-sm text-zinc-400">{report.narrative.summary}</p>
            <ul className="mt-3 space-y-1 text-xs text-emerald-400/80">
              {report.narrative.nextSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="组织健康度"
              value={String(sc.overallHealth)}
              hint={BAND_LABEL[sc.band] ?? sc.band}
            />
            <Stat label="就绪指数" value={String(sc.readinessIndex)} />
            <Stat label="风险指数" value={String(sc.riskIndex)} hint="越高风险越大" />
            <Stat label="知识杠杆" value={String(sc.knowledgeLeverage)} />
            <Stat
              label="对标/成熟度"
              value={String(sc.benchmarkScore)}
              hint={sc.maturityLevel}
            />
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-200">优势信号</h3>
              <ul className="mt-2 space-y-1 text-xs text-emerald-400/90">
                {sc.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
                {sc.strengths.length === 0 ? (
                  <li className="text-zinc-500">暂无显著优势</li>
                ) : null}
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-200">关注点</h3>
              <ul className="mt-2 space-y-1 text-xs text-amber-200/90">
                {sc.concerns.map((s) => (
                  <li key={s}>{s}</li>
                ))}
                {sc.concerns.length === 0 ? (
                  <li className="text-zinc-500">暂无显著关注点</li>
                ) : null}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-200">决策建议</h3>
            <ul className="mt-3 space-y-2">
              {report.recommendations.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] ${PRIORITY_CLASS[r.priority] ?? ""}`}
                    >
                      {r.priority}
                    </span>
                    <span className="font-medium text-zinc-200">{r.title}</span>
                    <span className="text-zinc-600">{r.source}</span>
                    <span className="tabular-nums text-zinc-500">影响 {r.impactScore}</span>
                  </div>
                  <p className="mt-1 text-emerald-400/80">{r.action}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-200">项目就绪度</h3>
              <ul className="mt-2 space-y-2 text-xs">
                {report.projectReadiness.slice(0, 8).map((p) => (
                  <li key={p.sessionId} className="border-b border-zinc-900/80 pb-2">
                    <div className="flex justify-between gap-2 text-zinc-300">
                      <span>{p.label}</span>
                      <span className="tabular-nums">
                        {p.score} · {BAND_LABEL[p.band] ?? p.band}
                      </span>
                    </div>
                    <p className="mt-0.5 text-zinc-500">{p.recommendation}</p>
                  </li>
                ))}
                {report.projectReadiness.length === 0 ? (
                  <li className="text-zinc-500">当前无在途会话</li>
                ) : null}
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-200">交付风险</h3>
              <ul className="mt-2 space-y-2 text-xs">
                {report.deliveryRisks.slice(0, 8).map((r) => (
                  <li key={r.sessionId} className="border-b border-zinc-900/80 pb-2">
                    <div className="flex justify-between gap-2 text-zinc-300">
                      <span>{r.label}</span>
                      <span className="tabular-nums text-rose-300/90">
                        {r.score} · {BAND_LABEL[r.level] ?? r.level}
                      </span>
                    </div>
                    <p className="mt-0.5 text-zinc-500">
                      {r.drivers.map((d) => d.detail).join("；")}
                    </p>
                  </li>
                ))}
                {report.deliveryRisks.length === 0 ? (
                  <li className="text-zinc-500">暂无风险样本</li>
                ) : null}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-200">投资优先级</h3>
            <ul className="mt-3 space-y-2">
              {report.investmentPriorities.map((i) => (
                <li
                  key={i.id}
                  className="rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-200">{i.title}</span>
                    <span className="tabular-nums text-zinc-500">优先级 {i.priorityScore}</span>
                    <span className="text-zinc-600">{i.category}</span>
                  </div>
                  <p className="mt-1 text-zinc-500">{i.rationale}</p>
                  <p className="mt-0.5 text-sky-300/80">{i.expectedLeverage}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[10px] text-zinc-600">
            会话 {report.sources.sessionCount} · 知识 {report.sources.knowledgePatterns} ·
            相似对 {report.sources.similarPairCount} · 改进建议{" "}
            {report.sources.improvementSuggestions} · 接受率{" "}
            {(report.sources.recommendationAcceptRate * 100).toFixed(0)}% · hash{" "}
            {report.contentHash.slice(0, 16)}… ·{" "}
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
      {hint ? <div className="mt-1 text-[10px] text-zinc-600">{hint}</div> : null}
    </div>
  );
}
