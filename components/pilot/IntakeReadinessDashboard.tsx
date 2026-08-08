"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Check = {
  id: string;
  category: string;
  title: string;
  status: "pass" | "fail" | "warn" | "skip";
  message: string;
};

type Report = {
  generatedAt: string;
  contentHash: string;
  band: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    passRate: number;
  };
  checks: Check[];
  coverage: {
    apiRoutesExpected: number;
    apiRoutesFound: number;
    uiPagesExpected: number;
    uiPagesFound: number;
    navLinksExpected: number;
    navLinksFound: number;
    verifyScriptsExpected: number;
    verifyScriptsFound: number;
  };
  regressionCatalog: Array<{ pilot: string; script: string; present: boolean }>;
  narrative: {
    headline: string;
    blockers: string[];
    nextActions: string[];
  };
};

const STATUS_CLASS: Record<string, string> = {
  pass: "border-emerald-800 text-emerald-300",
  fail: "border-rose-900 text-rose-300",
  warn: "border-amber-800 text-amber-200",
  skip: "border-zinc-700 text-zinc-500",
};

const BAND_LABEL: Record<string, string> = {
  ready: "就绪",
  conditional: "有条件就绪",
  blocked: "未就绪",
};

export function IntakeReadinessDashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/readiness");
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
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pilot P19</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">生产就绪硬化</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            端到端集成、路由/导航覆盖、确定性、审计、导出与重试恢复能力的生产就绪检查。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/pilot/v80/intake/readiness?download=1"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            导出报告
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200"
          >
            重新检查
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-500">检查中…</p> : null}

      {report ? (
        <>
          <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">{report.narrative.headline}</h2>
            <p className="mt-2 text-xs text-zinc-400">
              状态：{BAND_LABEL[report.band] ?? report.band} · 通过率{" "}
              {(report.summary.passRate * 100).toFixed(0)}%（{report.summary.passed}/
              {report.summary.total}）
            </p>
            {report.narrative.blockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-rose-300">
                {report.narrative.blockers.map((b) => (
                  <li key={b}>阻断：{b}</li>
                ))}
              </ul>
            ) : null}
            <ul className="mt-2 space-y-1 text-xs text-emerald-400/80">
              {report.narrative.nextActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="通过" value={String(report.summary.passed)} />
            <Stat label="失败" value={String(report.summary.failed)} />
            <Stat label="警告" value={String(report.summary.warnings)} />
            <Stat
              label="就绪档位"
              value={BAND_LABEL[report.band] ?? report.band}
            />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="API 路由"
              value={`${report.coverage.apiRoutesFound}/${report.coverage.apiRoutesExpected}`}
            />
            <Stat
              label="UI 页面"
              value={`${report.coverage.uiPagesFound}/${report.coverage.uiPagesExpected}`}
            />
            <Stat
              label="导航链接"
              value={`${report.coverage.navLinksFound}/${report.coverage.navLinksExpected}`}
            />
            <Stat
              label="回归脚本"
              value={`${report.coverage.verifyScriptsFound}/${report.coverage.verifyScriptsExpected}`}
            />
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-200">检查项</h3>
            <ul className="mt-3 space-y-2">
              {report.checks.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] ${STATUS_CLASS[c.status]}`}
                    >
                      {c.status}
                    </span>
                    <span className="text-zinc-500">{c.category}</span>
                    <span className="font-medium text-zinc-200">{c.title}</span>
                  </div>
                  <p className="mt-1 text-zinc-500">{c.message}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-200">回归套件目录（P1–P18）</h3>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2 text-xs">
              {report.regressionCatalog.map((r) => (
                <li key={r.script} className="text-zinc-400">
                  <span className={r.present ? "text-emerald-400" : "text-rose-400"}>
                    {r.present ? "✓" : "✗"}
                  </span>{" "}
                  {r.pilot} · {r.script.replace("scripts/", "")}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] text-zinc-600">
              完整回归：npx tsx scripts/verify-pilot-regression.ts
            </p>
          </section>

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
