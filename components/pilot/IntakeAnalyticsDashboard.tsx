"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type AnalyticsReport = {
  version: string;
  generatedAt: string;
  window: { from?: string; to?: string; sessionCount: number };
  kpis: {
    totalSessions: number;
    byStatus: Record<string, number>;
    readyRate: number;
    failedRate: number;
    qaPassedRate: number;
    withProjectRate: number;
    duration: {
      sampleSize: number;
      avgMs: number;
      medianMs: number;
      p90Ms: number;
    };
    clarifications: {
      sessionsWithClarifications: number;
      totalQuestions: number;
      open: number;
      answered: number;
      skipped: number;
      blockingOpen: number;
      avgRound: number;
    };
    confidence: {
      high: number;
      medium: number;
      low: number;
      withEvidence: number;
      withoutEvidence: number;
      totalItems: number;
    };
    compliance: {
      sessionsEvaluated: number;
      passed: number;
      blocked: number;
      findingsBySeverity: { blocking: number; warning: number; info: number };
      findingsByCategory: Record<string, number>;
      topRuleIds: Array<{ ruleId: string; count: number }>;
    };
    documents: {
      totalDocuments: number;
      multiDocSessions: number;
      singleDocSessions: number;
      byDocType: Record<string, number>;
      avgDocumentsPerSession: number;
      conflictCount: number;
    };
    bootstrap: {
      sessionsWithBootstrap: number;
      readyCount: number;
      avgMilestones: number;
      avgTasks: number;
      avgOwners: number;
    };
  };
  trends: Array<{
    date: string;
    sessionsCreated: number;
    sessionsReady: number;
    clarificationsAnswered: number;
    complianceBlocked: number;
    bootstrapsSeeded: number;
  }>;
};

