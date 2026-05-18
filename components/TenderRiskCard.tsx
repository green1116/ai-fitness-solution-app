"use client";

import React from "react";

export type TenderRiskPayload = {
  ok: true;
  level: "safe" | "caution" | "high";
  score: number;
  summary: {
    techPending: number;
    bizPending: number;
    deviations: number;
    missingAttachments: number;
  };
  missingAttachments: string[];
  topRisks: string[];
};

type Props = {
  risk: TenderRiskPayload | null;
  loading?: boolean;
  onOptimize?: () => void;
  optimizeLoading?: boolean;
  hasRowsForOptimize?: boolean;
};

export default function TenderRiskCard({
  risk,
  loading = false,
  onOptimize,
  optimizeLoading = false,
  hasRowsForOptimize = false,
}: Props) {
  console.log("[TenderRiskCard] render", {
    hasRisk: !!risk,
    loading,
    optimizeLoading,
    hasRowsForOptimize,
    level: risk?.level ?? null,
    score: risk?.score ?? null,
  });

  if (loading) {
    return (
      <div className="mb-5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/60">
        正在评估投标风险…
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        风险数据为空（risk is null）
      </div>
    );
  }

  const levelMap = {
    safe: { text: "建议投标", emoji: "✅", color: "#16a34a" },
    caution: { text: "谨慎投", emoji: "⚠️", color: "#f59e0b" },
    high: { text: "不建议投", emoji: "❌", color: "#dc2626" },
  } as const;

  const lv = levelMap[risk.level];
  const canOptimize =
    typeof onOptimize === "function" && hasRowsForOptimize && !optimizeLoading;

  return (
    <div
      className="mb-5 rounded-xl px-4 py-4"
      style={{
        border: `1px solid ${lv.color}`,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <h3 className="text-base font-semibold" style={{ color: lv.color }}>
        投标评估：{lv.text} {lv.emoji}
      </h3>

      <p className="mt-2 text-sm text-white/85">综合评分：{risk.score}</p>

      <ul className="mt-2 list-inside list-disc text-sm text-white/75">
        <li>技术待确认：{risk.summary.techPending}</li>
        <li>商务待确认：{risk.summary.bizPending}</li>
        <li>偏离项：{risk.summary.deviations}</li>
        <li>缺失附件：{risk.summary.missingAttachments}</li>
      </ul>

      {risk.missingAttachments?.length > 0 ? (
        <div className="mt-3 text-sm text-white/80">
          <span className="font-medium text-white">缺失附件：</span>
          {risk.missingAttachments.join(", ")}
        </div>
      ) : null}

      {risk.topRisks?.length > 0 ? (
        <div className="mt-2 text-sm text-white/80">
          <span className="font-medium text-white">重点风险条款：</span>
          {risk.topRisks.join(", ")}
        </div>
      ) : null}

      {typeof onOptimize === "function" ? (
        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={!canOptimize}
            onClick={() => {
              console.log("[TenderRiskCard CLICK DEBUG]", {
                optimizeLoading,
                hasRowsForOptimize,
                level: risk.level,
                canOptimize,
              });

              if (!canOptimize) return;
              onOptimize();
            }}
            className={[
              "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition",
              !canOptimize
                ? "cursor-not-allowed border border-amber-500/20 bg-amber-500/10 text-amber-100/50 opacity-60"
                : "border border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20",
            ].join(" ")}
          >
            {optimizeLoading
              ? "正在优化…"
              : !hasRowsForOptimize
              ? "当前无可优化项"
              : "🔧 一键优化方案"}
          </button>

          {!hasRowsForOptimize ? (
            <div className="text-xs text-amber-200/80">
              当前未检测到可优化行，或解析结果尚未同步。
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}