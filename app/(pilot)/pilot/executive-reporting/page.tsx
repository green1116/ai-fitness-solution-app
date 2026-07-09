"use client";

import { ExecutiveReportingDashboard } from "@/components/pilot/ExecutiveReportingDashboard";

export default function PilotExecutiveReportingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V93 — Executive Reporting</h1>
        <p className="mt-2 text-sm text-zinc-400">
          高管报告 · 董事会材料包 · 导出工作流 · 只写报告缓存
        </p>
      </div>

      <ExecutiveReportingDashboard />
    </div>
  );
}