function pct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function fmtDuration(ms: number): string {
  if (!ms) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

export function IntakeAnalyticsDashboard() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/analytics");
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

  const k = report?.kpis;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Intake 智能分析
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          只读聚合历史 Intake：时长、澄清、证据置信度、合规、多文档与启动种子 KPI。
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          刷新
        </button>
        <a
          href="/api/pilot/v80/intake/analytics?download=1"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          导出 JSON
        </a>
        <Link href="/pilot/ops" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white">
          运维异常
        </Link>
        <Link href="/pilot/intake" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white">
          Intake
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">加载中…</p>
      ) : !report || !k ? (
        <p className="text-sm text-zinc-500">暂无数据</p>
      ) : (
        <>
          <p className="text-xs text-zinc-500">
            {report.version} · 会话 {report.window.sessionCount} · 生成于{" "}
            {report.generatedAt}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "会话总数", value: String(k.totalSessions) },
              { label: "就绪率", value: pct(k.readyRate) },
              { label: "QA 通过率", value: pct(k.qaPassedRate) },
              { label: "已建项目率", value: pct(k.withProjectRate) },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3"
              >
                <p className="text-xs text-zinc-500">{card.label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-medium text-zinc-200">处理时长</h2>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <div>
                  <dt>样本</dt>
                  <dd className="text-zinc-200">{k.duration.sampleSize}</dd>
                </div>
                <div>
                  <dt>平均</dt>
                  <dd className="text-zinc-200">{fmtDuration(k.duration.avgMs)}</dd>
                </div>
                <div>
                  <dt>中位</dt>
                  <dd className="text-zinc-200">{fmtDuration(k.duration.medianMs)}</dd>
                </div>
                <div>
                  <dt>P90</dt>
                  <dd className="text-zinc-200">{fmtDuration(k.duration.p90Ms)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-zinc-500">
                失败率 {pct(k.failedRate)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-medium text-zinc-200">状态分布</h2>
              <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                {Object.entries(k.byStatus)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <li key={status} className="flex justify-between">
                      <span>{status}</span>
                      <span className="text-zinc-200">{count}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-medium text-zinc-200">澄清统计</h2>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <div>
                  <dt>有澄清会话</dt>
                  <dd className="text-zinc-200">{k.clarifications.sessionsWithClarifications}</dd>
                </div>
                <div>
                  <dt>平均轮次</dt>
                  <dd className="text-zinc-200">{k.clarifications.avgRound}</dd>
                </div>
                <div>
                  <dt>已答 / 待答 / 跳过</dt>
                  <dd className="text-zinc-200">
                    {k.clarifications.answered} / {k.clarifications.open} /{" "}
                    {k.clarifications.skipped}
                  </dd>
                </div>
                <div>
                  <dt>阻断待答</dt>
                  <dd className="text-amber-300">{k.clarifications.blockingOpen}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-medium text-zinc-200">证据置信度</h2>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-400">
                <div>
                  <dt>高</dt>
                  <dd className="text-emerald-300">{k.confidence.high}</dd>
                </div>
                <div>
                  <dt>中</dt>
                  <dd className="text-amber-300">{k.confidence.medium}</dd>
                </div>
                <div>
                  <dt>低</dt>
                  <dd className="text-rose-300">{k.confidence.low}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-zinc-500">
                有证据 {k.confidence.withEvidence} / 无证据{" "}
                {k.confidence.withoutEvidence}（共 {k.confidence.totalItems}）
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-medium text-zinc-200">合规分布</h2>
              <p className="mt-2 text-xs text-zinc-400">
                已评 {k.compliance.sessionsEvaluated} · 通过 {k.compliance.passed} ·
                阻断 {k.compliance.blocked}
              </p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-zinc-400">
                <div>
                  <dt>blocking</dt>
                  <dd className="text-rose-300">{k.compliance.findingsBySeverity.blocking}</dd>
                </div>
                <div>
                  <dt>warning</dt>
                  <dd className="text-amber-300">{k.compliance.findingsBySeverity.warning}</dd>
                </div>
                <div>
                  <dt>info</dt>
                  <dd className="text-zinc-200">{k.compliance.findingsBySeverity.info}</dd>
                </div>
              </dl>
              <ul className="mt-3 space-y-1 text-[11px] text-zinc-500">
                {k.compliance.topRuleIds.map((r) => (
                  <li key={r.ruleId} className="flex justify-between">
                    <span className="font-mono">{r.ruleId}</span>
                    <span>{r.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-medium text-zinc-200">文档与启动种子</h2>
              <p className="mt-2 text-xs text-zinc-400">
                文档 {k.documents.totalDocuments} · 多文档会话{" "}
                {k.documents.multiDocSessions} · 冲突 {k.documents.conflictCount} ·
                均文档数 {k.documents.avgDocumentsPerSession}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                {Object.entries(k.documents.byDocType).map(([t, c]) => (
                  <li key={t} className="flex justify-between">
                    <span>{t}</span>
                    <span className="text-zinc-200">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-zinc-400">
                Bootstrap {k.bootstrap.sessionsWithBootstrap} · 可启动{" "}
                {k.bootstrap.readyCount} · 均里程碑 {k.bootstrap.avgMilestones} ·
                均任务 {k.bootstrap.avgTasks}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-medium text-zinc-200">趋势（按创建日）</h2>
            {report.trends.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-600">暂无趋势点</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs text-zinc-400">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="py-1 pr-3 font-medium">日期</th>
                      <th className="py-1 pr-3 font-medium">新建</th>
                      <th className="py-1 pr-3 font-medium">就绪</th>
                      <th className="py-1 pr-3 font-medium">澄清答</th>
                      <th className="py-1 pr-3 font-medium">合规阻断</th>
                      <th className="py-1 font-medium">Bootstrap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.trends.map((t) => (
                      <tr key={t.date} className="border-t border-zinc-900">
                        <td className="py-1.5 pr-3 font-mono text-zinc-300">{t.date}</td>
                        <td className="py-1.5 pr-3">{t.sessionsCreated}</td>
                        <td className="py-1.5 pr-3">{t.sessionsReady}</td>
                        <td className="py-1.5 pr-3">{t.clarificationsAnswered}</td>
                        <td className="py-1.5 pr-3">{t.complianceBlocked}</td>
                        <td className="py-1.5">{t.bootstrapsSeeded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
