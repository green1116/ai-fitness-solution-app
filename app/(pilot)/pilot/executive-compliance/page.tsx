"use client";

import { ComplianceDashboard } from "@/components/pilot/ComplianceDashboard";

export default function PilotExecutiveCompliancePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V97 — Executive Compliance</h1>
        <p className="mt-2 text-sm text-zinc-400">
          合规审阅 · 保留策略 · 审阅工作流 · 只写合规缓存
        </p>
      </div>

      <ComplianceDashboard />
    </div>
  );
}
