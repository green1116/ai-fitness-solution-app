"use client";

import { EnforcementDashboard } from "@/components/pilot/EnforcementDashboard";

export default function PilotPolicyEnforcementPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V98 — Policy Enforcement</h1>
        <p className="mt-2 text-sm text-zinc-400">
          合规自动化 · 策略执行 · 到期工作流 · 只写执行缓存
        </p>
      </div>

      <EnforcementDashboard />
    </div>
  );
}
