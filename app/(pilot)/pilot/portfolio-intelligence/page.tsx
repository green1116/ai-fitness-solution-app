"use client";

import { PortfolioDashboard } from "@/components/pilot/PortfolioDashboard";

export default function PilotPortfolioPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V90 — Portfolio Intelligence</h1>
        <p className="mt-2 text-sm text-zinc-400">
          组合细分 · 智能评分 · 优先级排名 · 只读上游 + 组合缓存
        </p>
      </div>

      <PortfolioDashboard />
    </div>
  );
}
