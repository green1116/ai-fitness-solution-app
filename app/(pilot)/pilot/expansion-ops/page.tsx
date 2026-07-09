"use client";

import { ExpansionOpsDashboard } from "@/components/pilot/ExpansionOpsDashboard";

export default function PilotExpansionOpsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V89 — Expansion Ops</h1>
        <p className="mt-2 text-sm text-zinc-400">
          扩展执行 · 优先级队列 · 账户增长视图 · 只写扩展状态
        </p>
      </div>

      <ExpansionOpsDashboard />
    </div>
  );
}
