"use client";

import type { RuntimeVisualizationDashboard } from "@/lib/evidence/types";

type Props = {
  loading?: boolean;
  error?: string | null;
  data: RuntimeVisualizationDashboard | null;
  onRefresh?: () => void;
  canRefresh?: boolean;
};

const STATUS_STYLES = {
  healthy: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  critical: "border-red-500/40 bg-red-500/10 text-red-200",
} as const;

const GATE_STYLES = {
  approved: "text-emerald-300",
  conditional: "text-amber-300",
  blocked: "text-red-300",
} as const;

function statusLabel(status: keyof typeof STATUS_STYLES): string {
  switch (status) {
    case "healthy":
      return "正常";
    case "warning":
      return "关注";
    case "critical":
      return "严重";
    default:
      return status;
  }
}

export default function ExecutiveRuntimeVisualizationPanel({
  loading,
  error,
  data,
  onRefresh,
  canRefresh,
}: Props) {
  return (
    <div
      className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-testid="executive-runtime-visualization-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-white/45">
            Tender Operating Dashboard
          </div>
          <div className="mt-1 text-sm font-medium text-white">
            Executive Runtime Visualization (V3.4-E12)
          </div>
          <p className="mt-1 text-xs text-white/50">
            确定性运行时状态 · 无 AI 推断
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            disabled={!canRefresh || loading}
            onClick={onRefresh}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "加载中…" : "刷新 Runtime 看板"}
          </button>
        ) : null}
      </div>

      {error ? <div className="mt-3 text-sm text-red-300/90">{error}</div> : null}

      {!data && !loading && !error ? (
        <p className="mt-3 text-sm text-white/50">
          上传或粘贴招标文件后，点击「刷新 Runtime 看板」生成高管运行时可视化。
        </p>
      ) : null}

      {loading ? (
        <div className="mt-4 text-sm text-white/60">构建可视化面板…</div>
      ) : null}

      {data ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs text-white/45">Executive Score</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {data.executiveScore}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs text-white/45">Executive Gate</div>
              <div
                className={`mt-1 text-lg font-semibold ${GATE_STYLES[data.executiveGate]}`}
              >
                {data.executiveGate}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs text-white/45">Release Decision</div>
              <div className="mt-1 text-sm font-medium text-white/90">
                {data.releaseDecision}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs text-white/45">Releasable</div>
              <div
                className={`mt-1 text-lg font-semibold ${data.releasable ? "text-emerald-300" : "text-red-300"}`}
              >
                {data.releasable ? "YES" : "NO"}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/45">
              Runtime Metrics
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.metrics.map((m) => (
                <div
                  key={m.label}
                  className={`rounded-lg border px-3 py-2 ${STATUS_STYLES[m.status]}`}
                >
                  <div className="text-xs opacity-80">{m.label}</div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <span className="text-lg font-semibold">{m.score}</span>
                    <span className="text-xs">{statusLabel(m.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/45">
              Pipeline
            </div>
            <div className="flex flex-wrap gap-2">
              {data.pipeline.map((stage) => (
                <span
                  key={stage.id}
                  title={stage.summary}
                  className={`rounded-full border px-2.5 py-1 text-xs ${STATUS_STYLES[stage.status]}`}
                >
                  {stage.label}: {statusLabel(stage.status)}
                </span>
              ))}
            </div>
          </div>

          {data.findings.length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium text-white/45">Findings</div>
              <ul className="list-inside list-disc space-y-1 text-sm text-white/75">
                {data.findings.map((f, i) => (
                  <li key={`${i}-${f.slice(0, 24)}`}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.blockReasons.length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium text-red-300/80">
                Block Reasons
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-red-200/80">
                {data.blockReasons.map((r, i) => (
                  <li key={`b-${i}`}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.conditionalReleaseReasons.length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium text-amber-300/80">
                Conditional Release
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-amber-100/80">
                {data.conditionalReleaseReasons.map((r, i) => (
                  <li key={`c-${i}`}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.recommendations.length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium text-white/45">
                Recommendations
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-white/70">
                {data.recommendations.map((r, i) => (
                  <li key={`r-${i}`}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
