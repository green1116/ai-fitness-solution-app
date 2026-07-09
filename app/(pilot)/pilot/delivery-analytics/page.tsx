"use client";

import { DeliveryAnalyticsDashboard } from "@/components/pilot/DeliveryAnalyticsDashboard";

export default function PilotDeliveryAnalyticsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V82 — Delivery Analytics & SLA</h1>
        <p className="mt-2 text-sm text-zinc-400">
          发布后分析与 SLA 监控 · 告警 · 会话时间线 · 只读
        </p>
      </div>

      <DeliveryAnalyticsDashboard />
    </div>
  );
}
