"use client";

import { ReadinessDashboard } from "@/components/pilot/ReadinessDashboard";

export default function PilotProductionReadinessPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V99 — Production Readiness</h1>
        <p className="mt-2 text-sm text-zinc-400">
          平台就绪 · 生产认证 · 门控清单 · 只写认证缓存
        </p>
      </div>

      <ReadinessDashboard />
    </div>
  );
}
