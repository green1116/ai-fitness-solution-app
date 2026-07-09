"use client";

import { ExecutiveActionDashboard } from "@/components/pilot/ExecutiveActionDashboard";

export default function PilotExecutiveActionsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V95 — Executive Actions</h1>
        <p className="mt-2 text-sm text-zinc-400">
          高管行动 · 治理闭环 · 负责人工作流 · 只写行动缓存
        </p>
      </div>

      <ExecutiveActionDashboard />
    </div>
  );
}
