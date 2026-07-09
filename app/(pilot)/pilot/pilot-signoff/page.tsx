"use client";

import { PilotSignoffDashboard } from "@/components/pilot/PilotSignoffDashboard";

export default function PilotSignoffPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V100 — Pilot Sign-off</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Pilot 最终签收 · 基线冻结 · 发布清单 · 回滚索引 · 只写签收状态缓存
        </p>
      </div>

      <PilotSignoffDashboard />
    </div>
  );
}
