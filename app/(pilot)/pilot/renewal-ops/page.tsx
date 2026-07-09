"use client";

import { RenewalOpsDashboard } from "@/components/pilot/RenewalOpsDashboard";

export default function PilotRenewalOpsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V86 — Renewal Ops</h1>
        <p className="mt-2 text-sm text-zinc-400">
          续约管道 · 流失防控 · 负责人工作流 · 只写续约状态
        </p>
      </div>

      <RenewalOpsDashboard />
    </div>
  );
}
