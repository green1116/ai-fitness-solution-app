"use client";

import { useCallback, useEffect, useState } from "react";

type Match = {
  sessionId: string;
  label: string;
  status: string;
  similarity: number;
  overlapSummary: string;
  dimensions: Array<{ id: string; label: string; score: number; weight: number }>;
};

type Artifact = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  sourceLabel: string;
  similarity: number;
  fieldPath?: string;
};

type Comparison = {
  similarity: number;
  rows: Array<{
    dimension: string;
    queryValue: string;
    matchValue: string;
    overlap: number;
  }>;
};

type Report = {
  insight: {
    headline: string;
    matchCount: number;
    topSimilarity: number;
    reusableArtifactCount: number;
    strengths: string[];
    gaps: string[];
  };
  matches: Match[];
  reuseArtifacts: Artifact[];
  comparison?: Comparison;
};

type Props = {
  sessionId: string;
  readOnly?: boolean;
};

const KIND_LABEL: Record<string, string> = {
  requirement: "需求",
  equipment: "设备",
  standard: "标准",
  clarification: "澄清",
  compliance: "合规",
  execution: "执行",
};

export function IntakeCrossProjectPanel({ sessionId, readOnly = false }: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [compareWith, setCompareWith] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (compare?: string) => {
      setBusy(true);
      setError("");
      try {
        const q = compare ? `?compareWith=${encodeURIComponent(compare)}` : "";
        const res = await fetch(
          `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/similarity${q}`,
        );
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.code || "LOAD_FAILED");
        setReport(data.report);
        if (!compare && data.report?.matches?.[0]?.sessionId) {
          setCompareWith(data.report.matches[0].sessionId);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "LOAD_FAILED");
      } finally {
        setBusy(false);
      }
    },
    [sessionId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">跨项目复用</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {report?.insight.headline ?? "检索相似历史项目与可复用经验"}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void load(compareWith)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-50"
          >
            {busy ? "检索中…" : "刷新相似"}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}

      {report ? (
        <>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-zinc-500">
            <span>匹配 {report.insight.matchCount}</span>
            <span>最高 {(report.insight.topSimilarity * 100).toFixed(0)}%</span>
            <span>可复用 {report.insight.reusableArtifactCount}</span>
          </div>

          {(report.insight.strengths.length > 0 || report.insight.gaps.length > 0) ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[10px]">
              <ul className="space-y-0.5 text-emerald-400/80">
                {report.insight.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <ul className="space-y-0.5 text-amber-200/80">
                {report.insight.gaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {report.matches.map((m) => (
              <li
                key={m.sessionId}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  compareWith === m.sessionId
                    ? "border-sky-800 bg-sky-950/20"
                    : "border-zinc-800/80"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-zinc-200">{m.label}</span>
                    <span className="ml-2 text-zinc-500">{m.status}</span>
                    <p className="mt-0.5 text-zinc-500">{m.overlapSummary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-emerald-400">
                      {(m.similarity * 100).toFixed(0)}%
                    </span>
                    {!readOnly ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setCompareWith(m.sessionId);
                          void load(m.sessionId);
                        }}
                        className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400"
                      >
                        对比
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
            {report.matches.length === 0 ? (
              <li className="text-xs text-zinc-500">暂无相似历史项目。</li>
            ) : null}
          </ul>

          {report.comparison ? (
            <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full min-w-[480px] text-left text-[10px]">
                <thead className="border-b border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="px-2 py-1.5">维度</th>
                    <th className="px-2 py-1.5">当前</th>
                    <th className="px-2 py-1.5">相似项目</th>
                    <th className="px-2 py-1.5">重叠</th>
                  </tr>
                </thead>
                <tbody>
                  {report.comparison.rows.map((r) => (
                    <tr key={r.dimension} className="border-b border-zinc-900/80 text-zinc-400">
                      <td className="px-2 py-1.5 text-zinc-300">{r.dimension}</td>
                      <td className="px-2 py-1.5">{r.queryValue}</td>
                      <td className="px-2 py-1.5">{r.matchValue}</td>
                      <td className="px-2 py-1.5 tabular-nums">
                        {(r.overlap * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-3">
            <h4 className="text-xs font-medium text-zinc-300">可复用经验</h4>
            <ul className="mt-2 space-y-1.5">
              {report.reuseArtifacts.map((a) => (
                <li
                  key={a.id}
                  className="rounded border border-zinc-800/80 px-2 py-1.5 text-[10px] text-zinc-400"
                >
                  <span className="rounded border border-zinc-700 px-1 text-zinc-500">
                    {KIND_LABEL[a.kind] ?? a.kind}
                  </span>
                  <span className="ml-2 text-zinc-200">{a.title}</span>
                  <span className="ml-2 text-zinc-600">来自 {a.sourceLabel}</span>
                  <p className="mt-0.5 text-emerald-400/80">{a.detail}</p>
                </li>
              ))}
              {report.reuseArtifacts.length === 0 ? (
                <li className="text-[10px] text-zinc-500">暂无可复用条目。</li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
