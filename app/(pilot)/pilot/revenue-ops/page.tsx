"use client";

import { RevenueOpsDashboard } from "@/components/pilot/RevenueOpsDashboard";

export default function PilotRevenueOpsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V87 — Revenue Ops</h1>
        <p className="mt-2 text-sm text-zinc-400">
          收入预测控制 · 风险队列 · 负责人工作流 · 只写收入状态
        </p>
      </div>

      <RevenueOpsDashboard />
    </div>
  );
}
