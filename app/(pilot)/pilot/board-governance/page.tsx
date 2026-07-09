"use client";

import { BoardGovernanceDashboard } from "@/components/pilot/BoardGovernanceDashboard";

export default function PilotBoardGovernancePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V92 — Board Governance</h1>
        <p className="mt-2 text-sm text-zinc-400">
          高管治理队列 · 董事会决策 · 只写治理状态
        </p>
      </div>

      <BoardGovernanceDashboard />
    </div>
  );
}
