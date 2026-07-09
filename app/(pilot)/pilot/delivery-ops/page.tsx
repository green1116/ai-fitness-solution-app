"use client";

import { DeliveryOpsDashboard } from "@/components/pilot/DeliveryOpsDashboard";

export default function PilotDeliveryOpsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V81 — Delivery Ops</h1>
        <p className="mt-2 text-sm text-zinc-400">
          签收后交付运营 · 客户追踪 · 发布包导出 · 只读发布态
        </p>
      </div>

      <DeliveryOpsDashboard />
    </div>
  );
}
