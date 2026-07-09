"use client";

import { PortfolioOpsDashboard } from "@/components/pilot/PortfolioOpsDashboard";

export default function PilotPortfolioOpsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V91 — Portfolio Ops</h1>
        <p className="mt-2 text-sm text-zinc-400">
          战略队列 · 负责人工作流 · 账户战略视图 · 只写组合运营状态
        </p>
      </div>

      <PortfolioOpsDashboard />
    </div>
  );
}
