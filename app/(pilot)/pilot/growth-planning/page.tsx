"use client";

import { GrowthPlanningDashboard } from "@/components/pilot/GrowthPlanningDashboard";

export default function PilotGrowthPlanningPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V88 — Growth Planning</h1>
        <p className="mt-2 text-sm text-zinc-400">
          增长预测 · 机会队列 · 规划工作流 · 只写增长状态
        </p>
      </div>

      <GrowthPlanningDashboard />
    </div>
  );
}
