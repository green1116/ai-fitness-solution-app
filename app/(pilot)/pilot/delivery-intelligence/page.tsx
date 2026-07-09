"use client";

import { Suspense } from "react";

import { DeliveryIntelligenceDashboard } from "@/components/pilot/DeliveryIntelligenceDashboard";

export default function PilotDeliveryIntelligencePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V83 — Delivery Intelligence</h1>
        <p className="mt-2 text-sm text-zinc-400">
          可执行优化 · 洞察 · 推荐行动 · 优先级排序 · 只读
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
        <DeliveryIntelligenceDashboard />
      </Suspense>
    </div>
  );
}
