"use client";

import React from "react";

type SimulationItem = {
  label?: string;
  title?: string;
  name?: string;
  score?: number;
  delta?: number;
  description?: string;
  summary?: string;
};

export type TenderScoreSimulationPayload = {
  simulations?: SimulationItem[] | null;
  [key: string]: unknown;
};

type Props = {
  simulations?: SimulationItem[] | null;
  result?: TenderScoreSimulationPayload | null;
  loading?: boolean;
  className?: string;
  profileName?: string;
  source?: string;
};

export default function TenderScoreSimulationCard({
  simulations,
  result,
  loading = false,
  className = "",
}: Props) {
  const safeSimulations = Array.isArray(simulations)
    ? simulations
    : Array.isArray(result?.simulations)
    ? result.simulations
    : [];

  if (loading) {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}
      >
        <div className="text-sm text-white/70">评分模拟分析加载中...</div>
      </div>
    );
  }

  if (!safeSimulations.length) {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}
      >
        <div className="text-sm font-medium text-white">评分模拟分析</div>
        <div className="mt-2 text-sm text-white/60">暂无可展示的模拟结果</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}
    >
      <div className="text-sm font-medium text-white">评分模拟分析</div>

      <div className="mt-3 space-y-3">
        {safeSimulations.map((item, index) => {
          const title =
            item.label || item.title || item.name || `情景 ${index + 1}`;
          const scoreText =
            typeof item.score === "number" ? `${item.score}` : "--";
          const deltaText =
            typeof item.delta === "number"
              ? `${item.delta > 0 ? "+" : ""}${item.delta}`
              : null;
          const desc = item.description || item.summary || "";

          return (
            <div
              key={`${title}-${index}`}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{title}</div>
                <div className="text-sm text-white/80">{scoreText}</div>
              </div>

              {deltaText ? (
                <div className="mt-1 text-xs text-amber-300">
                  分数变化：{deltaText}
                </div>
              ) : null}

              {desc ? (
                <div className="mt-2 text-xs leading-6 text-white/65">
                  {desc}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}