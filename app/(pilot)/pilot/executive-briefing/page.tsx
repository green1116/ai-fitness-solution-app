"use client";

import { BriefingDashboard } from "@/components/pilot/BriefingDashboard";

export default function PilotExecutiveBriefingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V94 — Executive Briefing</h1>
        <p className="mt-2 text-sm text-zinc-400">
          高管简报 · 决策支持 · 行动工作流 · 只写简报缓存
        </p>
      </div>

      <BriefingDashboard />
    </div>
  );
}
