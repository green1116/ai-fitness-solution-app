"use client";

import { AccountHealthDashboard } from "@/components/pilot/AccountHealthDashboard";

export default function PilotAccountHealthPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V85 — Account Health & Renewal</h1>
        <p className="mt-2 text-sm text-zinc-400">
          账户健康评分 · 续约预测 · 风险徽章 · 只读预测层
        </p>
      </div>

      <AccountHealthDashboard />
    </div>
  );
}
